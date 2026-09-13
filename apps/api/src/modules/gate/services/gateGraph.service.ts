import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DFS to detect cycles in global topology
export const detectCycles = async () => {
    const edges = await (prisma as any).gateTopicPrerequisite.findMany();
    const adjList = new Map<string, string[]>();

    edges.forEach((edge: any) => {
        if (!adjList.has(edge.prereqTopicId)) adjList.set(edge.prereqTopicId, []);
        adjList.get(edge.prereqTopicId)!.push(edge.targetTopicId);
    });

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const isCyclic = (node: string): boolean => {
        if (recursionStack.has(node)) return true;
        if (visited.has(node)) return false;

        visited.add(node);
        recursionStack.add(node);

        const neighbors = adjList.get(node) || [];
        for (const neighbor of neighbors) {
            if (isCyclic(neighbor)) return true;
        }

        recursionStack.delete(node);
        return false;
    };

    for (const [node] of adjList) {
        if (isCyclic(node)) return { cyclic: true, failingNode: node };
    }

    return { cyclic: false };
};

// Calculate downstream downstream unlocks
const dfsImpact = (nodeId: string, adjList: Map<string, string[]>, visited: Set<string>) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    for (const neighbor of (adjList.get(nodeId) || [])) {
        dfsImpact(neighbor, adjList, visited);
    }
};

export const getDownstreamImpact = async (topicId: string) => {
    const edges = await (prisma as any).gateTopicPrerequisite.findMany();
    const adjList = new Map<string, string[]>();
    edges.forEach((edge: any) => {
        if (!adjList.has(edge.prereqTopicId)) adjList.set(edge.prereqTopicId, []);
        adjList.get(edge.prereqTopicId)!.push(edge.targetTopicId);
    });

    const visited = new Set<string>();
    dfsImpact(topicId, adjList, visited);

    // Subtract 1 because we don't count the node itself as a downstream impact
    return Math.max(0, visited.size - 1);
};

export const calculateTopicPriority = async (userId: string, topicId: string) => {
    // Simulated metric weights config
    const WEIGHTS = {
        masteryGap: 40,
        centrality: 30,
        historicalFrequency: 30
    };

    // Fetch user mastery dynamically using TS bypass
    const masteryRecord = await (prisma as any).gateTopicMastery.findFirst({
        where: { userId, topicId }
    });

    const currentMastery = masteryRecord?.masteryLevel || 0;
    const masteryScore = (100 - currentMastery) * (WEIGHTS.masteryGap / 100);

    const downstreamImpact = await getDownstreamImpact(topicId);
    // Assume max central downstream size of 15
    const centralityScore = Math.min(100, (downstreamImpact / 15) * 100) * (WEIGHTS.centrality / 100);

    // Evaluate historical testing frequency natively from Database bounds:
    const pyqCount = await (prisma as any).gateQuestion.count({ where: { topicId } });
    const freqScore = Math.min(100, pyqCount * 10) * (WEIGHTS.historicalFrequency / 100);

    const total = masteryScore + centralityScore + freqScore;

    let explanation = `High priority because:\n`;
    if (currentMastery < 40) explanation += `- Weak current mastery (${currentMastery}%)\n`;
    if (downstreamImpact > 3) explanation += `- Prerequisite for ${downstreamImpact} downstream elements\n`;
    if (pyqCount > 0) explanation += `- Frequently tested directly in ${pyqCount} known PYQs\n`;

    if (explanation === `High priority because:\n`) explanation = "Normal Priority queue.";

    return { priorityScore: total, explanation };
};

export const getTopicTopology = async (userId: string, topicId: string) => {
    let topic: any = await prisma.gateSyllabusTopic.findUnique({
        where: { id: topicId },
        include: {
            subtopics: true,
            resources: true,
        }
    });

    if (!topic) throw new Error("Topic not found");
    // TS cast fetch for relations since IDE schema fails
    topic = await (prisma as any).gateSyllabusTopic.findUnique({
        where: { id: topicId },
        include: {
            prerequisitesGateTarget: { include: { prereqTopic: true } },
            prerequisitesGatePrereq: { include: { targetTopic: true } },
            subtopics: true,
            resources: true,
        }
    });

    const priority = await calculateTopicPriority(userId, topicId);
    const masteryRecord = await (prisma as any).gateTopicMastery.findFirst({ where: { userId, topicId } });

    return {
        ...topic,
        mastery: masteryRecord?.masteryLevel || 0,
        priority,
        downstreamNodesUnlocked: await getDownstreamImpact(topicId)
    };
};
