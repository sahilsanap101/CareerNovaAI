import { generateConstrainedRoadmap } from './planner';
import { validateRoadmapFeasibility } from './validator';
import { SkillGraph, EdgeProvenance } from '../../skillGraph/graph';
import { SkillPriorityResult } from '../B2_SKILL_PRIORITY/prioritizer';

describe('B3 Constrained Skill Planner & Validator', () => {
    let graph: SkillGraph;
    const mockProv = {} as any;

    beforeEach(() => {
        graph = new SkillGraph();
        // A -> B -> C
        // D
        graph.addNode({ id: 'A' }); graph.addNode({ id: 'B' });
        graph.addNode({ id: 'C' }); graph.addNode({ id: 'D' });

        graph.addEdge({ fromId: 'A', toId: 'B', type: 'PREREQUISITE', provenance: mockProv });
        graph.addEdge({ fromId: 'B', toId: 'C', type: 'PREREQUISITE', provenance: mockProv });
    });

    const getPriorityMock = (): SkillPriorityResult[] => [
        { skillId: 'A', priorityScore: 50, careerImportance: 0.5, gap: 1, learningCost: 10, utilityScore: 5, marketDemand: 0.1, normalizedPriority: 0, prerequisiteStatus: 'AVAILABLE', provenance: {} },
        { skillId: 'B', priorityScore: 200, careerImportance: 0.9, gap: 1, learningCost: 40, utilityScore: 5, marketDemand: 0.8, normalizedPriority: 0, prerequisiteStatus: 'BLOCKED', provenance: {} },
        { skillId: 'C', priorityScore: 400, careerImportance: 1.0, gap: 1, learningCost: 60, utilityScore: 6.66, marketDemand: 1.0, normalizedPriority: 0, prerequisiteStatus: 'BLOCKED', provenance: {} },
        { skillId: 'D', priorityScore: 100, careerImportance: 0.8, gap: 1, learningCost: 20, utilityScore: 5, marketDemand: 0.4, normalizedPriority: 0, prerequisiteStatus: 'AVAILABLE', provenance: {} }
    ];

    it('generates a valid traversal and asserts zero violations', () => {
        // Budget accommodates learning everything (Total cost: 10+40+60+20 = 130)
        const result = generateConstrainedRoadmap({
            studentProficiencies: {},
            targetRequiredSkills: new Set(['A', 'B', 'C', 'D']),
            skillPriorities: getPriorityMock(),
            dependencyGraph: graph,
            globalLearningBudgetHours: 200
        });

        expect(result.fullyResolved).toBe(true);
        expect(result.roadmap.length).toBe(4);

        // Check structural feasibility validation 
        const validation = validateRoadmapFeasibility(result.roadmap, {}, graph);
        // Explicitly test PrerequisiteViolationCount == 0 requirement
        expect(validation.prerequisiteViolationCount).toBe(0);
        expect(validation.isValid).toBe(true);

        // Assert that explicitly 'A' gets the logic flag reason mapped from 'B' or 'C'
        const stepA = result.roadmap.find(s => s.skillId === 'A');
        expect(stepA?.reason).toContain('Scheduled prerequisite to explicitly unblock high-priority skill');
    });

    it('exhibits deterministic structural differences under heavily constrained variance budgets', () => {
        // Constrained User: Only 35 hours available
        const constrainedResult = generateConstrainedRoadmap({
            studentProficiencies: {},
            targetRequiredSkills: new Set(['A', 'B', 'C', 'D']),
            skillPriorities: getPriorityMock(),
            dependencyGraph: graph,
            globalLearningBudgetHours: 35
        });

        // 35 hrs is enough for A (10) and D (20). 
        // It is not enough computationally to touch C (60) or B (40).
        expect(constrainedResult.fullyResolved).toBe(false);
        expect(constrainedResult.totalHoursScheduled).toBe(30);
        expect(constrainedResult.roadmap.map(r => r.skillId)).toEqual(['D', 'A']); // D has higher priority 
        // And finally correctly defers missing items
        expect(constrainedResult.deferred.some(d => d.skillId === 'C')).toBe(true);
    });
});
