import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createStudyPlan = async (userId: string, targetExamId: string, title: string, startDate: Date, endDate: Date) => {
    return await prisma.gateStudyPlan.create({
        data: {
            userId,
            targetExamId,
            title,
            startDate,
            endDate
        }
    });
};

export const getStudyPlans = async (userId: string) => {
    return await prisma.gateStudyPlan.findMany({
        where: { userId },
        include: {
            sessions: {
                orderBy: { date: 'asc' }
            }
        }
    });
};

export const updateStudySessionStatus = async (sessionId: string, status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED') => {
    return await prisma.gateStudySession.update({
        where: { id: sessionId },
        data: { status }
    });
};
