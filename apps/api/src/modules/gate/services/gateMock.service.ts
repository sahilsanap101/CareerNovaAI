import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generates an Authentic Mock Test ensuring NO hallucinated questions are appended.
export const generateAuthenticMock = async (params: { userId: string, examId: string, paperId: string, subjectId?: string, topicId?: string, type: string, count: number }) => {
    const { examId, paperId, count, topicId, subjectId, type } = params;

    // Strict scoping checking
    let whereClause: any = { examId, paperId };
    if (subjectId) whereClause.subjectId = subjectId;
    if (topicId) whereClause.topicId = topicId;

    // Fetch verified authentic questions mapped to rule logic
    const availableQuestions = await (prisma as any).gateQuestion.findMany({
        where: whereClause,
        take: count * 2 // Overfetch to shuffle
    });

    if (availableQuestions.length < count) {
        throw new Error(`Insufficient verified question volume. Requested ${count}, but only ${availableQuestions.length} authenticated questions exist matching these bounds. We do not generate fake ones.`);
    }

    // Shuffle and slice reliably
    const selectedQuestions = availableQuestions.sort(() => 0.5 - Math.random()).slice(0, count);

    // Persist Mock Layout tied to real question IDs
    const mockTest = await (prisma as any).gateMockTest.create({
        data: {
            examId,
            paperId,
            title: `Generated ${type} Assessment`,
            isOfficial: false,
            durationMins: count * 3, // Roughly 3 mins per question scale
            totalMarks: selectedQuestions.reduce((sum: number, q: any) => sum + q.marks, 0),
            questions: {
                create: selectedQuestions.map((q: any) => ({
                    actualQuestionId: q.id, // THE STRICT AUTHENTIC BINDING
                    questionText: q.content,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    marks: q.marks,
                    questionType: q.questionType
                }))
            }
        }
    });

    return mockTest;
};

// Generates attempting state
export const startMockAttempt = async (userId: string, mockId: string) => {
    const mock = await (prisma as any).gateMockTest.findUnique({
        where: { id: mockId },
        include: { questions: true }
    });
    if (!mock) throw new Error("Target Mock completely invalid");

    const attempt = await (prisma as any).gateMockAttempt.create({
        data: {
            userId, mockId, status: 'IN_PROGRESS'
        }
    });

    return { attemptId: attempt.id, durationMins: mock.durationMins };
};

export const submitMockAttempt = async (attemptId: string, payload: any) => {
    const attempt = await (prisma as any).gateMockAttempt.findUnique({
        where: { id: attemptId },
        include: { mock: { include: { questions: true } } }
    });

    if (!attempt || attempt.status === 'COMPLETED') throw new Error("Invalid or completed attempt");

    let score = 0;
    const analytics = { marksLost: 0, unattempted: 0, correct: 0, incorrect: 0, timeSpent: 0 };

    // Evaluate mapped payload binding
    for (const q of attempt.mock.questions) {
        const userAnswer = payload.answers[q.id];
        let isCorrect = false;

        if (!userAnswer) {
            analytics.unattempted++;
            isCorrect = false; // Left blank - 0 marks penalty
        } else if (q.questionType === 'MSQ') {
            const arr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
            const correctArr = JSON.parse(q.correctAnswer);
            isCorrect = arr.length === correctArr.length && arr.every(a => correctArr.includes(a));
            if (isCorrect) score += q.marks;
        } else if (q.questionType === 'NAT') {
            const num = parseFloat(userAnswer);
            const [min, max] = q.correctAnswer.split(',').map(Number);
            isCorrect = num >= min && num <= max;
            if (isCorrect) score += q.marks;
        } else {
            isCorrect = (userAnswer === q.correctAnswer);
            if (isCorrect) {
                score += q.marks;
            } else {
                score -= (q.marks / 3); // Official 1/3 negative bounds
                analytics.marksLost += (q.marks / 3);
            }
        }

        if (userAnswer) {
            isCorrect ? analytics.correct++ : analytics.incorrect++;
        }

        // Persist individual answer bindings
        await (prisma as any).gateMockAnswer.create({
            data: {
                attemptId,
                questionId: q.id,
                userAnswer: userAnswer ? String(userAnswer) : null,
                isCorrect,
                timeSpentMs: payload.timeSpentMap?.[q.id] || 0
            }
        });
    }

    // Persist final analytics footprint
    const completedAttempt = await (prisma as any).gateMockAttempt.update({
        where: { id: attemptId },
        data: {
            status: 'COMPLETED',
            score: Math.max(0, score),
            completedAt: new Date()
        }
    });

    await (prisma as any).gateMockAnalytics.create({
        data: {
            attemptId,
            weakTopics: { rate: analytics.incorrect },
            strongTopics: { rate: analytics.correct }
        }
    });

    return { completedAttempt, analytics };
};
