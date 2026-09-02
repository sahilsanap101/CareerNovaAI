import { getFullStudentData } from '@/modules/profile/repositories/profile.repository';
import { getLatestRecommendations } from '@/modules/recommendations/repositories/recommendation.repository';
import { findUserActiveRoadmap } from '@/modules/roadmap/repositories/roadmap.repository';

export async function executePlatformTool(toolName: string, userId: string): Promise<string> {
  switch (toolName) {
    case 'getStudentProfile': {
      const student = await getFullStudentData(userId);
      return JSON.stringify({
        fullName: student?.fullName,
        college: student?.profile?.college,
        degree: student?.profile?.degree,
        cgpa: student?.profile?.cgpa,
        skillsCount: student?.skills.length,
        projectsCount: student?.projects.length,
      });
    }

    case 'getBYSERRecommendations': {
      const recs = await getLatestRecommendations(userId);
      return JSON.stringify(
        recs.slice(0, 3).map((r) => ({
          careerPath: r.careerPath.name,
          score: r.totalScore,
          SGI: r.SGI,
        })),
      );
    }

    case 'getActiveRoadmap': {
      const active = await findUserActiveRoadmap(userId);
      return JSON.stringify({
        title: active?.roadmap.title,
        completion: active?.completionPercentage,
        pace: active?.learningPace,
      });
    }

    default:
      return JSON.stringify({ status: 'Tool not found' });
  }
}
