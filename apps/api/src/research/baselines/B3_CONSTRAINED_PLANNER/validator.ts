import { SkillGraph } from '../../skillGraph/graph';
import { PlannedSkill } from './planner';

export interface ValidationReport {
    isValid: boolean;
    prerequisiteViolationCount: number;
    errors: string[];
}

/**
 * Automates deterministic viability checking of sequences produced by theoretical baselines.
 * Asserts PrerequisiteViolationCount == 0.
 */
export function validateRoadmapFeasibility(
    roadmap: PlannedSkill[],
    initialState: Record<string, number>,
    graph: SkillGraph
): ValidationReport {

    let violationCount = 0;
    const errors: string[] = [];

    // Clone mock state
    const mockState = { ...initialState };

    for (const step of roadmap) {
        const status = graph.evaluateEligibility(step.skillId, mockState, 1.0);

        if (status === 'BLOCKED_BY_PREREQUISITE') {
            violationCount++;
            errors.push(`Critical Structural Failure at phase ${step.phase}. Skill [${step.skillId}] scheduled but mathematically BLOCKED_BY_PREREQUISITE in timeline state.`);
        }

        if (status === 'ALREADY_MASTERED') {
            violationCount++;
            errors.push(`Optimization Fault: Skill [${step.skillId}] scheduled despite ALREADY_MASTERED status.`);
        }

        // Mutate state downstream 
        mockState[step.skillId] = 1.0;
    }

    return {
        isValid: violationCount === 0,
        prerequisiteViolationCount: violationCount,
        errors
    };
}
