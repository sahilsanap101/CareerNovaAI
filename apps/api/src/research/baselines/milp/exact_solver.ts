import { SkillGraph } from '../../skillGraph/graph';
import { PlannedSkill } from '../B3_CONSTRAINED_PLANNER/planner';
import { runB2Prioritization, SkillEvaluationRequest } from '../B2_SKILL_PRIORITY/prioritizer';
import { StudentState } from '../../core/temporal/state';

export interface ExactOptResult {
    optimalSubset: string[];
    utility: number;
    cost: number;
    optimalityGap: number;
    runtimeMs: number;
    B3_utility: number;
}

/**
 * Exact Solver for Precedence-Constrained Knapsack (MILP analogous).
 * Performs rigorous 2^N state exploration (strictly for tiny N < 20 instances)
 */
export class ExactOptimizationReference {
    private evaluateSubset(subset: Set<string>, graph: SkillGraph, costMap: Record<string, number>, utilityMap: Record<string, number>, stateProf: Record<string, number>, budget: number): { valid: boolean, utility: number, cost: number } {
        let cost = 0;
        let utility = 0;

        for (const skill of subset) {
            cost += costMap[skill];
            utility += utilityMap[skill];
            if (cost > budget) return { valid: false, utility: 0, cost };

            // Precedence Constraint: All prereqs must be already Proficient OR in the Subset
            const prereqs = graph.getPrerequisiteClosure(skill);
            for (const p of prereqs) {
                const isProficient = (stateProf[p] || 0) >= 1.0;
                const isInSubset = subset.has(p);
                if (!isProficient && !isInSubset) {
                    return { valid: false, utility: 0, cost };
                }
            }
        }

        return { valid: true, utility, cost };
    }

    public solveExact(skills: string[], graph: SkillGraph, costMap: Record<string, number>, utilityMap: Record<string, number>, stateProf: Record<string, number>, budget: number): { optimalSubset: string[], utility: number, cost: number, runtimeMs: number } {
        const start = performance.now();
        const n = skills.length;

        if (n > 20) throw new Error("MILP Reference scaling limit exceeded. Shrink N for exact NP-Hard verification.");

        let bestSubset: string[] = [];
        let maxUtility = -1;
        let bestCost = 0;

        const maxMask = 1 << n;
        for (let mask = 0; mask < maxMask; mask++) {
            const subset = new Set<string>();
            for (let i = 0; i < n; i++) {
                if ((mask & (1 << i)) !== 0) {
                    subset.add(skills[i]!);
                }
            }

            const evalRes = this.evaluateSubset(subset, graph, costMap, utilityMap, stateProf, budget);
            if (evalRes.valid && evalRes.utility > maxUtility) {
                maxUtility = evalRes.utility;
                bestSubset = Array.from(subset);
                bestCost = evalRes.cost;
            }
        }

        const runtimeMs = performance.now() - start;
        return { optimalSubset: bestSubset, utility: maxUtility, cost: bestCost, runtimeMs };
    }
}
