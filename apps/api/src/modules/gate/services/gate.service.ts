import { prisma } from '@/config/database';
import type { GateProfileInput, GateTopicInput } from '../schemas/gate.schema';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_MESSAGES } from '@pathforge/shared-constants';

export async function getGateProfileByUserId(userId: string) {
    return prisma.gateUserProfile.findUnique({
        where: { userId },
    });
}

export async function createGateProfile(userId: string, data: GateProfileInput) {
    return prisma.gateUserProfile.create({
        data: {
            userId,
            ...data,
            examDate: data.examDate ? new Date(data.examDate) : null,
        },
    });
}

export async function updateGateProfile(userId: string, data: GateProfileInput) {
    return prisma.gateUserProfile.upsert({
        where: { userId },
        update: {
            ...data,
            examDate: data.examDate ? new Date(data.examDate) : null,
        },
        create: {
            userId,
            ...data,
            examDate: data.examDate ? new Date(data.examDate) : null,
        },
    });
}

// ─── GATE Topics ──────────────────────────────────────────────────

export async function getGateTopics(userId: string) {
    return prisma.gatePersonalTopic.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

export async function getGateTopicProgress(userId: string) {
    const allTopics = await prisma.gatePersonalTopic.count({ where: { userId } });
    const completedTopics = await prisma.gatePersonalTopic.count({ where: { userId, status: 'COMPLETED' } });

    if (allTopics === 0) return { percentComplete: 0, completedTopics, totalTopics: 0 };

    return {
        percentComplete: Math.round((completedTopics / allTopics) * 100),
        completedTopics,
        totalTopics: allTopics
    };
}

export async function createGateTopic(userId: string, data: GateTopicInput) {
    return prisma.gatePersonalTopic.create({
        data: {
            userId,
            ...data,
            targetDate: data.targetDate ? new Date(data.targetDate) : null,
        },
    });
}

export async function updateGateTopic(userId: string, topicId: string, data: GateTopicInput) {
    const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: topicId, userId } });
    if (!topic) throw new AppError('Topic not found', HTTP_STATUS.NOT_FOUND);

    return prisma.gatePersonalTopic.update({
        where: { id: topicId },
        data: {
            ...data,
            targetDate: data.targetDate ? new Date(data.targetDate) : null,
        },
    });
}

export async function deleteGateTopic(userId: string, topicId: string) {
    const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: topicId, userId } });
    if (!topic) throw new AppError('Topic not found', HTTP_STATUS.NOT_FOUND);

    await prisma.gatePersonalTopic.delete({
        where: { id: topicId },
    });
}

// ─── GATE Study Tasks ─────────────────────────────────────────────

export async function getGateStudyTasks(userId: string, weekStart?: Date, weekEnd?: Date) {
    return prisma.gateStudyTask.findMany({
        where: {
            userId,
            ...(weekStart && weekEnd && {
                plannedDate: {
                    gte: weekStart,
                    lt: weekEnd
                }
            })
        },
        orderBy: [
            { plannedDate: 'asc' },
            { priority: 'desc' },
            { createdAt: 'asc' }
        ],
        include: { topic: { select: { title: true, subject: true } } }
    });
}

export async function createGateStudyTask(userId: string, data: any) {
    if (data.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    return prisma.gateStudyTask.create({
        data: {
            userId,
            ...data,
            plannedDate: new Date(data.plannedDate),
            completedAt: data.status === 'COMPLETED' ? new Date() : null,
        },
    });
}

export async function updateGateStudyTask(userId: string, taskId: string, data: any) {
    const task = await prisma.gateStudyTask.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new AppError('Study task not found', HTTP_STATUS.NOT_FOUND);

    if (data.topicId && data.topicId !== task.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    let completedAt = task.completedAt;
    if (data.status === 'COMPLETED' && task.status !== 'COMPLETED') {
        completedAt = new Date();
    } else if (data.status !== 'COMPLETED') {
        completedAt = null;
    }

    return prisma.gateStudyTask.update({
        where: { id: taskId },
        data: {
            ...data,
            plannedDate: data.plannedDate ? new Date(data.plannedDate) : undefined,
            completedAt
        },
    });
}

export async function deleteGateStudyTask(userId: string, taskId: string) {
    const task = await prisma.gateStudyTask.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new AppError('Study task not found', HTTP_STATUS.NOT_FOUND);

    await prisma.gateStudyTask.delete({
        where: { id: taskId },
    });
}

export async function getWeeklyPlannerSummary(userId: string, weekStart: Date, weekEnd: Date) {
    const profile = await prisma.gateUserProfile.findUnique({ where: { userId } });
    const targetWeeklyMinutes = profile?.weeklyHours ? profile.weeklyHours * 60 : 0;

    const tasks = await prisma.gateStudyTask.findMany({
        where: { userId, plannedDate: { gte: weekStart, lt: weekEnd } },
        select: { status: true, estimatedMinutes: true }
    });

    let plannedMinutes = 0;
    let completedMinutes = 0;
    let completedTaskCount = 0;

    tasks.forEach(task => {
        plannedMinutes += task.estimatedMinutes;
        if (task.status === 'COMPLETED') {
            completedMinutes += task.estimatedMinutes;
            completedTaskCount++;
        }
    });

    const remainingMinutes = Math.max(plannedMinutes - completedMinutes, 0);
    const completionPercentage = plannedMinutes > 0 ? Math.round((completedMinutes / plannedMinutes) * 100) : 0;

    return {
        hasProfile: !!profile,
        weeklyTargetMinutes: targetWeeklyMinutes,
        plannedMinutes,
        completedMinutes,
        remainingMinutes,
        taskCount: tasks.length,
        completedTaskCount,
        completionPercentage
    };
}

// ─── GATE Study Sessions ──────────────────────────────────────────

export async function createGateStudySession(userId: string, data: any) {
    if (data.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }
    if (data.studyTaskId) {
        const task = await prisma.gateStudyTask.findFirst({ where: { id: data.studyTaskId, userId } });
        if (!task) throw new AppError('Provided study task not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    return prisma.gateStudySession.create({
        data: {
            ...data,
            userId
        }
    });
}

export async function getGateStudySessions(userId: string, weekStart?: Date, weekEnd?: Date, sessionType?: string, topicId?: string) {
    const where: any = { userId };
    if (weekStart && weekEnd) {
        where.startedAt = { gte: weekStart, lte: weekEnd };
    }
    if (sessionType && sessionType !== 'ALL') {
        where.sessionType = sessionType;
    }
    if (topicId && topicId !== 'ALL') {
        where.topicId = topicId;
    }
    return prisma.gateStudySession.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        include: { topic: true, studyTask: true }
    });
}

export async function updateGateStudySession(userId: string, id: string, data: any) {
    const session = await prisma.gateStudySession.findFirst({ where: { id, userId } });
    if (!session) throw new AppError('Study session not found', HTTP_STATUS.NOT_FOUND);

    if (data.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }
    if (data.studyTaskId) {
        const task = await prisma.gateStudyTask.findFirst({ where: { id: data.studyTaskId, userId } });
        if (!task) throw new AppError('Provided study task not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    return prisma.gateStudySession.update({
        where: { id, userId },
        data
    });
}

export async function deleteGateStudySession(userId: string, id: string) {
    const session = await prisma.gateStudySession.findFirst({ where: { id, userId } });
    if (!session) throw new AppError('Study session not found', HTTP_STATUS.NOT_FOUND);
    return prisma.gateStudySession.delete({ where: { id, userId } });
}

export async function getStudySessionSummary(userId: string, weekStart: Date, weekEnd: Date) {
    const thisWeekSessions = await prisma.gateStudySession.findMany({
        where: { userId, startedAt: { gte: weekStart, lte: weekEnd } },
        include: { topic: true }
    });

    const previousWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekEnd = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const previousWeekSessions = await prisma.gateStudySession.findMany({
        where: { userId, startedAt: { gte: previousWeekStart, lte: previousWeekEnd } }
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todaySessions = await prisma.gateStudySession.findMany({
        where: { userId, startedAt: { gte: todayStart, lte: todayEnd } }
    });

    const totalSessions = await prisma.gateStudySession.count({ where: { userId } });

    const todayMinutes = todaySessions.reduce((acc: number, s: any) => acc + s.durationMinutes, 0);
    const weekMinutes = thisWeekSessions.reduce((acc: number, s: any) => acc + s.durationMinutes, 0);
    const previousWeekMinutes = previousWeekSessions.reduce((acc: number, s: any) => acc + s.durationMinutes, 0);

    const byTopic = thisWeekSessions.reduce((acc: Record<string, number>, s: any) => {
        if (s.topicId) {
            const title = s.topic?.title || 'Unknown';
            acc[title] = (acc[title] || 0) + s.durationMinutes;
        }
        return acc;
    }, {} as Record<string, number>);

    const bySessionType = thisWeekSessions.reduce((acc: Record<string, number>, s: any) => {
        acc[s.sessionType] = (acc[s.sessionType] || 0) + s.durationMinutes;
        return acc;
    }, {} as Record<string, number>);

    return {
        todayMinutes,
        weekMinutes,
        previousWeekMinutes,
        sessionCount: totalSessions,
        weekSessionCount: thisWeekSessions.length,
        byTopic,
        bySessionType,
    };
}

// ─── GATE Practice Attempts ─────────────────────────────────────────

export async function createGatePracticeAttempt(userId: string, data: any) {
    if (data.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    const attemptedQuestions = data.correctAnswers + data.incorrectAnswers;

    return prisma.gatePracticeAttempt.create({
        data: {
            ...data,
            attemptedQuestions,
            userId
        }
    });
}

export async function getGatePracticeAttempts(userId: string, startDate?: Date, endDate?: Date, topicId?: string, attemptType?: string, paperCode?: string, paperYear?: number) {
    const where: any = { userId };
    if (startDate && endDate) {
        where.attemptDate = { gte: startDate, lte: endDate };
    }
    if (topicId && topicId !== 'ALL') where.topicId = topicId;
    if (attemptType && attemptType !== 'ALL') where.attemptType = attemptType;
    if (paperCode && paperCode !== 'ALL') where.paperCode = paperCode;
    if (paperYear) where.paperYear = paperYear;

    return prisma.gatePracticeAttempt.findMany({
        where,
        orderBy: { attemptDate: 'desc' },
        include: { topic: true }
    });
}

export async function updateGatePracticeAttempt(userId: string, id: string, data: any) {
    const attempt = await prisma.gatePracticeAttempt.findFirst({ where: { id, userId } });
    if (!attempt) throw new AppError('Practice attempt not found', HTTP_STATUS.NOT_FOUND);

    if (data.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    let attemptedQuestions = attempt.attemptedQuestions;
    if (data.correctAnswers !== undefined && data.incorrectAnswers !== undefined) {
        attemptedQuestions = data.correctAnswers + data.incorrectAnswers;
    } else if (data.correctAnswers !== undefined) {
        attemptedQuestions = data.correctAnswers + attempt.incorrectAnswers;
    } else if (data.incorrectAnswers !== undefined) {
        attemptedQuestions = attempt.correctAnswers + data.incorrectAnswers;
    }

    return prisma.gatePracticeAttempt.update({
        where: { id, userId },
        data: {
            ...data,
            attemptedQuestions
        }
    });
}

export async function deleteGatePracticeAttempt(userId: string, id: string) {
    const attempt = await prisma.gatePracticeAttempt.findFirst({ where: { id, userId } });
    if (!attempt) throw new AppError('Practice attempt not found', HTTP_STATUS.NOT_FOUND);

    return prisma.gatePracticeAttempt.delete({ where: { id, userId } });
}

export async function getPracticeSummary(userId: string) {
    const attempts = await prisma.gatePracticeAttempt.findMany({
        where: { userId },
        include: { topic: true }
    });

    let questionsAttempted = 0;
    let correct = 0;
    let incorrect = 0;

    const topicStats: Record<string, { attempts: number; questions: number; correct: number }> = {};
    const typeStats: Record<string, { attempts: number; questions: number; correct: number }> = {};

    attempts.forEach(a => {
        questionsAttempted += a.attemptedQuestions;
        correct += a.correctAnswers;
        incorrect += a.incorrectAnswers;

        if (!typeStats[a.attemptType]) {
            typeStats[a.attemptType] = { attempts: 0, questions: 0, correct: 0 };
        }
        typeStats[a.attemptType]!.attempts++;
        typeStats[a.attemptType]!.questions += a.attemptedQuestions;
        typeStats[a.attemptType]!.correct += a.correctAnswers;

        if (a.topicId) {
            const tTitle = a.topic?.title || 'Unknown Topic';
            if (!topicStats[tTitle]) {
                topicStats[tTitle] = { attempts: 0, questions: 0, correct: 0 };
            }
            topicStats[tTitle]!.attempts++;
            topicStats[tTitle]!.questions += a.attemptedQuestions;
            topicStats[tTitle]!.correct += a.correctAnswers;
        }
    });

    return {
        totalAttempts: attempts.length,
        questionsAttempted,
        correct,
        incorrect,
        overallAccuracy: questionsAttempted > 0 ? (correct / questionsAttempted) * 100 : 0,
        byTopic: topicStats,
        byType: typeStats
    };
}

export async function getMockSummary(userId: string) {
    const attempts = await prisma.gatePracticeAttempt.findMany({
        where: { userId, attemptType: 'MOCK' },
        orderBy: { attemptDate: 'desc' }
    });

    if (attempts.length === 0) return null;

    let totalMarks = 0;
    let marksCount = 0;
    let bestMarks = -Infinity;
    let latestMarks: number | null = null;
    let latestAttemptDate = attempts[0]?.attemptDate;

    let totalAccuracy = 0;
    let accuracyCount = 0;
    let bestAccuracy = -Infinity;

    let totalDuration = 0;
    let durationCount = 0;

    attempts.forEach(a => {
        if (a.marksObtained !== null && a.marksObtained !== undefined) {
            totalMarks += a.marksObtained;
            marksCount++;
            if (a.marksObtained > bestMarks) bestMarks = a.marksObtained;
            if (latestMarks === null) latestMarks = a.marksObtained;
        }

        if (a.attemptedQuestions > 0) {
            const acc = (a.correctAnswers / a.attemptedQuestions) * 100;
            totalAccuracy += acc;
            accuracyCount++;
            if (acc > bestAccuracy) bestAccuracy = acc;
        }

        if (a.durationMinutes !== null && a.durationMinutes !== undefined) {
            totalDuration += a.durationMinutes;
            durationCount++;
        }
    });

    return {
        totalAttempts: attempts.length,
        bestMarks: marksCount > 0 ? bestMarks : null,
        averageMarks: marksCount > 0 ? (totalMarks / marksCount) : null,
        latestMarks,
        averageAccuracy: accuracyCount > 0 ? (totalAccuracy / accuracyCount) : null,
        bestAccuracy: accuracyCount > 0 ? bestAccuracy : null,
        averageDuration: durationCount > 0 ? (totalDuration / durationCount) : null,
        latestAttemptDate
    };
}

// ─── GATE Mistake Log ─────────────────────────────────────────────

export async function createGateMistake(userId: string, data: any) {
    if (data.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }
    if (data.practiceAttemptId) {
        const attempt = await prisma.gatePracticeAttempt.findFirst({ where: { id: data.practiceAttemptId, userId } });
        if (!attempt) throw new AppError('Provided practice attempt not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    const mistakeDate = data.mistakeDate ? new Date(data.mistakeDate) : new Date();

    return prisma.gateMistake.create({
        data: {
            ...data,
            mistakeDate,
            resolvedAt: data.status === 'RESOLVED' ? new Date() : null,
            userId
        }
    });
}

export async function getGateMistakes(userId: string, filters: any = {}) {
    const where: any = { userId };

    if (filters.status && filters.status !== 'ALL') where.status = filters.status;
    if (filters.priority && filters.priority !== 'ALL') where.priority = filters.priority;
    if (filters.category && filters.category !== 'ALL') where.category = filters.category;
    if (filters.difficulty && filters.difficulty !== 'ALL') where.difficulty = filters.difficulty;

    if (filters.needsRevision === 'YES') where.needsRevision = true;
    if (filters.needsRevision === 'NO') where.needsRevision = false;

    if (filters.topicId && filters.topicId !== 'ALL') where.topicId = filters.topicId;
    if (filters.practiceAttemptId && filters.practiceAttemptId !== 'ALL') where.practiceAttemptId = filters.practiceAttemptId;

    if (filters.startDate && filters.endDate) {
        where.mistakeDate = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
    }

    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { correctConcept: { contains: filters.search, mode: 'insensitive' } },
            { notes: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    return prisma.gateMistake.findMany({
        where,
        orderBy: { mistakeDate: 'desc' },
        include: {
            topic: { select: { title: true, subject: true } },
            practiceAttempt: { select: { attemptType: true, sourceName: true, paperCode: true, paperYear: true } }
        }
    });
}

export async function updateGateMistake(userId: string, id: string, data: any) {
    const mistake = await prisma.gateMistake.findFirst({ where: { id, userId } });
    if (!mistake) throw new AppError('Mistake not found', HTTP_STATUS.NOT_FOUND);

    if (data.topicId && data.topicId !== mistake.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }
    if (data.practiceAttemptId && data.practiceAttemptId !== mistake.practiceAttemptId) {
        const attempt = await prisma.gatePracticeAttempt.findFirst({ where: { id: data.practiceAttemptId, userId } });
        if (!attempt) throw new AppError('Provided practice attempt not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    const updateData = { ...data };

    if (data.mistakeDate) updateData.mistakeDate = new Date(data.mistakeDate);

    if (data.status === 'RESOLVED' && mistake.status !== 'RESOLVED') {
        updateData.resolvedAt = new Date();
    } else if (data.status === 'OPEN' && mistake.status !== 'OPEN') {
        updateData.resolvedAt = null;
    }

    return prisma.gateMistake.update({
        where: { id, userId },
        data: updateData
    });
}

export async function deleteGateMistake(userId: string, id: string) {
    const mistake = await prisma.gateMistake.findFirst({ where: { id, userId } });
    if (!mistake) throw new AppError('Mistake not found', HTTP_STATUS.NOT_FOUND);

    return prisma.gateMistake.delete({ where: { id, userId } });
}

export async function getMistakeSummary(userId: string) {
    const allMistakes = await prisma.gateMistake.findMany({
        where: { userId },
        include: { topic: { select: { title: true } } }
    });

    const summary = {
        total: allMistakes.length,
        open: 0,
        resolved: 0,
        needsRevision: 0,
        byCategory: {} as Record<string, number>,
        byTopic: {} as Record<string, { total: number; open: number; resolved: number }>
    };

    allMistakes.forEach((m: any) => {
        if (m.status === 'OPEN') summary.open++;
        if (m.status === 'RESOLVED') summary.resolved++;
        if (m.needsRevision) summary.needsRevision++;

        summary.byCategory[m.category] = (summary.byCategory[m.category] || 0) + 1;

        if (m.topicId) {
            const title = m.topic?.title || 'Unknown Topic';
            if (!summary.byTopic[title]) {
                summary.byTopic[title] = { total: 0, open: 0, resolved: 0 };
            }
            summary.byTopic[title].total++;
            if (m.status === 'OPEN') summary.byTopic[title].open++;
            if (m.status === 'RESOLVED') summary.byTopic[title].resolved++;
        }
    });

    return summary;
}

// ─── GATE Revision Hub ──────────────────────────────────────────────

export async function createGateRevisionItem(userId: string, data: any) {
    if (data.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }
    if (data.mistakeId) {
        const mistake = await prisma.gateMistake.findFirst({ where: { id: data.mistakeId, userId } });
        if (!mistake) throw new AppError('Provided mistake not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }
    if (data.practiceAttemptId) {
        const attempt = await prisma.gatePracticeAttempt.findFirst({ where: { id: data.practiceAttemptId, userId } });
        if (!attempt) throw new AppError('Provided practice attempt not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    return prisma.gateRevisionItem.create({
        data: {
            ...data,
            scheduledDate: new Date(data.scheduledDate),
            userId
        }
    });
}

export async function getGateRevisionItems(userId: string, filters: any = {}) {
    const where: any = { userId };

    if (filters.status && filters.status !== 'ALL') where.status = filters.status;
    if (filters.priority && filters.priority !== 'ALL') where.priority = filters.priority;
    if (filters.topicId && filters.topicId !== 'ALL') where.topicId = filters.topicId;

    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { notes: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    if (filters.dateFilter && filters.dateFilter !== 'ALL') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        if (filters.dateFilter === 'TODAY') {
            where.scheduledDate = { gte: startOfToday, lt: startOfTomorrow };
        } else if (filters.dateFilter === 'OVERDUE') {
            where.scheduledDate = { lt: startOfToday };
        } else if (filters.dateFilter === 'UPCOMING') {
            where.scheduledDate = { gte: startOfTomorrow };
        }
    }

    if (filters.source && filters.source !== 'ALL') {
        if (filters.source === 'MISTAKE') where.mistakeId = { not: null };
        if (filters.source === 'PRACTICE') where.practiceAttemptId = { not: null };
        if (filters.source === 'TOPIC_ONLY') {
            where.topicId = { not: null };
            where.mistakeId = null;
            where.practiceAttemptId = null;
        }
        if (filters.source === 'STANDALONE') {
            where.topicId = null;
            where.mistakeId = null;
            where.practiceAttemptId = null;
        }
    }

    return prisma.gateRevisionItem.findMany({
        where,
        orderBy: { scheduledDate: 'asc' },
        include: {
            topic: { select: { title: true } },
            mistake: { select: { title: true, status: true, needsRevision: true } },
            practiceAttempt: { select: { attemptType: true, sourceName: true, paperCode: true, paperYear: true } }
        }
    });
}

export async function updateGateRevisionItem(userId: string, id: string, data: any) {
    const item = await prisma.gateRevisionItem.findFirst({ where: { id, userId } });
    if (!item) throw new AppError('Revision item not found', HTTP_STATUS.NOT_FOUND);

    if (data.topicId && data.topicId !== item.topicId) {
        const topic = await prisma.gatePersonalTopic.findFirst({ where: { id: data.topicId, userId } });
        if (!topic) throw new AppError('Provided topic not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }
    if (data.mistakeId && data.mistakeId !== item.mistakeId) {
        const mistake = await prisma.gateMistake.findFirst({ where: { id: data.mistakeId, userId } });
        if (!mistake) throw new AppError('Provided mistake not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }
    if (data.practiceAttemptId && data.practiceAttemptId !== item.practiceAttemptId) {
        const attempt = await prisma.gatePracticeAttempt.findFirst({ where: { id: data.practiceAttemptId, userId } });
        if (!attempt) throw new AppError('Provided practice attempt not found or access denied.', HTTP_STATUS.FORBIDDEN);
    }

    const updateData = { ...data };
    if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);

    return prisma.gateRevisionItem.update({
        where: { id, userId },
        data: updateData
    });
}

export async function deleteGateRevisionItem(userId: string, id: string) {
    const item = await prisma.gateRevisionItem.findFirst({ where: { id, userId } });
    if (!item) throw new AppError('Revision item not found', HTTP_STATUS.NOT_FOUND);

    return prisma.gateRevisionItem.delete({ where: { id, userId } });
}

export async function reviewGateRevisionItem(userId: string, id: string) {
    const item = await prisma.gateRevisionItem.findFirst({ where: { id, userId } });
    if (!item) throw new AppError('Revision item not found', HTTP_STATUS.NOT_FOUND);

    return prisma.gateRevisionItem.update({
        where: { id, userId },
        data: {
            reviewCount: item.reviewCount + 1,
            lastReviewedAt: new Date()
        }
    });
}

export async function completeGateRevisionItem(userId: string, id: string) {
    const item = await prisma.gateRevisionItem.findFirst({ where: { id, userId } });
    if (!item) throw new AppError('Revision item not found', HTTP_STATUS.NOT_FOUND);

    return prisma.gateRevisionItem.update({
        where: { id, userId },
        data: {
            status: 'COMPLETED',
            completedAt: new Date()
        }
    });
}

export async function reopenGateRevisionItem(userId: string, id: string) {
    const item = await prisma.gateRevisionItem.findFirst({ where: { id, userId } });
    if (!item) throw new AppError('Revision item not found', HTTP_STATUS.NOT_FOUND);

    return prisma.gateRevisionItem.update({
        where: { id, userId },
        data: {
            status: 'PENDING',
            completedAt: null
        }
    });
}

export async function rescheduleGateRevisionItem(userId: string, id: string, newDate: string) {
    const item = await prisma.gateRevisionItem.findFirst({ where: { id, userId } });
    if (!item) throw new AppError('Revision item not found', HTTP_STATUS.NOT_FOUND);

    const updated = await prisma.gateRevisionItem.update({
        where: { id, userId },
        data: { status: 'PENDING', scheduledDate: new Date(newDate), updatedAt: new Date() }
    });
    return updated;
}

// ─── GATE Readiness Assessment Engine ─────────────────────────────

export async function getGateReadiness(userId: string) {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(now.getDate() - 28);

    const [topics, sessions, practiceAttempts, mistakes, revisions] = await Promise.all([
        prisma.gatePersonalTopic.findMany({ where: { userId } }),
        prisma.gateStudySession.findMany({ where: { userId, startedAt: { gte: windowStart } } }),
        prisma.gatePracticeAttempt.findMany({ where: { userId } }),
        prisma.gateMistake.findMany({ where: { userId } }),
        prisma.gateRevisionItem.findMany({ where: { userId } })
    ]);

    let topicScore: number | null = null;
    let topicBasis = 'Start tracking your preparation topics to measure topic progress.';
    if (topics.length > 0) {
        const comp = topics.filter(t => t.status === 'COMPLETED').length;
        topicScore = (comp / topics.length) * 100;
        topicBasis = `${comp} / ${topics.length} tracked topics completed`;
    }

    let consScore: number | null = null;
    let consBasis = 'Record study sessions to measure your recent consistency.';
    if (sessions.length > 0) {
        const uniqueDays = new Set(sessions.map(s => s.startedAt.toISOString().split('T')[0])).size;
        consScore = Math.min((uniqueDays / 28) * 100, 100);
        consBasis = `${uniqueDays} active study days in the last 28 days`;
    }

    const recentPractice = practiceAttempts.filter(a => a.attemptDate >= windowStart && (a.attemptType === 'PYQ' || a.attemptType === 'PRACTICE'));
    let actScore: number | null = null;
    let actBasis = 'Insufficient practice activity over the last 28 days.';
    if (recentPractice.length > 0) {
        const c = recentPractice.length;
        if (c >= 15) actScore = 100;
        else if (c >= 10) actScore = 80;
        else if (c >= 6) actScore = 60;
        else if (c >= 3) actScore = 40;
        else actScore = 20;
        actBasis = `${c} PYQ/Practice attempts in the last 28 days`;
    }

    const accAttempts = practiceAttempts.filter(a => (a.attemptType === 'PYQ' || a.attemptType === 'PRACTICE') && a.attemptedQuestions > 0);
    let accScore: number | null = null;
    let accBasis = 'No valid attempted questions found.';
    if (accAttempts.length > 0) {
        let totalAtt = 0, totalCorr = 0;
        accAttempts.forEach(a => { totalAtt += a.attemptedQuestions; totalCorr += a.correctAnswers; });
        if (totalAtt > 0) {
            accScore = (totalCorr / totalAtt) * 100;
            accBasis = `${totalCorr} correct / ${totalAtt} attempted questions`;
        }
    }

    const mocks = practiceAttempts.filter(a => a.attemptType === 'MOCK' && a.attemptedQuestions > 0);
    let mockScore: number | null = null;
    let mockBasis = 'No mock attempts have been recorded yet.';
    if (mocks.length > 0) {
        let totalAtt = 0, totalCorr = 0;
        mocks.forEach(m => { totalAtt += m.attemptedQuestions; totalCorr += m.correctAnswers; });
        if (totalAtt > 0) {
            mockScore = (totalCorr / totalAtt) * 100;
            mockBasis = `Based on recorded mock data`;
        }
    }

    let misScore: number | null = null;
    let misBasis = 'No mistakes recorded yet.';
    if (mistakes.length > 0) {
        const res = mistakes.filter(m => m.status === 'RESOLVED').length;
        misScore = (res / mistakes.length) * 100;
        misBasis = `${res} resolved / ${mistakes.length} total mistakes`;
    }

    let revScore: number | null = null;
    let revBasis = 'No revision items have been scheduled.';
    if (revisions.length > 0) {
        const comp = revisions.filter(r => r.status === 'COMPLETED').length;
        revScore = (comp / revisions.length) * 100;
        revBasis = `${comp} completed / ${revisions.length} total revision items`;
    }

    const dims = {
        topicProgress: { score: topicScore, basis: topicBasis },
        studyConsistency: { score: consScore, basis: consBasis },
        practiceActivity: { score: actScore, basis: actBasis },
        practiceAccuracy: { score: accScore, basis: accBasis },
        mockPerformance: { score: mockScore, basis: mockBasis },
        mistakeManagement: { score: misScore, basis: misBasis },
        revisionDiscipline: { score: revScore, basis: revBasis }
    };

    const validDims = [topicScore, consScore, actScore, accScore, mockScore, misScore, revScore].filter(s => s !== null) as number[];
    const dataCoverage = validDims.length;

    let overallScore: number | null = null;
    let overallStatus = 'Building your readiness profile';

    if (dataCoverage >= 3) {
        overallScore = validDims.reduce((a, b) => a + b, 0) / dataCoverage;
        if (overallScore >= 90) overallStatus = 'Highly consistent';
        else if (overallScore >= 75) overallStatus = 'Strong';
        else if (overallScore >= 60) overallStatus = 'Established';
        else if (overallScore >= 40) overallStatus = 'Developing';
        else overallStatus = 'Early-stage';
    }

    const observations: string[] = [];
    if (topicScore !== null && topicScore < 50) {
        observations.push("Your tracked topic completion is currently limited. Continue updating topic status as you progress.");
    }
    if (consScore !== null && consScore < 50) {
        observations.push("You have recorded study activity on relatively few days in the last 28 days.");
    }
    if (accScore !== null && accScore < 50) {
        observations.push("Your recorded practice accuracy is currently lower than your other available signals.");
    }
    if (revScore !== null && revScore < 50) {
        observations.push("You have more pending revision items than completed revision items.");
    }
    if (mockScore === null) {
        observations.push("No mock-performance signal is available yet. Record mock results when you complete external or official mock tests.");
    }

    return {
        overallScore,
        overallStatus,
        dataCoverage,
        dimensions: dims,
        observations,
        generatedAt: now.toISOString()
    };
}

// ─── GATE Comprehensive Analytics ─────────────────────────────────

export async function getComprehensiveAnalytics(userId: string) {
    const profile = await prisma.gateUserProfile.findFirst({ where: { userId } });
    const targetWeeklyMinutes = profile ? profile.weeklyHours * 60 : null;

    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(now.getDate() - (now.getDay() || 7) + 1);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const [
        topics,
        thisWeekSessions,
        lastWeekSessions,
        allSessions,
        attempts,
        mistakes,
        revisions,
        thisWeekTasks
    ] = await Promise.all([
        prisma.gatePersonalTopic.findMany({ where: { userId } }),
        prisma.gateStudySession.findMany({ where: { userId, startedAt: { gte: startOfThisWeek } } }),
        prisma.gateStudySession.findMany({ where: { userId, startedAt: { gte: startOfLastWeek, lte: endOfLastWeek } } }),
        prisma.gateStudySession.findMany({ where: { userId } }),
        prisma.gatePracticeAttempt.findMany({ where: { userId } }),
        prisma.gateMistake.findMany({ where: { userId } }),
        prisma.gateRevisionItem.findMany({ where: { userId } }),
        prisma.gateStudyTask.findMany({ where: { userId, plannedDate: { gte: startOfThisWeek } } })
    ]);

    const totalTopics = topics.length;
    const completedTopics = topics.filter(t => t.status === 'COMPLETED').length;
    const learningTopics = topics.filter(t => t.status === 'LEARNING').length;
    const revisionTopics = topics.filter(t => t.status === 'NEEDS_REVISION').length;
    const notStartedTopics = topics.filter(t => t.status === 'NOT_STARTED').length;
    const topicProgressPercent = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    const thisWeekMinutes = thisWeekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const lastWeekMinutes = lastWeekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const plannedThisWeekMinutes = thisWeekTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    let sessionDurationsByType: Record<string, number> = {};
    allSessions.forEach(s => {
        sessionDurationsByType[s.sessionType] = (sessionDurationsByType[s.sessionType] || 0) + s.durationMinutes;
    });

    const validAttempts = attempts.filter(a => a.totalQuestions > 0);
    const pyqList = validAttempts.filter(a => a.attemptType === 'PYQ');
    const practiceList = validAttempts.filter(a => a.attemptType === 'PRACTICE');
    const mockList = validAttempts.filter(a => a.attemptType === 'MOCK');

    const calcAccuracy = (arr: any[]) => {
        let totalTries = 0, totalCorrect = 0;
        arr.forEach(a => { totalTries += a.attemptedQuestions; totalCorrect += a.correctAnswers; });
        return totalTries > 0 ? (totalCorrect / totalTries) * 100 : null;
    }

    const mockMarks = mockList.filter(m => m.marksObtained !== null).map(m => m.marksObtained as number);
    let bestMock = null, latestMock = null, averageMock = null;
    if (mockMarks.length > 0) {
        bestMock = Math.max(...mockMarks);
        averageMock = mockMarks.reduce((a, b) => a + b, 0) / mockMarks.length;
        const datedList = [...mockList].sort((a, b) => new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime());
        latestMock = datedList[0]?.marksObtained ?? null;
    }

    const mistakeSummary = {
        total: mistakes.length,
        open: mistakes.filter(m => m.status === 'OPEN').length,
        resolved: mistakes.filter(m => m.status === 'RESOLVED').length,
        needsRevision: mistakes.filter(m => m.needsRevision).length,
        byCategory: {} as Record<string, number>
    };
    mistakes.forEach(m => { mistakeSummary.byCategory[m.category] = (mistakeSummary.byCategory[m.category] || 0) + 1; });

    let revisionsDueToday = 0, revisionsOverdue = 0, pendingRevisions = 0, completedRevisions = 0, upcomingRevisions = 0;
    const todayStr = now.toISOString().split('T')[0];
    revisions.forEach(r => {
        if (r.status === 'COMPLETED') { completedRevisions++; return; }
        pendingRevisions++;
        const tDate = r.scheduledDate.toISOString().split('T')[0];
        if (tDate < todayStr) revisionsOverdue++;
        else if (tDate === todayStr) revisionsDueToday++;
        else upcomingRevisions++;
    });

    let recentItems: any[] = [];
    thisWeekSessions.forEach(s => recentItems.push({ type: 'Session', desc: `Studied for ${s.durationMinutes} minutes`, date: s.startedAt }));
    attempts.forEach(s => recentItems.push({ type: 'Practice', desc: `Recorded ${s.attemptType} attempt`, date: s.attemptDate }));
    mistakes.forEach(s => recentItems.push({ type: 'Mistake', desc: `Added mistake: ${s.title}`, date: s.createdAt }));
    revisions.forEach(s => { if (s.status === 'COMPLETED') recentItems.push({ type: 'Revision', desc: `Completed revision: ${s.title}`, date: s.completedAt || s.updatedAt }) });
    recentItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
        overview: { targetWeeklyMinutes, topicProgressPercent },
        topicProgress: { totalTopics, completedTopics, learningTopics, revisionTopics, notStartedTopics, topicProgressPercent },
        studyActivity: { thisWeekMinutes, lastWeekMinutes, plannedThisWeekMinutes, thisWeekSessionsCount: thisWeekSessions.length, averageSessionDuration: thisWeekSessions.length ? thisWeekMinutes / thisWeekSessions.length : 0, sessionDurationsByType },
        practicePerformance: {
            total: validAttempts.length, pyq: pyqList.length, practice: practiceList.length, mock: mockList.length,
            accuracyOverall: calcAccuracy(validAttempts) || 0, accuracyPyq: calcAccuracy(pyqList) || 0, accuracyPractice: calcAccuracy(practiceList) || 0, accuracyMock: calcAccuracy(mockList) || 0
        },
        mistakes: mistakeSummary,
        revisions: { pending: pendingRevisions, dueToday: revisionsDueToday, overdue: revisionsOverdue, upcoming: upcomingRevisions, completed: completedRevisions },
        mocks: { totalAttempts: mockList.length, bestMarks: bestMock, averageMarks: averageMock, latestMarks: latestMock, averageAccuracy: calcAccuracy(mockList) },
        recentActivity: recentItems.slice(0, 10)
    };
}

export async function getRevisionSummary(userId: string) {
    const items = await prisma.gateRevisionItem.findMany({ where: { userId } });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    let pending = 0;
    let completed = 0;
    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;
    let totalReviews = 0;

    items.forEach((item: any) => {
        totalReviews += item.reviewCount;
        if (item.status === 'COMPLETED') {
            completed++;
        } else {
            pending++;
            const sDate = new Date(item.scheduledDate);
            if (sDate < startOfToday) overdue++;
            else if (sDate >= startOfTomorrow) upcoming++;
            else dueToday++;
        }
    });

    return {
        total: items.length,
        pending,
        completed,
        dueToday,
        overdue,
        upcoming,
        totalReviews
    };
}
