import * as fs from 'fs';
import * as path from 'path';
import { StudentState } from '../core/temporal/state';
import { TemporalEvent } from '../core/temporal/events';
import { Transition } from '../core/temporal/transition';
import { calculateRoadmapChurn, RoadmapChurnMetrics } from '../core/temporal/churn';
import { generateConstrainedRoadmap, PlannerInput, PlannedSkill } from '../baselines/B3_CONSTRAINED_PLANNER/planner';
import { runB2Prioritization, SkillEvaluationRequest } from '../baselines/B2_SKILL_PRIORITY/prioritizer';
import { SkillGraph } from '../skillGraph/graph';

// CONTROLLED_SYNTHETIC_LONGITUDINAL Simulator
export class LongitudinalSimulator {
    private baseDir = path.join(process.cwd(), 'research', 'results', 'longitudinal');

    constructor() {
        if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true });
    }

    public executeSyntheticTrajectories(N: number, eventsPerStudent: number) {
        console.log(`Starting CONTROLLED_SYNTHETIC_LONGITUDINAL simulation. N=${N}, Events=${eventsPerStudent}`);
        const results: any[] = [];
        const graph = new SkillGraph();
        ['A', 'B', 'C', 'D'].forEach(id => graph.addNode({ id }));
        const mockProv = { source: 'SIM', evidence: [], confidence: 1, manualValidationStats: {} } as any;
        graph.addEdge({ fromId: 'A', toId: 'B', type: 'PREREQUISITE', provenance: mockProv });
        graph.addEdge({ fromId: 'B', toId: 'C', type: 'PREREQUISITE', provenance: mockProv });

        for (let i = 0; i < N; i++) {
            let currentState: StudentState = {
                stateId: `S_${i}_0`, studentId: `user_${i}`, sequenceOrder: 0,
                timestamp: '2026-01-01', proficiencies: { 'A': 0.0, 'B': 0.0, 'C': 0.0, 'D': 0.0 },
                targetCareer: 'Data Scientist', availableBudgetHours: 100, provenance: { sourceEventId: null, generator: 'synthetic' }
            };

            const history: any[] = [];
            let currentRoadmap: PlannedSkill[] = this.plan(currentState, graph);

            for (let e = 1; e <= eventsPerStudent; e++) {
                const evType = e % 2 !== 0 ? 'skill_completed' : 'skill_failed';
                const targetSkill = e <= 2 ? 'A' : (e <= 4 ? 'B' : 'C');

                const event: TemporalEvent = {
                    eventId: `E_${i}_${e}`, studentId: currentState.studentId, eventType: evType,
                    timestamp: `2026-01-0${e + 1}`, payload: { skillId: targetSkill, costSpent: 10 }, provenance: 'synthetic'
                };

                const nextState = Transition(currentState, event);
                const nextRoadmap = this.plan(nextState, graph);
                const churn = calculateRoadmapChurn(currentRoadmap, nextRoadmap, currentState.targetCareer, nextState.targetCareer);

                history.push({
                    event,
                    transitionId: nextState.stateId,
                    churnMetrics: churn
                });

                currentState = nextState;
                currentRoadmap = nextRoadmap;
            }

            results.push({ studentId: currentState.studentId, finalState: currentState, history });
        }

        const runId = `LONG_${Date.now()}_N${N}`;
        fs.writeFileSync(path.join(this.baseDir, `${runId}.json`), JSON.stringify(results, null, 2));
        console.log(`Simulation complete. Stored in ${runId}.json`);
    }

    private plan(state: StudentState, graph: SkillGraph): PlannedSkill[] {
        const reqs: SkillEvaluationRequest[] = ['A', 'B', 'C', 'D'].map((s: string) => ({
            skillId: s, studentProficiency: state.proficiencies[s],
            requiredProficiency: 1.0, careerImportance: 0.8, marketDemand: 1.0, learningCostHours: 20
        }));
        const priorities = runB2Prioritization(reqs);
        const input: PlannerInput = {
            studentProficiencies: state.proficiencies, targetRequiredSkills: new Set(['A', 'B', 'C', 'D']),
            skillPriorities: priorities, dependencyGraph: graph, globalLearningBudgetHours: state.availableBudgetHours
        };
        return generateConstrainedRoadmap(input).roadmap;
    }
}

if (require.main === module) {
    const sim = new LongitudinalSimulator();
    sim.executeSyntheticTrajectories(5, 4);  // N=5, 4 events per student
    sim.executeSyntheticTrajectories(50, 4); // N=50, 4 events per student
}
