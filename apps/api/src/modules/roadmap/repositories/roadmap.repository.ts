import { prisma } from '@/config/database';
import type { Prisma } from '@prisma/client';

export async function findUserActiveRoadmap(userId: string) {
  return prisma.userRoadmap.findFirst({
    where: { userId },
    include: {
      roadmap: {
        include: {
          careerPath: true,
          milestones: true,
          phases: {
            orderBy: { phaseNumber: 'asc' },
            include: {
              modules: {
                orderBy: { order: 'asc' },
                include: {
                  tasks: {
                    include: {
                      resources: true,
                      userTasks: { where: { userId } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createRoadmapRecord(data: {
  careerPathId: string;
  title: string;
  description: string;
  version: number;
  phases: Array<{
    phaseNumber: number;
    title: string;
    description: string;
    estimatedWeeks: number;
    modules: Array<{
      title: string;
      description: string;
      difficulty: string;
      estimatedHours: number;
      requiredSkills: string[];
      providedSkills: string[];
      tasks: Array<{
        title: string;
        description: string;
        taskType: string;
        estimatedMinutes: number;
        priority: string;
        resources: Array<{
          title: string;
          provider: string;
          url: string;
          resourceType: string;
          duration: string;
          free: boolean;
          rating: number;
        }>;
      }>;
    }>;
  }>;
}) {
  return prisma.roadmap.create({
    data: {
      title: data.title,
      careerPathId: data.careerPathId,
      description: data.description,
      estimatedDuration: '14 Weeks',
      version: data.version,
      milestones: {
        create: [
          { title: 'Milestone 1: Fundamentals Mastered', description: 'Complete Phase 1 foundations', status: 'IN_PROGRESS' },
          { title: 'Milestone 2: Core Engineering', description: 'Build intermediate project', status: 'LOCKED' },
          { title: 'Milestone 3: Portfolio Capstone', description: 'Deploy capstone project', status: 'LOCKED' },
        ],
      },
      phases: {
        create: data.phases.map((p) => ({
          phaseNumber: p.phaseNumber,
          title: p.title,
          description: p.description,
          estimatedWeeks: p.estimatedWeeks,
          modules: {
            create: p.modules.map((m, mIdx) => ({
              title: m.title,
              description: m.description,
              difficulty: m.difficulty,
              estimatedHours: m.estimatedHours,
              requiredSkills: m.requiredSkills,
              providedSkills: m.providedSkills,
              order: mIdx + 1,
              tasks: {
                create: m.tasks.map((t) => ({
                  title: t.title,
                  description: t.description,
                  taskType: t.taskType,
                  estimatedMinutes: t.estimatedMinutes,
                  priority: t.priority,
                  resources: {
                    create: t.resources,
                  },
                })),
              },
            })),
          },
        })),
      },
    },
  });
}

export async function upsertUserRoadmap(userId: string, roadmapId: string, learningPace = 'MEDIUM') {
  return prisma.userRoadmap.upsert({
    where: { userId_roadmapId: { userId, roadmapId } },
    update: { learningPace, lastUpdated: new Date() },
    create: {
      userId,
      roadmapId,
      learningPace,
      progress: 0,
      completionPercentage: 0,
      currentPhase: 1,
    },
  });
}

export async function markUserTaskComplete(userId: string, taskId: string) {
  return prisma.userTask.upsert({
    where: { userId_taskId: { userId, taskId } },
    update: { status: 'COMPLETED', completedAt: new Date() },
    create: { userId, taskId, status: 'COMPLETED', completedAt: new Date() },
  });
}

export async function createStudySession(userId: string, duration: number, module?: string) {
  return prisma.studySession.create({
    data: {
      userId,
      startTime: new Date(Date.now() - duration * 60 * 1000),
      endTime: new Date(),
      duration,
      module,
    },
  });
}

export async function getUserWeeklyPlans(userId: string) {
  return prisma.weeklyPlan.findMany({
    where: { userId },
    include: { dailyPlans: true },
    orderBy: { weekNumber: 'desc' },
  });
}

export async function getUserAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });
}
