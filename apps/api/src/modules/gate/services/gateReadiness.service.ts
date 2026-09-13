import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const calculateBaseReadiness = (metrics: any) => {
    // Explicit, verifiable, deterministic logic:
    // Syllabus 20%, Mastery 25%, PYQ 15%, Practice 15%, Mock 15%, Revision 5%, Consistency 5%
    const score = (
        (metrics.syllabusCoverage || 0) * 0.20 +
        (metrics.masteryAvg || 0) * 0.25 +
        (metrics.pyqAccuracy || 0) * 0.15 +
        (metrics.practiceAccuracy || 0) * 0.15 +
        (metrics.mockAvgPercent || 0) * 0.15 +
        (metrics.revisionHealth || 0) * 0.05 +
        (metrics.consistencyScore || 0) * 0.05
    );
    return Math.min(100, Math.max(0, score));
};

export const computeReadinessAnalytics = async (userId: string, year: string, overrides: any = {}) => {

    // 1. Syllabus & Mastery
    const masteryData = await (prisma as any).gateTopicMastery.findMany({ where: { userId } });
    const totalTopics = await (prisma as any).gateSyllabusTopic.count();
    const syllabusCoverage = overrides.syllabusCoverage ?? (totalTopics > 0 ? (masteryData.length / totalTopics) * 100 : 0);
    const masteryAvg = overrides.masteryAvg ?? (masteryData.length > 0 ? masteryData.reduce((a: any, b: any) => a + b.masteryLevel, 0) / masteryData.length : 0);

    // 2. Practice & PYQ
    const attempts = await (prisma as any).gateQuestionAttempt.findMany({
        where: { userId },
        include: { question: { select: { isOfficialPyq: true, marks: true } } }
    });

    const pyqs = attempts.filter((a: any) => a.question.isOfficialPyq);
    const pyqAccuracy = overrides.pyqAccuracy ?? (pyqs.length > 0 ? (pyqs.filter((a: any) => a.isCorrect).length / pyqs.length) * 100 : 0);

    const practices = attempts.filter((a: any) => !a.question.isOfficialPyq);
    const practiceAccuracy = overrides.practiceAccuracy ?? (practices.length > 0 ? (practices.filter((a: any) => a.isCorrect).length / practices.length) * 100 : 0);

    // 3. Mock Performance
    const mocks = await (prisma as any).gateMockAttempt.findMany({
        where: { userId, status: 'COMPLETED' },
        include: { mock: { select: { totalMarks: true } } }
    });
    const mockAvgPercent = overrides.mockAvgPercent ?? (mocks.length > 0 ? mocks.reduce((a: any, b: any) => a + ((b.score / b.mock.totalMarks) * 100), 0) / mocks.length : 0);

    // 4. Revision & Consistency
    const revisionQueues = await (prisma as any).gateRevisionQueue.findMany({ where: { userId } });
    const overdueCount = revisionQueues.filter((q: any) => q.nextReviewAt < new Date()).length;
    const revisionHealth = overrides.revisionHealth ?? (revisionQueues.length > 0 ? Math.max(0, 100 - (overdueCount / revisionQueues.length) * 100) : 100);

    const activeSessions = await (prisma as any).gateStudySession.count({
        where: { plan: { userId }, status: 'COMPLETED', date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    });
    const consistencyScore = overrides.consistencyScore ?? Math.min(100, activeSessions * 10); // 10% per session recently

    const metrics = {
        syllabusCoverage, masteryAvg, pyqAccuracy, practiceAccuracy, mockAvgPercent, revisionHealth, consistencyScore
    };

    const overallReadiness = calculateBaseReadiness(metrics);

    // SCORE ESTIMATION LOGIC
    let scoreEstimation = null;
    let estimationWarning = "Insufficient performance history.";
    if (mocks.length >= 2 && attempts.length > 20) {
        // Deterministic bounds mapping mock performance up to realistic caps
        const rawMockBase = mocks.reduce((a: any, b: any) => a + b.score, 0) / mocks.length;
        const masteryBonus = (masteryAvg / 100) * 10;
        scoreEstimation = Math.min(100, rawMockBase + masteryBonus);
        estimationWarning = "Model-based estimate — not an official prediction.";
    }

    // MARKS LEAKAGE LOGIC
    const mistakes = await (prisma as any).gateMistakeTracker.findMany({
        where: { userId },
        include: { question: { select: { marks: true } } }
    });

    let marksLeakage = { CONCEPTUAL: 0, CARELESS: 0, CALCULATION: 0, UNCERTAIN: 0, TOTAL: 0 };
    mistakes.forEach((m: any) => {
        const amt = m.question.marks || 1;
        if (m.mistakeType === 'CONCEPTUAL') marksLeakage.CONCEPTUAL += amt;
        else if (m.mistakeType === 'CARELESS') marksLeakage.CARELESS += amt;
        else if (m.mistakeType === 'CALCULATION') marksLeakage.CALCULATION += amt;
        else marksLeakage.UNCERTAIN += amt;
        marksLeakage.TOTAL += amt;
    });

    return {
        overallReadiness,
        breakdown: metrics,
        scoreEstimation: { value: scoreEstimation, statusMessage: estimationWarning },
        marksLeakage
    };
};

export const generateCounterfactualScenario = async (userId: string, year: string, overrides: any) => {
    // "What-If" injection bypassing real metrics with user-driven numbers securely
    const custom = await computeReadinessAnalytics(userId, year, overrides);
    const baseline = await computeReadinessAnalytics(userId, year);

    return {
        baselineReadiness: baseline.overallReadiness,
        simulatedReadiness: custom.overallReadiness,
        deltaReadiness: custom.overallReadiness - baseline.overallReadiness,
        estimatedScoreDelta: (custom.scoreEstimation.value !== null && baseline.scoreEstimation.value !== null)
            ? custom.scoreEstimation.value - baseline.scoreEstimation.value : null
    };
};
