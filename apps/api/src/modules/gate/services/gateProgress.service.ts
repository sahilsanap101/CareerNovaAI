import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateTopicMastery = async (userId: string, topicId: string, delta: number) => {
    // Upserts topic mastery securely
    const existing = await prisma.gateTopicMastery.findUnique({
        where: { userId_topicId: { userId, topicId } }
    });

    const newLevel = Math.max(0, Math.min(100, (existing?.masteryLevel || 0) + delta));

    return await prisma.gateTopicMastery.upsert({
        where: { userId_topicId: { userId, topicId } },
        update: { masteryLevel: newLevel },
        create: { userId, topicId, masteryLevel: Math.max(0, newLevel) }
    });
};

export const getReadinessSnapshot = async (userId: string, targetYear: number) => {
    return await prisma.gateReadinessSnapshot.findFirst({
        where: { userId, targetYear },
        orderBy: { createdAt: 'desc' }
    });
};

export const recordMistake = async (userId: string, questionId: string,
    mistakeType: 'CALCULATION' | 'CONCEPTUAL' | 'READING' | 'TIME_PRESSURE', notes?: string) => {

    return await prisma.gateMistakeTracker.create({
        data: {
            userId,
            questionId,
            mistakeType,
            notes
        }
    });
};
