import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generatePracticeSession = async (userId: string, params: any) => {
    const { subjectId, topicId, difficulty, quantity = 10, focusWeakAreas, focusPrereqs } = params;

    let targetedIds: string[] = [];

    // 1. Weak Areas Focus
    if (focusWeakAreas) {
        const weak = await (prisma as any).gateTopicMastery.findMany({
            where: { userId, masteryLevel: { lt: 50 }, ...(topicId ? { topicId } : {}) },
            take: 5
        });
        targetedIds.push(...weak.map((w: any) => w.topicId));
    }

    // 2. Prerequisite Check Focus
    if (focusPrereqs && topicId) {
        const prereqs = await (prisma as any).gateTopicPrerequisite.findMany({
            where: { targetTopicId: topicId }
        });
        targetedIds.push(...prereqs.map((p: any) => p.prereqTopicId));
    }

    const filters: any = { status: 'VERIFIED' };
    if (subjectId) filters.subjectId = subjectId;
    if (topicId && !focusPrereqs) filters.topicId = topicId;
    if (difficulty) filters.difficulty = difficulty;

    if (targetedIds.length > 0) {
        filters.topicId = { in: targetedIds };
    }

    // Fetch previously attempted to de-prioritize exact duplicates if possible
    const previousAttempts = await (prisma as any).gateQuestionAttempt.findMany({
        where: { userId },
        select: { questionId: true }
    });
    const attemptedIds = previousAttempts.map((a: any) => a.questionId);

    let questions = await (prisma as any).gateQuestion.findMany({
        where: { ...filters, id: { notIn: attemptedIds } },
        take: parseInt(quantity)
    });

    if (questions.length < quantity) {
        // Fallback: allow repetitions if we exhausted fresh questions
        const padding = await (prisma as any).gateQuestion.findMany({
            where: filters,
            take: parseInt(quantity) - questions.length
        });
        questions.push(...padding);
    }

    return questions;
};

// Records an attempt robustly mapping evidence to Mastery & Tracking Mistakes
export const recordPracticeAttempt = async (userId: string, data: any) => {
    const { questionId, answerKey, timeSpentMs, confidence, mistakeType, notes } = data;

    const question = await (prisma as any).gateQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new Error("Question not found");

    // Dynamic Bounds/Penalty calculations natively here
    let isCorrect = false;
    let earnedMarks = 0;

    if (question.questionType === 'MCQ') {
        isCorrect = answerKey === question.correctAnswer;
        earnedMarks = isCorrect ? question.marks : -(question.marks / 3);
    } else if (question.questionType === 'MSQ') {
        const correctArray = question.correctAnswer.split(',').sort().join(',');
        const submittedArray = String(answerKey).split(',').sort().join(',');
        isCorrect = (correctArray === submittedArray);
        earnedMarks = isCorrect ? question.marks : 0;
    } else if (question.questionType === 'NAT') {
        const bounds = JSON.parse(String(question.correctAnswer));
        const submittedNum = parseFloat(answerKey);
        isCorrect = submittedNum >= bounds.min && submittedNum <= bounds.max;
        earnedMarks = isCorrect ? question.marks : 0;
    }

    // Record the Attempt securely inside DB
    const attempt = await (prisma as any).gateQuestionAttempt.create({
        data: {
            userId,
            questionId,
            userAnswer: String(answerKey),
            isCorrect,
            timeSpentsMs: timeSpentMs || 0,
        }
    });

    // Handle Mistakes securely inside specific tracker model
    if (!isCorrect && mistakeType) { // Enums: CALCULATION, CONCEPTUAL, READING, TIME_PRESSURE
        await (prisma as any).gateMistakeTracker.create({
            data: {
                userId,
                questionId,
                mistakeType,
                notes: notes || "Logged during Practice Engine attempt",
                resolved: false
            }
        });
    }

    // Analyze Error Patterns -> Pattern recognition AI algorithms (deterministic)
    let recommendations = [];
    if (!isCorrect) {
        const recentMistakes = await (prisma as any).gateMistakeTracker.findMany({
            where: { userId, question: { topicId: question.topicId }, resolved: false },
            include: { question: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const conceptualCount = recentMistakes.filter((m: any) => m.mistakeType === 'CONCEPTUAL').length;
        const calculationCount = recentMistakes.filter((m: any) => m.mistakeType === 'CALCULATION').length;
        const readingCount = recentMistakes.filter((m: any) => m.mistakeType === 'READING').length;

        if (conceptualCount >= 3) {
            recommendations.push("Repeated Conceptual Failure Detected: Strongly recommend reviewing base Prerequisites and foundation videos before attempting more questions in this topic.");
        }
        if (calculationCount >= 2) {
            recommendations.push("Pattern: Formula/Calculation errors. Focus on step-by-step un-timed working. Check your units.");
        }
        if (readingCount >= 2) {
            recommendations.push("Pattern: Misreading constraints. Ensure you verify if the question asks for TRUE or FALSE bounding.");
        }
        if (conceptualCount === 0 && calculationCount === 0 && readingCount === 0 && recentMistakes.length >= 3) {
            recommendations.push("You are struggling consistently here. Try a foundational Mini-Test on this exact topic to recalibrate.");
        }
    }

    // Evidence-Based Mastery calculation
    if (question.topicId) {
        // Delta bound depends on accuracy, difficulty, confidence
        let delta = isCorrect ? 3 : -2;
        if (isCorrect && question.difficulty === 'HARD') delta += 2;
        if (!isCorrect && question.difficulty === 'EASY') delta -= 2; // Punish easy failures
        if (isCorrect && confidence === 'LOW') delta -= 1.5; // Lack of confidence halves impact

        const existingMastery = await (prisma as any).gateTopicMastery.findFirst({ where: { userId, topicId: question.topicId } });
        if (existingMastery) {
            const newLvl = Math.max(0, Math.min(100, existingMastery.masteryLevel + delta));
            await (prisma as any).gateTopicMastery.update({
                where: { id: existingMastery.id },
                data: { masteryLevel: newLvl }
            });
        } else {
            await (prisma as any).gateTopicMastery.create({
                data: { userId, topicId: question.topicId, masteryLevel: Math.max(0, 10 + delta) }
            });
        }
    }

    return {
        isCorrect,
        earnedMarks,
        explanation: question.explanation,
        suggestedMistakeCategory: (!isCorrect && !mistakeType) ? _guessMistakeClassification(question.questionType) : null,
        recommendations
    };
};

const _guessMistakeClassification = (qType: string) => {
    // Only simple deterministic guesses (no fake AI)
    if (qType === 'NAT') return 'CALCULATION';
    if (qType === 'MSQ') return 'READING'; // Did not read all options
    return 'CONCEPTUAL'; // Fallback
};
