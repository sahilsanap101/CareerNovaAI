import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateDailyRecommendation = async (userId: string, profile: any) => {
    // Simple heuristic routing to weakest mastery topic in DB
    const weakest = await (prisma as any).gateTopicMastery.findFirst({
        where: { userId },
        orderBy: { masteryLevel: 'asc' },
        include: { topic: true }
    });

    if (!weakest) {
        return {
            actionableTask: "Take a Diagnostic Mock Test",
            duration: "65 min",
            details: "Our engines need initial performance data to route your path correctly."
        };
    }

    return {
        actionableTask: `Study ${weakest.topic?.title || "Foundations"}`,
        duration: "45 min",
        details: "Then solve 10 targeted PYQs\nThen review mistakes"
    };
};

export const getAggregatedDashboardData = async (userId: string) => {
    const profile = await (prisma as any).userGateProfile.findUnique({
        where: { userId }
    });

    if (!profile) throw new Error("Onboarding not completed.");

    // 1. Fetch official exam dates safely
    const exam = await (prisma as any).gateExam.findFirst({
        where: { year: profile.targetYear }
    });
    const paper = await (prisma as any).gatePaper.findFirst({
        where: { paperCode: profile.targetPaperCode, examId: exam?.id }
    });

    // Calculate strict metric fallbacks
    let daysRemaining = null;
    if (paper?.examDate) {
        daysRemaining = Math.max(0, Math.ceil((new Date(paper.examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
    }

    // 2. Aggregate Readiness Arrays natively
    const masteries = await (prisma as any).gateTopicMastery.findMany({ where: { userId } });
    const avgMastery = masteries.length > 0 ? (masteries.reduce((acc: number, m: any) => acc + m.masteryLevel, 0) / masteries.length) : 0;

    // 3. Trends and History 
    const historicalReadiness = await (prisma as any).gateReadinessSnapshot.findMany({
        where: { userId, targetYear: profile.targetYear },
        orderBy: { createdAt: 'asc' },
        take: 10
    });

    const estimatedScore = historicalReadiness.length >= 3
        ? historicalReadiness[historicalReadiness.length - 1].readinessScore + 2
        : null; // Needs enough data to map trends

    // 4. Mistakes Array
    const weakAreas = await (prisma as any).gateMistakeTracker.groupBy({
        by: ['mistakeType'],
        where: { userId },
        _count: true
    });

    return {
        header: {
            targetYear: profile.targetYear,
            paperCode: profile.targetPaperCode,
            daysRemaining, // Can be null
            targetScore: profile.expectedScore,
            preparationStage: (profile as any).preparationStage || 'BEGINNER'
        },
        metrics: {
            topicMastery: avgMastery,
            hasEnoughData: historicalReadiness.length >= 3,
            estimatedScore,
        },
        dailyRecommendation: await generateDailyRecommendation(userId, profile),
        trends: {
            snapshots: historicalReadiness.map((s: any) => ({ score: s.readinessScore, date: s.createdAt }))
        },
        weakAreas: weakAreas.map((w: any) => ({ type: w.mistakeType, count: w._count }))
    };
};
