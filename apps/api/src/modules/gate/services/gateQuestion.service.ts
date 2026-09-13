import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getQuestions = async (filters: any) => {
    // Dynamically filter ensuring strictly queried attributes
    return await (prisma as any).gateQuestion.findMany({
        where: filters,
        take: filters.limit || 50,
        skip: filters.skip || 0,
        orderBy: { questionNumber: 'asc' }
    });
};

export const generatePersonalizedSet = async (userId: string, targetYear: number, limit: number = 10) => {
    // 1. Identify weak masteries for this user historically
    const weakMasteries = await (prisma as any).gateTopicMastery.findMany({
        where: { userId, masteryLevel: { lt: 50 } },
        orderBy: { masteryLevel: 'asc' },
        take: 3
    });

    const topicIds = weakMasteries.map((m: any) => m.topicId);

    // 2. Map previously attempted questions to avoid immediate repetition
    const previousAttempts = await (prisma as any).gateQuestionAttempt.findMany({
        where: { userId },
        select: { questionId: true }
    });
    const attemptedIds = previousAttempts.map((a: any) => a.questionId);

    // 3. Fetch questions mapping exactly to the targeted weak spots, avoiding repetitions
    const filter: any = {
        status: 'VERIFIED',
        id: { notIn: attemptedIds }
    };

    if (topicIds.length > 0) {
        filter.topicId = { in: topicIds };
    }

    const targetedQuestions = await (prisma as any).gateQuestion.findMany({
        where: filter,
        take: limit
    });

    // If we exhaust the weak spots, pad with random foundations
    if (targetedQuestions.length < limit) {
        const pad = await (prisma as any).gateQuestion.findMany({
            where: { status: 'VERIFIED', id: { notIn: [...attemptedIds, ...targetedQuestions.map((q: any) => q.id)] } },
            take: limit - targetedQuestions.length
        });
        targetedQuestions.push(...pad);
    }

    return targetedQuestions;
};

export const getQuestionById = async (id: string) => {
    return await (prisma as any).gateQuestion.findUnique({ where: { id } });
};

// Evaluate the submitted attempt against accurate year rules dynamically
export const recordAttempt = async (userId: string, data: any) => {
    const question = await (prisma as any).gateQuestion.findUnique({ where: { id: data.questionId } });
    if (!question) throw new Error("Question not found");

    let isCorrect = false;
    let earnedMarks = 0;

    // Core Evaluators
    if (question.questionType === 'MCQ') {
        isCorrect = data.answerKey === question.correctAnswer;
        // True GATE MCQ negative rules (1/3rd penalty map on 1 or 2 makers)
        earnedMarks = isCorrect ? question.marks : -(question.marks / 3);
    } else if (question.questionType === 'MSQ') {
        // MSQ expects exactly the array of correct strings (e.g. "A,C")
        const correctArray = question.correctAnswer.split(',').sort().join(',');
        const submittedArray = String(data.answerKey).split(',').sort().join(',');
        isCorrect = correctArray === submittedArray;
        earnedMarks = isCorrect ? question.marks : 0; // MSQ has NO negative marking
    } else if (question.questionType === 'NAT') {
        // NAT exact logic evaluating numerical bound tolerance
        const bounds = JSON.parse(String(question.correctAnswer)); // Format: { min: 1.2, max: 1.35 }
        const submittedNum = parseFloat(data.answerKey);
        isCorrect = submittedNum >= bounds.min && submittedNum <= bounds.max;
        earnedMarks = isCorrect ? question.marks : 0; // NAT has NO negative marking
    }

    const attempt = await (prisma as any).gateQuestionAttempt.create({
        data: {
            userId,
            questionId: data.questionId,
            timeSpentMs: data.timeSpentMs || 0,
            isCorrect,
            marksEarned: earnedMarks
        }
    });

    // Update global topic mastery dynamically based on attempt output
    if (question.topicId) {
        const masteryPoint = isCorrect ? 2 : -1;
        const existingMastery = await (prisma as any).gateTopicMastery.findFirst({ where: { userId, topicId: question.topicId } });
        if (existingMastery) {
            await (prisma as any).gateTopicMastery.update({
                where: { id: existingMastery.id },
                data: { masteryLevel: Math.max(0, Math.min(100, existingMastery.masteryLevel + masteryPoint)) }
            });
        } else {
            await (prisma as any).gateTopicMastery.create({
                data: { userId, topicId: question.topicId, masteryLevel: isCorrect ? 10 : 0 }
            });
        }
    }

    return { attempt, explanation: question.explanation, isCorrect, earnedMarks };
};

export const bookmarkQuestion = async (userId: string, questionId: string) => {
    // Mocking bookmark collection implementation map in JSON GateProfile since Schema doesnt have Bookmark mapping
    const profile = await (prisma as any).userGateProfile.findUnique({ where: { userId } });
    const state = profile.diagnosticState ? JSON.parse(JSON.stringify(profile.diagnosticState)) : {};

    if (!state.bookmarks) state.bookmarks = [];
    if (!state.bookmarks.includes(questionId)) state.bookmarks.push(questionId);

    await (prisma as any).userGateProfile.update({
        where: { userId },
        data: { diagnosticState: state }
    });

    return { bookmarked: true, id: questionId };
};
