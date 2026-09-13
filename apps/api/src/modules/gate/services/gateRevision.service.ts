import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generates the Mistake Book & Revision layout natively mapping real items
export const getRevisionDashboard = async (userId: string) => {
    const now = new Date();

    const queues = await (prisma as any).gateRevisionQueue.findMany({
        where: { userId },
        include: { topic: { select: { title: true } } }
    });

    const mistakes = await (prisma as any).gateMistakeTracker.findMany({
        where: { userId, resolved: false },
        include: { question: { select: { content: true, mistakeType: true, topicId: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return {
        overdue: queues.filter((q: any) => q.nextReviewAt < now),
        dueToday: queues.filter((q: any) => q.nextReviewAt >= now && q.nextReviewAt.toDateString() === now.toDateString()),
        upcoming: queues.filter((q: any) => q.nextReviewAt > now && q.nextReviewAt.toDateString() !== now.toDateString()),
        mistakes
    };
};

// Log a mistake safely, inserting to revision queue implicitly preventing duplicate bounds
export const logMistake = async (userId: string, payload: any) => {
    const { questionId, type, notes, correctApproach, confidenceLevel, topicId } = payload;

    // Upsert mistake
    const mistake = await (prisma as any).gateMistakeTracker.create({
        data: {
            userId, questionId, mistakeType: type,
            notes, correctApproach, confidenceLevel
        }
    });

    // Force injection to RevisionQueue for immediate tomorrow bound
    if (topicId) {
        const existingQueue = await (prisma as any).gateRevisionQueue.findFirst({ where: { userId, topicId } });
        const tmrw = new Date();
        tmrw.setDate(tmrw.getDate() + 1);

        if (!existingQueue) {
            await (prisma as any).gateRevisionQueue.create({
                data: { userId, topicId, nextReviewAt: tmrw }
            });
        }
    }

    return mistake;
};

// Bounded Spaced Repetition Logic - Simple multiplier limits (no fake predictive ML)
export const evaluateRevision = async (userId: string, topicId: string, performanceScore: number) => {
    const queue = await (prisma as any).gateRevisionQueue.findFirst({ where: { userId, topicId } });

    if (!queue) throw new Error("Topic not in active Revision queue bounds");

    let newCount = queue.reviewCount + 1;
    let daysToAdd = 1;

    // Strict performance shifting
    if (performanceScore >= 80) {
        daysToAdd = Math.min(newCount * 3, 30); // Caps at 30 days max stretch
    } else if (performanceScore >= 50) {
        daysToAdd = 2; // Needs a quick redo
        newCount = Math.max(0, newCount - 1); // Penalize retention rank
    } else {
        daysToAdd = 1; // Immediate redo bounds tomorrow!
        newCount = 0; // Reset retention streak!

        // Downward mastery penalty update mapping
        await (prisma as any).gateTopicMastery.updateMany({
            where: { userId, topicId },
            data: { masteryLevel: { decrement: 5.0 } }
        });
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    const updated = await (prisma as any).gateRevisionQueue.update({
        where: { id: queue.id },
        data: {
            lastReviewAt: new Date(),
            nextReviewAt: nextDate,
            reviewCount: newCount,
            performance: performanceScore
        }
    });

    return { updated, appliedIntervalDays: daysToAdd };
};

// Resolve a mistake so it stops bothering metrics
export const resolveMistake = async (mistakeId: string, userId: string) => {
    return await (prisma as any).gateMistakeTracker.updateMany({
        where: { id: mistakeId, userId },
        data: { resolved: true }
    });
};
