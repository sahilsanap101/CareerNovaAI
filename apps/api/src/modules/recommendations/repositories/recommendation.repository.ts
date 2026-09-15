import { prisma } from '@/config/database';
import type { Prisma } from '@prisma/client';

export async function getAllCareerPathsWithSkills() {
  return prisma.careerPath.findMany({
    include: {
      requiredSkills: {
        include: { skill: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCareerPathById(id: string) {
  return prisma.careerPath.findUnique({
    where: { id },
    include: {
      requiredSkills: {
        include: { skill: true },
      },
    },
  });
}

export async function saveRecommendations(
  userId: string,
  recommendations: Array<{
    careerPathId: string;
    totalScore: number;
    SGI: number;
    confidence: number;
    explanation: Prisma.InputJsonValue;
    factors: Array<{
      factor: string;
      weight: number;
      score: number;
      explanation: string;
    }>;
  }>,
) {
  // Delete previous recommendation records for fresh generation
  await prisma.recommendationResult.deleteMany({ where: { userId } });

  const createdResults = [];
  for (const rec of recommendations) {
    const created = await prisma.recommendationResult.create({
      data: {
        userId,
        careerPathId: rec.careerPathId,
        totalScore: rec.totalScore,
        SGI: rec.SGI,
        confidence: rec.confidence,
        explanation: rec.explanation,
        factors: {
          create: rec.factors,
        },
      },
      include: {
        careerPath: true,
        factors: true,
      },
    });
    createdResults.push(created);
  }

  return createdResults;
}

export async function getLatestRecommendations(userId: string) {
  return prisma.recommendationResult.findMany({
    where: { userId },
    include: {
      careerPath: {
        include: {
          requiredSkills: {
            include: { skill: true },
          },
        },
      },
      factors: true,
    },
    orderBy: { totalScore: 'desc' },
    take: 5,
  });
}

export async function getRecommendationHistory(userId: string) {
  return prisma.recommendationResult.findMany({
    where: { userId },
    include: {
      careerPath: true,
    },
    orderBy: { generatedAt: 'desc' },
  });
}

export async function createFeedback(data: { userId: string, recommendationId: string, relevanceScore: number, roadmapClarityScore: number, freeTextComment?: string }) {
  return prisma.feedback.create({ data });
}
