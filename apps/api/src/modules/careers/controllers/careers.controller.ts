// @ts-nocheck
import type { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '@/utils/response';
import { HTTP_STATUS } from '@pathforge/shared-constants';
import * as profileService from '@/modules/profile/services/profile.service';
import { FeatureExtractionService } from '../services/featureExtraction.service';
import { CareerCatalogService } from '../services/catalog.service';
import { RecommendationHistoryService } from '../services/history.service';
import { RecommendationEngineService } from '../services/recommendationEngine.service';
import { CombinedRecommendationService } from '../services/combinedRecommendation.service';
import { generateAiCompletion } from '@/modules/ai/gateway/aiGateway';
import { AppError } from '@/middleware/error.middleware';

export async function getTrendingJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user!.sub;

    const user = await FeatureExtractionService.fetchStudentData(userId);
    if (!user) {
      sendError(res, {
        message: 'User profile not found',
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
      return;
    }

    const userSkills = user.skills.map(s => s.skill.name).join(', ');
    const userInterests = user.interests?.map((i: any) => i.interest).join(', ') || 'General IT';

    const prompt = `
You are an expert IT career advisor for the Indian market. Provide the current Top 5 trending software/IT job roles specifically for Indian freshers and entry-level candidates (0-2 years experience). 
The user is an engineering student/fresher with the following skills: ${userSkills} and interests: ${userInterests}.

DO NOT include senior roles (e.g. Senior, Lead, Manager, Principal).
ALL salary figures MUST be in Indian Rupees formatted as LPA (e.g. "₹4.5–₹8 LPA"). DO NOT use USD or global averages.
ALL job openings must be for India and entry-level. If exact fresher opening counts in India cannot be verified, explicitly output "Opening count unavailable".

Output the result STRICTLY as a JSON object with a single "jobs" key containing an array of objects.
Each object MUST have exactly these fields:
- jobName: string
- demand: string (e.g. "High", "Very High")
- openings: string (India fresher openings, or "Opening count unavailable")
- averageSalary: string (MUST be in INR LPA, e.g. "₹4–8 LPA" or "₹6 LPA average")
- requiredSkills: array of strings
- preferredSkills: array of strings
- whyTrending: string
- whyCompaniesHire: string
- whatToLearn: string (What a fresher should learn)
- recommendedProjects: string
- interviewPreparation: string
- relevantPathforgeCareer: string
- sources: array of strings
- experienceLevel: string (e.g. "0–1 years", "0–2 years")
- topLocations: array of strings (e.g. ["Bengaluru", "Pune", "Hyderabad"])
- relevanceToUser: string (Address the user directly as 'you')

Do not invent unsupported values as current facts.
Return ONLY the JSON object.
`;

    const result = await generateAiCompletion({ prompt });
    let parsedResponse: any = null;
    try {
      let cleanedText = result.text.trim();
      cleanedText = cleanedText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse AI output', result.text);
      throw new AppError('Invalid JSON format returned from AI provider.', HTTP_STATUS.BAD_GATEWAY, 'AI_PARSE_ERROR');
    }

    if (!parsedResponse || typeof parsedResponse !== 'object' || !Array.isArray(parsedResponse.jobs)) {
      throw new AppError('AI provider returned malformed structured data (missing jobs array).', HTTP_STATUS.BAD_GATEWAY, 'AI_VALIDATION_ERROR');
    }

    const trendingJobs = parsedResponse.jobs;

    if (trendingJobs.length === 0) {
      throw new AppError('AI provider returned an empty list of jobs.', HTTP_STATUS.BAD_GATEWAY, 'AI_VALIDATION_ERROR');
    }

    // Basic validation
    for (const job of trendingJobs) {
      if (!job.jobName || !Array.isArray(job.requiredSkills) || typeof job.whyTrending !== 'string' || !Array.isArray(job.topLocations)) {
        console.error('Validation failed for job:', job);
        throw new AppError('AI provider returned missing or malformed fields in the job data.', HTTP_STATUS.BAD_GATEWAY, 'AI_VALIDATION_ERROR');
      }
    }

    sendSuccess(res, {
      message: 'Trending jobs fetched successfully.',
      data: trendingJobs,
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user!.sub;

    // 1. Fetch user data
    const user = await FeatureExtractionService.fetchStudentData(userId);
    if (!user) {
      sendError(res, {
        message: 'User profile not found',
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
      return;
    }

    // 2. Extract profile completion stats
    const completionStats = await profileService.calculateProfileCompletion(userId);

    // 3. Build StudentRecommendationProfile
    const normalizedProfile = FeatureExtractionService.extractFeatures(user);

    // 4. Run Combined Recommendation Engine
    const { strategyMessage, recommendations, rawProfileCompleteness } = await CombinedRecommendationService.recommendCareers(userId);

    // 5. Save History Snapshot (Async non-blocking)
    RecommendationHistoryService.saveSnapshotIfNeeded(userId, normalizedProfile, recommendations).catch(console.error);

    // 5. Build response payload
    const responsePayload = {
      recommendations,
      strategyMessage,
      generatedAt: new Date().toISOString(),
      profileCompleteness: rawProfileCompleteness,
    };

    sendSuccess(res, {
      message: 'Career recommendations generated successfully.',
      data: responsePayload,
    });
  } catch (err) {
    next(err);
  }
}


import { RoadmapKnowledgeService } from '../services/roadmapKnowledge.service';
import { CareerKnowledgeService } from '../services/careerKnowledge.service';
import { prisma } from '@/config/database';

export async function getRoadmap(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user!.sub;
    const careerId = req.params.careerId;

    // 1. Fetch user data
    const user = await FeatureExtractionService.fetchStudentData(userId);
    if (!user) {
      sendError(res, { message: 'User profile not found', statusCode: HTTP_STATUS.NOT_FOUND });
      return;
    }

    // 2. Fetch Career from Knowledge Base
    // The frontend sends the CSV careerId (e.g. C03). We map it to the career name to find the roadmap JSON.
    const csvCareer = CareerKnowledgeService.getCareerById(careerId);
    if (!csvCareer) {
      sendError(res, { message: 'Career not found in catalog.', statusCode: HTTP_STATUS.NOT_FOUND });
      return;
    }

    const career = RoadmapKnowledgeService.getCareerByIdOrName(csvCareer.name);
    if (!career) {
      sendError(res, { message: 'Personalized roadmap data is not yet available for this career.', statusCode: HTTP_STATUS.NOT_FOUND });
      return;
    }

    // 3. Map user proficiencies (skill canonicalName/name -> proficiency)
    const proficiencies = new Map<string, number>();
    user.skills.forEach(s => {
      proficiencies.set((s.skill.canonicalName || s.skill.name).toLowerCase(), s.proficiency);
    });

    const currentStrengths: any[] = [];
    const partialSkills: any[] = [];
    const skillGaps: any[] = [];

    // Analyze skills across all stages
    const processedSkills = new Set<string>();
    let totalTargetNodes = 0;
    let completedTargetNodes = 0;
    const csvSkillMap = new Map<string, any>();
    csvCareer.requiredSkills?.forEach((rs: any) => {
      csvSkillMap.set(rs.skillName.toLowerCase(), rs);
    });

    career.stages?.forEach((stage: any) => {
      stage.skills?.forEach((skillName: string) => {
        if (processedSkills.has(skillName)) return;
        processedSkills.add(skillName);
        
        totalTargetNodes++;
        const requiredSkillInfo = csvSkillMap.get(skillName.toLowerCase());
        const targetProficiency = requiredSkillInfo?.recommendedProficiency || 3;
        const priority = requiredSkillInfo?.importanceWeight || 3;
        const userProf = proficiencies.get(skillName.toLowerCase()) || 0;

        const skillObj = { 
          skillId: skillName, 
          name: skillName, 
          level: userProf, 
          target: targetProficiency,
          currentLevel: userProf,
          requiredLevel: targetProficiency,
          priority: priority
        };
        
        if (userProf >= targetProficiency) {
          currentStrengths.push(skillObj);
          completedTargetNodes++;
        } else if (userProf > 0) {
          partialSkills.push(skillObj);
        } else {
          skillGaps.push(skillObj);
        }
      });
    });

    const readiness = totalTargetNodes > 0 ? Math.round((completedTargetNodes / totalTargetNodes) * 100) : 0;

    // 4. Build roadmapStages
    const roadmapStages = career.stages?.map((stage: any) => {
      
      const nodes = stage.skills?.map((skillName: string) => {
        const requiredSkillInfo = csvSkillMap.get(skillName.toLowerCase());
        const targetProf = requiredSkillInfo?.recommendedProficiency || 3;
        const userProf = proficiencies.get(skillName.toLowerCase()) || 0;
        const isMastered = userProf >= targetProf;
        
        return {
          skillId: skillName,
          skillName: skillName,
          currentLevel: userProf,
          targetLevel: targetProf,
          status: isMastered ? 'SKIPPED_BY_EXISTING_KNOWLEDGE' : 'GAP',
          estimatedEffort: Math.round((stage.estimated_effort_hours || 10) / (stage.skills.length || 1)) + " hours",
          whyNeeded: isMastered ? "You already mastered this skill." : "Required for selected career.",
          prerequisites: [],
          resources: {
            learn: stage.recommended_resources?.[0] || null,
            documentation: stage.recommended_resources?.[1] || null,
            watch: stage.recommended_resources?.[2] || null
          }
        };
      }) || [];

      return {
        stageNumber: stage.stage,
        title: `Stage ${stage.stage}: ${stage.title}`,
        focus: stage.description,
        nodes
      };
    }) || [];

    const roadmap = {
      studentName: user.fullName?.split(' ')[0] || 'Student',
      currentYear: user.profile?.currentYear ? `Year ${user.profile.currentYear}` : 'Year 1',
      career: career.name,
      careerTarget: {
        roleInvolves: career.what_role_involves,
        keySkills: career.key_skills || [],
        entryLevelExpectations: career.entry_level_expectations
      },
      currentStrengths,
      partialSkills,
      skillGaps,
      roadmapStages,
      recommendedProjects: career.projects || [],
      placementPrep: [
        { title: "Role-specific Preparation", description: "Review typical interview questions for " + career.name },
        { title: "Resume Update", description: "Add your latest projects to your resume." }
      ],
      readiness
    };

    // PERSIST ROADMAP
    try {
      await prisma.userRoadmap.upsert({
        where: {
          userId_careerId: {
            userId,
            careerId: careerId
          }
        },
        update: {
          progress: readiness,
          currentStage: roadmapStages[0]?.title || 'Stage 1'
        },
        create: {
          userId,
          careerId: careerId,
          careerName: career.name,
          progress: readiness,
          currentStage: roadmapStages[0]?.title || 'Stage 1'
        }
      });
    } catch (dbErr) {
      console.error('Error persisting roadmap:', dbErr);
    }

    sendSuccess(res, {
      message: 'Personalized roadmap generated successfully.',
      data: roadmap,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const catalogService = new CareerCatalogService();
    const catalog = await catalogService.getCatalog();
    
    sendSuccess(res, {
      message: 'Career catalog fetched successfully.',
      data: catalog,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserRoadmaps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user!.sub;
    const roadmaps = await prisma.userRoadmap.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    
    sendSuccess(res, {
      message: 'User roadmaps fetched successfully.',
      data: roadmaps,
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user!.sub;
    const history = await RecommendationHistoryService.getHistoryTimeline(userId);
    
    sendSuccess(res, {
      message: 'Career recommendation history fetched successfully.',
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSnapshot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user!.sub;
    const snapshotId = req.params.id;
    
    const snapshot = await RecommendationHistoryService.getSnapshot(snapshotId, userId);
    
    if (!snapshot) {
      sendError(res, { message: 'Snapshot not found', statusCode: HTTP_STATUS.NOT_FOUND });
      return;
    }
    
    sendSuccess(res, {
      message: 'Snapshot fetched successfully.',
      data: snapshot,
    });
  } catch (err) {
    next(err);
  }
}
