// @ts-nocheck
import { generateRoadmapSteps } from '../../../modules/roadmap/engine/adaptiveRoadmapEngine';
import { UserProfile } from '@prisma/client';

/**
 * Baseline R0: Legacy Roadmap Generator
 * This wrapper perfectly preserves the unaltered heuristic bucketed roadmap engine 
 * (Fundamentals, Advanced, Output) for A/B testing against robust graph planners.
 */
export function runR0Evaluation(
    targetCareerId: string,
    skills: any[],
    hoursPerWeek: number,
    durationWeeks: number
) {
    // Directly passes through to old static model without validation algorithms.
    return generateRoadmapSteps(targetCareerId, skills, hoursPerWeek, durationWeeks);
}
