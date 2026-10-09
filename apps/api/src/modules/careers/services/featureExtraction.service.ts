import { PrismaClient, User, Profile, UserSkill, Skill, UserInterest, Project, Certification, CodingPlatform, CareerGoal } from '@prisma/client';
import { StudentRecommendationProfile } from '../types';

const prisma = new PrismaClient();

type CompleteUser = User & {
  profile: Profile | null;
  skills: (UserSkill & { skill: Skill })[];
  interests: UserInterest[];
  projects: Project[];
  certifications: Certification[];
  codingPlatforms: CodingPlatform[];
  careerGoal: CareerGoal | null;
};

export class FeatureExtractionService {
  
  /**
   * Fetches the complete user profile from the database.
   */
  static async fetchStudentData(userId: string): Promise<CompleteUser | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: {
          include: { skill: true }
        },
        interests: true,
        projects: true,
        certifications: true,
        codingPlatforms: true,
        careerGoal: true,
      }
    });
  }

  /**
   * Converts the raw database user into a normalized StudentRecommendationProfile.
   */
  static extractFeatures(user: CompleteUser): StudentRecommendationProfile {
    // 1. Year Stage extraction
    const currentYear = user.profile?.currentYear || 1;
    const yearStage = {
      year: currentYear,
      semester: user.profile?.currentSemester || ((currentYear - 1) * 2 + 1),
      isExploratory: currentYear <= 2,
      isPlacementReady: currentYear >= 3,
    };

    // 2. Academic extraction
    const academic = {
      degree: user.profile?.degree || null,
      branch: user.profile?.branch || null,
      specialization: user.profile?.specialization || null,
      cgpa: user.profile?.cgpa || null,
    };

    // 3. Skills extraction
    // Normalize proficiency to a consistent scale 1-5 (bounded).
    const skills: Record<string, { proficiency: number; confidence: number }> = {};
    for (const userSkill of user.skills) {
      const canonicalName = userSkill.skill.canonicalName || userSkill.skill.name;
      
      let proficiency = userSkill.proficiency || 1;
      if (proficiency < 1) proficiency = 1;
      if (proficiency > 5) proficiency = 5;

      skills[canonicalName] = {
        proficiency,
        confidence: userSkill.confidence || 50,
      };
    }

    // 4. Interests extraction
    const interests: Record<string, { priority: number }> = {};
    for (const interest of user.interests) {
      interests[interest.interestId] = {
        priority: interest.priority || 1,
      };
    }

    // 5. Projects extraction
    const projects = user.projects.map(p => ({
      title: p.title || '',
      description: p.description || '',
      technologies: p.technologies ? p.technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
    }));

    // 6. Certifications extraction
    const certifications = user.certifications.map(c => ({
      title: c.title || '',
      issuer: c.issuer || '',
    }));

    // 7. Coding Evidence extraction
    let totalProblemsSolved = 0;
    const activePlatforms: string[] = [];
    
    for (const cp of user.codingPlatforms) {
      totalProblemsSolved += (cp.problemsSolved || 0);
      if (cp.problemsSolved > 0 && cp.platform) {
        activePlatforms.push(cp.platform);
      }
    }

    const codingEvidence = {
      totalProblemsSolved,
      activePlatforms,
    };

    // 8. Career Goals extraction
    const careerGoals = {
      targetRole: user.careerGoal?.preferredJobRole || null,
      targetIndustry: user.careerGoal?.preferredIndustry || null,
      preferredCountries: user.careerGoal?.preferredCountries || null,
      preferredWorkMode: user.careerGoal?.preferredWorkMode || null,
      aspirations: {
        higherStudies: user.careerGoal?.higherStudies || false,
        entrepreneurship: user.careerGoal?.entrepreneurship || false,
        governmentJobs: user.careerGoal?.governmentJobs || false,
        startup: user.careerGoal?.startup || false,
        research: user.careerGoal?.research || false,
      }
    };

    return {
      studentId: user.id,
      yearStage,
      academic,
      skills,
      interests,
      projects,
      certifications,
      codingEvidence,
      careerGoals,
    };
  }

  /**
   * Main entry point to extract features by userId
   */
  static async extractFeaturesForUser(userId: string): Promise<StudentRecommendationProfile | null> {
    const user = await this.fetchStudentData(userId);
    if (!user) return null;
    return this.extractFeatures(user);
  }
}
