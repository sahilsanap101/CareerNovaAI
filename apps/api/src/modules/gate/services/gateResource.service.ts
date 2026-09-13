import { PrismaClient } from '@prisma/client';
import { calculateTopicPriority } from './gateGraph.service';

const prisma = new PrismaClient();

// Validates links. Mark inactive if broken.
export const checkLinkStatus = async (resourceId: string) => {
    const resource = await (prisma as any).gateResource.findUnique({ where: { id: resourceId } });
    if (!resource || !resource.url) return false;

    // Using primitive HTTP HEAD to prevent fabrication
    try {
        const response = await fetch(resource.url, { method: 'HEAD' });
        const isBroken = !response.ok;
        await (prisma as any).gateResource.update({
            where: { id: resourceId },
            data: { isActive: !isBroken, lastVerifiedAt: new Date() }
        });
        return !isBroken;
    } catch (e) {
        // If entirely unreachable
        await (prisma as any).gateResource.update({
            where: { id: resourceId },
            data: { isActive: false, lastVerifiedAt: new Date() }
        });
        return false;
    }
};

// Generates personalized ranked resources focusing on official precedence and contextual weakness
export const getPersonalizedResources = async (userId: string, filters: any = {}) => {
    const profile = await (prisma as any).userGateProfile.findUnique({ where: { userId } });
    const { topicId, paperId, format } = filters;

    // Base constraints -> MUST be active.
    let baseWhere: any = { isActive: true };
    if (paperId) baseWhere.paperId = paperId;
    if (topicId) baseWhere.topicId = topicId;

    // Explicit format matching mapping
    if (format) baseWhere.resourceType = format;
    if (profile && profile.preferredLearningFormat === 'VIDEO' && !format) {
        // Soft promotion over constraints
    }

    let resources = await (prisma as any).gateResource.findMany({
        where: baseWhere,
        include: { actions: { where: { userId } } }
    });

    // We do NOT fabricate URLs. If no 3rd-party mapping is returned, fetch Official Mappings as fallback bounds.
    const hasOfficial = resources.some((r: any) => r.isOfficial);
    if (!hasOfficial && paperId) {
        const officialFallbacks = await (prisma as any).gateResource.findMany({
            where: { paperId, isOfficial: true, isActive: true },
            take: 3
        });
        resources.push(...officialFallbacks);
    }

    // Evaluate priorities based on Profile & Mistake boundaries
    let activeMasteries: any = [];
    if (!topicId) {
        activeMasteries = await (prisma as any).gateTopicMastery.findMany({
            where: { userId },
            orderBy: { masteryLevel: 'asc' },
            take: 10
        });
    }

    // Ranking algorithm mapping
    resources = resources.map((r: any) => {
        let score = 0;

        // Priority 1: Official Sources are king (+100)
        if (r.isOfficial) score += 100;

        // Priority 2: Matches weak areas
        const isWeakArea = activeMasteries.find((m: any) => m.topicId === r.topicId && m.masteryLevel < 50);
        if (isWeakArea) score += 50;

        // Priority 3: Stage alignment
        if (profile?.preparationStage === 'BEGINNER' && r.difficulty === 'BEGINNER') score += 20;
        if (profile?.preparationStage === 'ADVANCED' && r.difficulty === 'ADVANCED') score += 20;

        // Priority 4: Preferred format
        if (profile?.preferredLearningFormat === r.resourceType) score += 10;

        // Analytics tracking offset (deprioritize already opened ones marginally unless bookmarked)
        const hasBookmark = r.actions?.some((a: any) => a.actionType === 'BOOKMARK');
        const hasUseful = r.actions?.some((a: any) => a.actionType === 'USEFUL');
        const hasNotUseful = r.actions?.some((a: any) => a.actionType === 'NOT_USEFUL');
        const hasOpened = r.actions?.some((a: any) => a.actionType === 'OPENED');

        if (hasBookmark) score += 30;
        if (hasUseful) score += 15;
        if (hasNotUseful) score -= 50; // Massively penalize useless items
        if (hasOpened && !hasBookmark && !hasUseful) score -= 5; // Slight decay for stale items

        return { ...r, rankScore: score };
    });

    // Deduplicate natively by ID (due to fallback append limits)
    const uniqueIds = new Set();
    const rankedResources = resources.filter((r: any) => {
        if (uniqueIds.has(r.id)) return false;
        uniqueIds.add(r.id);
        return true;
    }).sort((a: any, b: any) => b.rankScore - a.rankScore);

    return rankedResources;
};

// Records interactive evaluation points
export const logResourceAction = async (userId: string, resourceId: string, actionType: string) => {
    const valid = ['BOOKMARK', 'USEFUL', 'NOT_USEFUL', 'OPENED'];
    if (!valid.includes(actionType)) throw new Error("Invalid tracking metric");

    const existing = await (prisma as any).gateUserResourceAction.findFirst({
        where: { userId, resourceId, actionType }
    });

    if (!existing) {
        await (prisma as any).gateUserResourceAction.create({
            data: { userId, resourceId, actionType }
        });
    } else if (actionType === 'BOOKMARK') {
        // Toggle ability
        await (prisma as any).gateUserResourceAction.delete({ where: { id: existing.id } });
        return { status: "Removed" };
    }

    return { status: "Logged" };
};
