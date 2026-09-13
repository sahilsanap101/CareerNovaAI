import { PrismaClient } from '@prisma/client';
import { calculateTopicPriority, getDownstreamImpact } from './gateGraph.service';

const prisma = new PrismaClient();

// Generates the daily contextual study list completely bypassing generic AI
export const generateDailyPlan = async (userId: string) => {
    // 1. Core Profile Stats
    const profile = await (prisma as any).userGateProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error("No GATE profile configured.");

    // We expect a study plan container for the user. If not, auto-create one.
    let plan = await (prisma as any).gateStudyPlan.findFirst({ where: { userId, targetExamId: String(profile.targetYear) } });
    if (!plan) {
        // Mock a fast plan creation wrapping the target year
        const exam = await (prisma as any).gateExam.findUnique({ where: { year: profile.targetYear } });
        if (!exam) throw new Error("Target Exam year unavailable for planning bounds.");
        plan = await (prisma as any).gateStudyPlan.create({
            data: { userId, targetExamId: exam.id, title: `Adaptive Plan ${profile.targetYear}`, startDate: new Date(), endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) }
        });
    }

    // 2. Fetch all Unresolved Mistakes (To prioritize Remediation sessions)
    const pendingMistakes = await (prisma as any).gateMistakeTracker.findMany({
        where: { userId, resolved: false },
        include: { question: true }
    });

    const remediationTopics = new Set<string>();
    pendingMistakes.forEach((m: any) => { if (m.question.topicId) remediationTopics.add(m.question.topicId) });

    // 3. Fetch all Subject/Topics
    const allTopics = await (prisma as any).gateSyllabusTopic.findMany({
        include: { prerequisitesGateTarget: true, subject: true }
    });

    // Evaluate priorities based on Graph engine (Mastery gaps + Centrality weights)
    let evaluatedTopics = [];
    for (const t of allTopics) {
        const p = await calculateTopicPriority(userId, t.id);
        evaluatedTopics.push({ ...t, priorityData: p });
    }

    // Sort by algorithmic priority score
    evaluatedTopics.sort((a, b) => b.priorityData.priorityScore - a.priorityData.priorityScore);

    // 4. Clear un-started sessions for today to rebuild gracefully WITHOUT overriding passed sessions
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    await (prisma as any).gateStudySession.deleteMany({
        where: { planId: plan.id, status: 'PLANNED', date: { gte: todayStart, lte: todayEnd } }
    });

    let newSessions = [];
    let hoursAllocated = 0;
    const maxHoursPerDay = Math.max(1, Math.round(profile.weeklyStudyHours / 7));

    // TOP PRIORITY: Mistake Remediation
    if (remediationTopics.size > 0 && hoursAllocated < maxHoursPerDay) {
        const topicId = Array.from(remediationTopics)[0];
        const topicRef = evaluatedTopics.find(t => t.id === topicId);
        newSessions.push({
            planId: plan.id,
            topicId,
            title: `Remediation: Review Recent Mistakes in ${topicRef?.title || 'Unknown Topic'}`,
            date: new Date(),
            durationMins: 45,
            status: 'PLANNED'
        });
        hoursAllocated += 1;
    }

    // SECOND PRIORITY: Core Topological Learning (Filtered by Prereqs)
    // We only recommend a topic if its prerequisites have > 50% mastery
    const masteredTopicIds = new Set<string>();
    const masteries = await (prisma as any).gateTopicMastery.findMany({ where: { userId, masteryLevel: { gte: 50 } } });
    masteries.forEach((m: any) => masteredTopicIds.add(m.topicId));

    for (const topic of evaluatedTopics) {
        if (hoursAllocated >= maxHoursPerDay) break;
        if (newSessions.some(s => s.topicId === topic.id)) continue; // Already added remediation for it

        // Check prerequisites
        let reqsMet = true;
        for (const req of topic.prerequisitesGateTarget) {
            if (!masteredTopicIds.has(req.prereqTopicId)) {
                reqsMet = false;
                break;
            }
        }

        if (reqsMet && !masteredTopicIds.has(topic.id)) {
            newSessions.push({
                planId: plan.id,
                topicId: topic.id,
                title: `Learn Fundamentals: ${topic.title}`,
                date: new Date(),
                durationMins: 90,
                status: 'PLANNED'
            });
            hoursAllocated += 1.5;
        }
    }

    // THIRD PRIORITY: Practice & Revision
    if (hoursAllocated < maxHoursPerDay && masteredTopicIds.size > 0) {
        // Pick highly deprioritized topics from earlier but that ARE mastered to practice
        const revisionCandidates = evaluatedTopics.filter(t => masteredTopicIds.has(t.id));
        if (revisionCandidates.length > 0) {
            newSessions.push({
                planId: plan.id,
                topicId: revisionCandidates[0].id,
                title: `Reinforcement Practice: ${revisionCandidates[0].title}`,
                date: new Date(),
                durationMins: 60,
                status: 'PLANNED'
            });
        }
    }

    // Commit Sessions
    for (const sess of newSessions) {
        await (prisma as any).gateStudySession.create({ data: sess });
    }

    return await (prisma as any).gateStudySession.findMany({
        where: { planId: plan.id, date: { gte: todayStart, lte: todayEnd } },
        include: { topic: true },
        orderBy: { durationMins: 'desc' }
    });
};

export const updateSessionState = async (sessionId: string, action: string, reason?: string) => {
    const validActions = ['COMPLETED', 'SKIPPED', 'PAUSED'];
    if (!validActions.includes(action)) throw new Error("Invalid Session Action.");

    const session = await (prisma as any).gateStudySession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error("Session bounds not found.");

    let titleSuffix = '';
    if (action === 'SKIPPED' && reason) titleSuffix = ` (Skipped: ${reason})`;

    return await (prisma as any).gateStudySession.update({
        where: { id: sessionId },
        data: {
            status: action,
            title: session.title + titleSuffix
        }
    });
};

export const regeneratePlan = async (userId: string) => {
    // Bypassing today's unstarted tasks securely to regenerate completely based on new test scores
    return await generateDailyPlan(userId);
};
