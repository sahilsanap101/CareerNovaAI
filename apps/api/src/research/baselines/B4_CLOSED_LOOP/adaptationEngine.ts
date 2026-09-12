import {
    RoadmapVersion,
    RoadmapChange,
    StudentStateSnapshot,
    MarketDemandSnapshot
} from './types';

/**
 * Calculates theoretical diff tracking churn and generating transparent deterministic rationales 
 * for adaptation changes.
 */
export function calculateRoadmapDiff(
    oldRoadmap: RoadmapVersion,
    newRoadmap: RoadmapVersion,
    previousStudentState: StudentStateSnapshot,
    newStudentState: StudentStateSnapshot,
    previousMarketState: MarketDemandSnapshot,
    newMarketState: MarketDemandSnapshot
): RoadmapChange {

    const oldSet = new Set(oldRoadmap.scheduledSkillIds);
    const newSet = new Set(newRoadmap.scheduledSkillIds);

    const added: string[] = [];
    const removed: string[] = [];
    const retained: string[] = [];

    // Enumerate additions and retentions
    newRoadmap.scheduledSkillIds.forEach(id => {
        if (oldSet.has(id)) {
            retained.push(id);
        } else {
            added.push(id);
        }
    });

    // Enumerate removals
    oldRoadmap.scheduledSkillIds.forEach(id => {
        if (!newSet.has(id)) {
            removed.push(id);
        }
    });

    // Calculate Churn Formula
    // Churn = (added + dropped) / |R_t|
    let churnMetric = 0;
    if (oldRoadmap.scheduledSkillIds.length > 0) {
        churnMetric = (added.length + removed.length) / oldRoadmap.scheduledSkillIds.length;
    }

    // Determine Cause Vector
    const studentChanged = oldRoadmap.studentStateId !== newRoadmap.studentStateId;
    const marketChanged = oldRoadmap.marketStateId !== newRoadmap.marketStateId;

    let causeVector: RoadmapChange['causeVector'] = 'BOTH';
    if (studentChanged && !marketChanged) causeVector = 'STUDENT_STATE_CHANGE';
    if (!studentChanged && marketChanged) causeVector = 'MARKET_STATE_CHANGE';

    // Construct deterministic explanation strings without LLMs
    let explanation = `Roadmap adapted to version ${newRoadmap.versionId}. `;
    if (causeVector === 'STUDENT_STATE_CHANGE' && newStudentState.latestEvidence) {
        explanation += `Initiated by student proficiency update for skill [${newStudentState.latestEvidence.skillId}] measuring at ${newStudentState.latestEvidence.measuredProficiency}. `;
    } else if (causeVector === 'MARKET_STATE_CHANGE' && newMarketState.triggerContext) {
        explanation += `Initiated by external market shift: ${newMarketState.triggerContext}. `;
    }

    if (added.length > 0) explanation += `Added skills: ${added.join(', ')}. `;
    if (removed.length > 0) explanation += `Removed skills: ${removed.join(', ')}. `;
    explanation += `Structural churn mathematically tracked at ${(churnMetric * 100).toFixed(1)}%.`;

    return {
        previousVersionId: oldRoadmap.versionId,
        newVersionId: newRoadmap.versionId,
        addedSkills: added,
        removedSkills: removed,
        retainedSkills: retained,
        causeVector,
        churnMetric,
        explanation
    };
}

/**
 * Calculates the 'Stale Plan' correlation observing how often a highly volatile sequence of 
 * student/market updates results in mathematically identical plans.
 */
export function calculateStalePlanRate(changes: RoadmapChange[]): number {
    if (changes.length === 0) return 0;

    // A plan is defined as computationally stale if internal parameters shifted but Churn remained strictly 0
    const staleCount = changes.filter(c => c.churnMetric === 0).length;

    return staleCount / changes.length;
}
