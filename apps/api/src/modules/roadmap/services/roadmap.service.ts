import * as roadmapRepo from '@/modules/roadmap/repositories/roadmap.repository';
import { getFullStudentData } from '@/modules/profile/repositories/profile.repository';
import { getLatestRecommendations } from '@/modules/recommendations/repositories/recommendation.repository';
import { buildAdaptiveRoadmapTree, calculateCareerReadinessScore } from '../engine/adaptiveRoadmapEngine';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '@pathforge/shared-constants';

export async function generateAdaptiveRoadmap(userId: string, learningPace: 'FAST' | 'MEDIUM' | 'SLOW' = 'MEDIUM') {
  const student = await getFullStudentData(userId);
  if (!student) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  const recommendations = await getLatestRecommendations(userId);
  if (recommendations.length === 0) {
    throw new AppError('No recommendations generated yet. Run BYSER engine first.', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_001);
  }

  const topRec = recommendations[0];
  if (!topRec) {
    throw new AppError('No recommendations available', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_001);
  }
  const careerPath = topRec.careerPath;

  const requiredSkills = careerPath.requiredSkills.map((r) => r.skill.name);
  const userSkills = student.skills.map((s) => ({ name: s.skill.name, proficiency: s.proficiency }));

  const phaseTree = buildAdaptiveRoadmapTree(careerPath.name, requiredSkills, userSkills, learningPace);

  const existingActive = await roadmapRepo.findUserActiveRoadmap(userId);
  const nextVersion = (existingActive?.roadmap.version ?? 0) + 1;

  const roadmapRecord = await roadmapRepo.createRoadmapRecord({
    careerPathId: careerPath.id,
    title: `Adaptive ${careerPath.name} Mastery Path`,
    description: `Personalized ${careerPath.name} learning roadmap optimized for ${student.fullName}.`,
    version: nextVersion,
    phases: phaseTree,
  });

  const userRoadmap = await roadmapRepo.upsertUserRoadmap(userId, roadmapRecord.id, learningPace);

  return {
    userRoadmap,
    roadmap: roadmapRecord,
  };
}

export async function getActiveUserRoadmap(userId: string) {
  let active = await roadmapRepo.findUserActiveRoadmap(userId);
  if (!active) {
    active = (await generateAdaptiveRoadmap(userId)) as unknown as typeof active;
  }
  return active;
}

export async function completeUserTask(userId: string, taskId: string) {
  await roadmapRepo.markUserTaskComplete(userId, taskId);
  return { message: 'Task marked as completed.' };
}

export async function logStudyTime(userId: string, durationMinutes: number, moduleName?: string) {
  return roadmapRepo.createStudySession(userId, durationMinutes, moduleName);
}

export async function getRoadmapAnalytics(userId: string) {
  const student = await getFullStudentData(userId);
  const activeRoadmap = await roadmapRepo.findUserActiveRoadmap(userId);

  const skillsCount = student?.skills.length ?? 0;
  const avgProficiency = skillsCount > 0 ? (student?.skills.reduce((a, b) => a + b.proficiency, 0) ?? 0) / skillsCount : 0;
  const projectsCount = student?.projects.length ?? 0;
  const certsCount = student?.certifications.length ?? 0;
  const completionPct = activeRoadmap?.completionPercentage ?? 15;

  const readinessScore = calculateCareerReadinessScore(skillsCount, avgProficiency, projectsCount, certsCount, completionPct);

  return {
    readinessScore,
    currentStreakDays: 5,
    longestStreakDays: 14,
    hoursStudiedThisWeek: 8.5,
    weeklyGoalHours: 10,
    completionPercentage: completionPct,
    currentPace: activeRoadmap?.learningPace ?? 'MEDIUM',
    milestones: activeRoadmap?.roadmap?.milestones ?? [],
  };
}

export async function getWeeklyPlanner(userId: string) {
  const today = new Date();
  return {
    weekNumber: 1,
    startDate: today.toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 10,
    completedHours: 4.5,
    days: [
      { day: 'Monday', task: 'Study Theory & Prerequisites', hours: 1.5, status: 'COMPLETED' },
      { day: 'Tuesday', task: 'Practice Code Exercises', hours: 2.0, status: 'COMPLETED' },
      { day: 'Wednesday', task: 'Build Module Feature', hours: 2.0, status: 'IN_PROGRESS' },
      { day: 'Thursday', task: 'Read Official Documentation', hours: 1.5, status: 'PLANNED' },
      { day: 'Friday', task: 'Solve Coding Challenge', hours: 1.5, status: 'PLANNED' },
      { day: 'Saturday', task: 'Portfolio Integration', hours: 1.5, status: 'PLANNED' },
    ],
  };
}
