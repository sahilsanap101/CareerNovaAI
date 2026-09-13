import * as fs from 'fs';
import * as path from 'path';
import { ExactOptimizationReference } from '../baselines/milp/exact_solver';
import { SkillGraph } from '../skillGraph/graph';
import { generateConstrainedRoadmap } from '../baselines/B3_CONSTRAINED_PLANNER/planner';

/** Evaluates empirical tractability limits of 2^N brute force scaling limits natively. */
export class ExactScalingTracker {
    public runScalingLimits() {
        console.log("Locating computational bounds of Exact DP Solver...");
        const baseDir = path.join(process.cwd(), 'research', 'results', 'exact_solver_scaling');
        if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

        const results = [];
        // N=20 is 2^20 (1 million). N=24 is 16 million.
        const sizes = [5, 10, 15, 20, 22];

        for (const n of sizes) {
            const graph = new SkillGraph();
            const skills = [];
            const costMap: Record<string, number> = {};
            const utilityMap: Record<string, number> = {};
            const stateProf: Record<string, number> = {};
            const prior: any[] = [];

            for (let i = 0; i < n; i++) {
                const id = `S_${i}`;
                skills.push(id);
                graph.addNode({ id });
                costMap[id] = 5;
                utilityMap[id] = 1.0;
                stateProf[id] = 0.0;
                prior.push({ skillId: id, priorityScore: 1.0, learningCost: 5 });
            }

            // Simple topological chain
            for (let i = 0; i < n - 1; i++) {
                graph.addEdge({ fromId: skills[i], toId: skills[i + 1], type: 'PREREQUISITE', provenance: {} as any });
            }

            const b3Start = performance.now();
            generateConstrainedRoadmap({
                studentProficiencies: stateProf, targetRequiredSkills: new Set(skills),
                skillPriorities: prior, dependencyGraph: graph, globalLearningBudgetHours: n * 2.5
            });
            const b3Time = performance.now() - b3Start;

            const solver = new ExactOptimizationReference();
            let exactTime = -1;
            try {
                const exStart = performance.now();
                solver.solveExact(skills, graph, costMap, utilityMap, stateProf, n * 2.5);
                exactTime = performance.now() - exStart;
            } catch (e) {
                exactTime = NaN; // OOM or execution guard limit hit
            }

            results.push({ size: n, b3_ms: b3Time, exact_ms: exactTime });
            console.log(`N=${n}: B3=${b3Time.toFixed(2)}ms | EXACT=${exactTime.toFixed(2)}ms`);

            // Absolute limit breaker guard
            if (exactTime > 10000 || isNaN(exactTime)) break;
        }

        fs.writeFileSync(path.join(baseDir, `SCALING_LIMITS_${Date.now()}.json`), JSON.stringify(results, null, 2));
    }
}

if (require.main === module) {
    new ExactScalingTracker().runScalingLimits();
}
