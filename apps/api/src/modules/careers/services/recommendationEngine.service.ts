// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { StudentRecommendationProfile } from '../types';
import { BYSER_WEIGHTS, ByserWeights } from '../../../config/byserWeights';
import { MarketDemandService } from './marketDemand.service';
// @ts-nocheck
import { CareerKnowledgeService } from './careerKnowledge.service';

const prisma = new PrismaClient();

export interface CareerRecommendationResult {
  careerId: string;
  careerName: string;
  domain: string;
  finalScore: number; // 0-100
  rank: number;
  breakdown: {
    skillScore: number;
    interestScore: number;
    academicScore: number;
    projectScore: number;
    certificationScore: number;
    codingScore: number;
    goalScore: number;
    stageMultiplier: number;
    marketDemandMultiplier?: number; // Future addition
  };
  evidence: {
    skillMatches: { skill: string; userProficiency: number; requiredProficiency: number }[];
    skillGaps: { skill: string; userProficiency: number; requiredProficiency: number; isCore: boolean }[];
    matchingInterests: string[];
    projectEvidence: string[];
    academicAlignment: string[];
    goalAlignment: string[];
    marketInsights?: string[]; // Future addition
  };
}

export class RecommendationEngineService {
  
  /**
   * Generates recommendations based on the student's normalized profile.
   */
  static async generateRecommendations(
    student: StudentRecommendationProfile,
    customWeights?: Partial<ByserWeights>
  ): Promise<CareerRecommendationResult[]> {
    // 1. Load Knowledge Base (in-memory evaluation for fast performance)
    const careers = CareerKnowledgeService.getCareersForRecommendation();

    // 2. Adjust dynamic weights based on year stage
    const baseWeights = { ...BYSER_WEIGHTS, ...customWeights };
    const year = student.yearStage.year;
    let w_skill = baseWeights.SKILLS;
    let w_interest = baseWeights.INTERESTS;
    let w_academic = baseWeights.ACADEMIC;
    let w_project = baseWeights.PROJECTS;
    let w_cert = baseWeights.CERTIFICATIONS;
    let w_coding = baseWeights.CODING;
    let w_goal = baseWeights.GOALS;

    let stageMultiplier = 1.0;

    if (student.yearStage.isExploratory) {
      // Year 1-2: Boost interests/academics, lower technical constraints
      w_interest *= 1.5;
      w_academic *= 1.2;
      w_skill *= 0.7;
      w_coding *= 0.5;
      stageMultiplier = 0.8; 
    } else if (student.yearStage.isPlacementReady) {
      // Year 3-4: Boost technical, coding, projects
      w_skill *= 1.1;
      w_coding *= 1.2;
      w_project *= 1.1;
      w_goal *= 1.2;
      stageMultiplier = 1.2;
    }

    // Normalize weights to ensure they sum to exactly 1.0
    const totalWeight = w_skill + w_interest + w_academic + w_project + w_cert + w_coding + w_goal;
    w_skill /= totalWeight;
    w_interest /= totalWeight;
    w_academic /= totalWeight;
    w_project /= totalWeight;
    w_cert /= totalWeight;
    w_coding /= totalWeight;
    w_goal /= totalWeight;

    const results: CareerRecommendationResult[] = [];

    // 3. Evaluate Each Career
    for (const career of careers) {
      // FUTURE: Inject market demand context here
      // const marketDemand = await MarketDemandService.getDemandForCareer(career.id);
      
      let skillScore = 0;
      let interestScore = 0;
      let academicScore = 0;
      let projectScore = 0;
      let certScore = 0;
      let codingScore = 0;
      let goalScore = 0;

      const evidence = {
        skillMatches: [] as { skill: string; userProficiency: number; requiredProficiency: number }[],
        skillGaps: [] as { skill: string; userProficiency: number; requiredProficiency: number; isCore: boolean }[],
        matchingInterests: [] as string[],
        projectEvidence: [] as string[],
        academicAlignment: [] as string[],
        goalAlignment: [] as string[]
      };

      // --- A. Skill Score ---
      let totalSkillWeight = 0;
      let earnedSkillScore = 0;

      for (const req of career.requiredSkills) {
        const canonicalName = req.skill.canonicalName || req.skill.name;
        
        let typeWeight = 4; // OPTIONAL
        if (req.skillType === 'CORE') typeWeight = 10;
        else if (req.skillType === 'IMPORTANT') typeWeight = 7;

        totalSkillWeight += typeWeight;

        // Dataset uses skill IDs (e.g., SK_html), but backend sometimes expects canonical names.
        const userProf = student.skills[req.skill.id]?.proficiency 
                      || student.skills[canonicalName]?.proficiency 
                      || student.skills[req.skill.name]?.proficiency 
                      || 0;

        const reqProf = req.minimumProficiency || 1;

        if (userProf > 0) {
          let ratio = userProf / reqProf;
          if (ratio > 1.2) ratio = 1.2; // small bonus for exceeding
          earnedSkillScore += (ratio * typeWeight);
          
          if (userProf >= reqProf) {
            evidence.skillMatches.push({ skill: canonicalName, userProficiency: userProf, requiredProficiency: reqProf });
          } else {
            evidence.skillGaps.push({ skill: canonicalName, userProficiency: userProf, requiredProficiency: reqProf, isCore: req.skillType === 'CORE' });
          }
        } else {
          // Missing skill
          if (req.skillType === 'CORE' || req.skillType === 'IMPORTANT') {
             if (student.yearStage.isExploratory) {
                earnedSkillScore += (0.2 * typeWeight);
             } else {
                evidence.skillGaps.push({ skill: canonicalName, userProficiency: 0, requiredProficiency: reqProf, isCore: req.skillType === 'CORE' });
             }
          }
        }
      }
      
      if (totalSkillWeight > 0) {
        skillScore = Math.min(100, (earnedSkillScore / totalSkillWeight) * 100);
      }

      // --- B. Interest Score ---
      let matchingInterests = 0;
      for (const [id, intData] of Object.entries(student.interests)) {
        const match = career.interests.find(ci => ci.interestId === id);
        if (match) {
           matchingInterests++;
           evidence.matchingInterests.push(match.interest.name);
        }
      }
      
      interestScore = Math.min(100, matchingInterests * 33.3);

      // --- C. Academic Score ---
      const cgpa = student.academic.cgpa || 0;
      if (cgpa >= 8.5) {
        academicScore = 100;
        evidence.academicAlignment.push(`Strong CGPA (${cgpa})`);
      } else if (cgpa >= 7.5) {
        academicScore = 80;
        evidence.academicAlignment.push(`Good CGPA (${cgpa})`);
      } else if (cgpa >= 6.5) {
        academicScore = 60;
      } else {
        academicScore = 40;
      }

      if (student.academic.branch && ['computer science', 'it', 'software'].some(b => student.academic.branch?.toLowerCase().includes(b))) {
         academicScore = Math.min(100, academicScore + 10);
         evidence.academicAlignment.push(`Relevant core branch (${student.academic.branch})`);
      }

      // --- D. Project Score ---
      let projectKeywordMatches = 0;
      const careerKeywords = [...career.requiredSkills.map(r => (r.skill.canonicalName || r.skill.name).toLowerCase()), career.category.toLowerCase()];
      
      for (const p of student.projects) {
         const pTechs = p.technologies.map(t => t.toLowerCase());
         let matched = false;
         for (const t of pTechs) {
           if (careerKeywords.includes(t)) {
             projectKeywordMatches++;
             matched = true;
           }
         }
         if (matched) {
           evidence.projectEvidence.push(`Project "${p.title}" demonstrates relevant technologies`);
         }
      }
      projectScore = Math.min(100, projectKeywordMatches * 25);

      // --- E. Certification Score ---
      let certMatches = 0;
      for (const c of student.certifications) {
         const cTitle = c.title.toLowerCase();
         if (careerKeywords.some(k => cTitle.includes(k))) certMatches++;
      }
      certScore = Math.min(100, certMatches * 50);

      // --- F. Coding Evidence Score ---
      const problems = student.codingEvidence.totalProblemsSolved;
      if (problems >= 300) codingScore = 100;
      else if (problems >= 150) codingScore = 75;
      else if (problems >= 50) codingScore = 50;
      else codingScore = 20;

      // --- G. Goal Score ---
      if (student.careerGoals.targetRole && student.careerGoals.targetRole.toLowerCase().includes(career.name.toLowerCase())) {
        goalScore = 100;
        evidence.goalAlignment.push(`Direct match with your target role: ${student.careerGoals.targetRole}`);
      } else if (student.careerGoals.targetIndustry && student.careerGoals.targetIndustry.toLowerCase().includes(career.category.toLowerCase())) {
        goalScore = 80;
        evidence.goalAlignment.push(`Matches your target industry: ${student.careerGoals.targetIndustry}`);
      } else {
        goalScore = 50; // Neutral
      }

      // --- Calculation ---
      const finalScore = 
        (skillScore * w_skill) +
        (interestScore * w_interest) +
        (academicScore * w_academic) +
        (projectScore * w_project) +
        (certScore * w_cert) +
        (codingScore * w_coding) +
        (goalScore * w_goal);

      results.push({
        careerId: career.id,
        careerName: career.name,
        domain: career.category,
        finalScore: Number(finalScore.toFixed(2)),
        rank: 0,
        breakdown: {
          skillScore: Number(skillScore.toFixed(2)),
          interestScore: Number(interestScore.toFixed(2)),
          academicScore: Number(academicScore.toFixed(2)),
          projectScore: Number(projectScore.toFixed(2)),
          certificationScore: Number(certScore.toFixed(2)),
          codingScore: Number(codingScore.toFixed(2)),
          goalScore: Number(goalScore.toFixed(2)),
          stageMultiplier: Number(stageMultiplier.toFixed(2)),
        },
        evidence
      });
    }

    // 4. Sort and Rank
    results.sort((a, b) => b.finalScore - a.finalScore);
    results.forEach((r, idx) => r.rank = idx + 1);

    return results;
  }
}
