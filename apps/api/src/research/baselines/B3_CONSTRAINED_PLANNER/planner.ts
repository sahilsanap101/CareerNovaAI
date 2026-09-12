import { SkillGraph, EligibilityStatus } from '../../skillGraph/graph';
import { SkillPriorityResult } from '../B2_SKILL_PRIORITY/prioritizer';

export interface PlannerInput {
    studentProficiencies: Record<string, number>;
    targetRequiredSkills: Set<string>;
    skillPriorities: SkillPriorityResult[];
    dependencyGraph: SkillGraph;
    globalLearningBudgetHours: number;
}

export interface PlannedSkill {
    phase: number;
    skillId: string;
    priority: number;
    marketDemand: number;
    careerImportance: number;
    gap: number;
    learningCost: number;
    prerequisites: string[];
    reason: string;
    expectedStateTransition: string;
}

export interface DeferredSkill {
    skillId: string;
    reason: string;
}

export interface ConstrainedRoadmapOutput {
    roadmap: PlannedSkill[];
    deferred: DeferredSkill[];
    totalHoursScheduled: number;
    fullyResolved: boolean;
}

/**
 * Prerequisite-Constrained Skill Planner B3
 * A transparent optimization algorithm building a sequenced roadmap adhering strictly to 
 * acyclic prerequisite mapping and a hard maximum temporal budget.
 */
export function generateConstrainedRoadmap(input: PlannerInput): ConstrainedRoadmapOutput {
    const roadmap: PlannedSkill[] = [];
    const deferred: DeferredSkill[] = [];
    let totalHoursSpent = 0;

    const simulatedState = { ...input.studentProficiencies };
    let currentPhase = 1;

    while (true) {
        const unmastered = Array.from(input.targetRequiredSkills).filter(s => (simulatedState[s] || 0) < 1.0);
        if (unmastered.length === 0) break; // Reached full mastery

        // Evaluate valid topological closure nodes
        const phaseTargetQueue = new Set<string>();
        unmastered.forEach(skillId => {
            phaseTargetQueue.add(skillId);
            const reqs = input.dependencyGraph.getPrerequisiteClosure(skillId);
            reqs.forEach(r => phaseTargetQueue.add(r));
        });

        const availableTargets: { skillId: string, itemOutput: PlannedSkill }[] = [];
        const blockedLog = new Map<string, string>(); // Skill -> Reason

        for (const skillId of phaseTargetQueue) {
            if ((simulatedState[skillId] || 0) >= 1.0) continue; // Already mastered

            const status = input.dependencyGraph.evaluateEligibility(skillId, simulatedState, 1.0, phaseTargetQueue);
            const priorityObj = input.skillPriorities.find(p => p.skillId === skillId);

            const pScore = priorityObj?.priorityScore || 0.0;
            const mDemand = priorityObj?.marketDemand || 0.0;
            const cImp = priorityObj?.careerImportance || 0.0;
            const cost = priorityObj?.learningCost || 10;

            const reqClosureArr = Array.from(input.dependencyGraph.getPrerequisiteClosure(skillId));

            if (status === 'AVAILABLE' || status === 'OPTIONAL') {
                availableTargets.push({
                    skillId,
                    itemOutput: {
                        phase: currentPhase,
                        skillId,
                        priority: pScore,
                        marketDemand: mDemand,
                        careerImportance: cImp,
                        gap: priorityObj?.gap || 1.0,
                        learningCost: cost,
                        prerequisites: reqClosureArr,
                        reason: 'Identified as highly-priority callable target.',
                        expectedStateTransition: `${skillId}: -> 1.0`
                    }
                });
            } else if (status === 'BLOCKED_BY_PREREQUISITE') {
                blockedLog.set(skillId, `Blocked by prerequisite.`);
            }
        }

        if (availableTargets.length === 0) {
            if (blockedLog.size > 0 && totalHoursSpent < input.globalLearningBudgetHours) {
                throw new Error('Structural Failure: Graph resolution locked despite remaining budget. Missing foundational edges.');
            }
            break;
        }

        // Attempt to schedule greedily via max priority
        availableTargets.sort((a, b) => b.itemOutput.priority - a.itemOutput.priority);

        let itemsScheduledThisPhase = 0;

        for (const target of availableTargets) {
            if (totalHoursSpent + target.itemOutput.learningCost <= input.globalLearningBudgetHours) {

                // Explanatory mapping logic: Why are we scheduling this?
                const unlocks = Array.from(blockedLog.keys()).filter(bId =>
                    input.dependencyGraph.getPrerequisiteClosure(bId).has(target.skillId)
                );
                if (unlocks.length > 0) {
                    target.itemOutput.reason = `Scheduled prerequisite to explicitly unblock high-priority skill: [${unlocks[0]}]`;
                }

                roadmap.push(target.itemOutput);
                simulatedState[target.skillId] = 1.0;
                totalHoursSpent += target.itemOutput.learningCost;
                itemsScheduledThisPhase++;
            }
        }

        // Check if we hard-failed to schedule anything
        if (itemsScheduledThisPhase === 0) {
            break; // Global Budget is tapped out. Iterations halt.
        }

        currentPhase++;
    }

    // Deferral Computation
    // Anything remaining unmastered in the original target queues gets cleanly flagged as unachievable.
    const finalUnmastered = Array.from(input.targetRequiredSkills).filter(s => (simulatedState[s] || 0) < 1.0);
    finalUnmastered.forEach(s => {
        deferred.push({
            skillId: s,
            reason: `Deferred: Requires additional cognitive budget. Total hours allocated (${totalHoursSpent}h) reached limit.`
        });
    });

    return {
        roadmap,
        deferred,
        totalHoursScheduled: totalHoursSpent,
        fullyResolved: finalUnmastered.length === 0
    };
}
