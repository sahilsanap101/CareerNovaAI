import { prisma } from '@/config/database';
import { assessmentData } from '../services/assessment.data';

export async function seedQuestionsIfEmpty() {
  const count = await prisma.careerAssessmentQuestion.count();
  if (count === 0) {
    for (const q of assessmentData) {
      await prisma.careerAssessmentQuestion.create({
        data: {
          question: q.question,
          section: q.section,
          order: q.order,
          options: {
            create: q.options.map((opt) => ({
              label: opt.label,
              value: opt.value,
              careerWeights: opt.careerWeights,
            })),
          },
        },
      });
    }
  }
}

export async function getQuestions() {
  return prisma.careerAssessmentQuestion.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: {
      options: {
        select: {
          id: true,
          questionId: true,
          label: true,
          value: true,
          careerWeights: true,
        },
      },
    },
  });
}

export async function getUserResponses(userId: string) {
  return prisma.careerAssessmentResponse.findMany({
    where: { userId },
  });
}

export async function saveResponse(userId: string, questionId: string, selectedValue: string) {
  return prisma.careerAssessmentResponse.upsert({
    where: {
      userId_questionId: {
        userId,
        questionId,
      },
    },
    update: {
      selectedValue,
    },
    create: {
      userId,
      questionId,
      selectedValue,
    },
  });
}

export async function deleteUserResponses(userId: string) {
  return prisma.careerAssessmentResponse.deleteMany({
    where: { userId },
  });
}
