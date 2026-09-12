import { SkillGraph, EdgeProvenance } from './graph';

const MOCK_PROV: EdgeProvenance = {
    source: 'MANUAL_FIXTURE',
    evidence: 'Testing Protocol',
    confidence: 1.0,
    manualValidationStats: 'VALIDATED'
};

describe('Formal Skill Dependency Graph', () => {
    let graph: SkillGraph;

    beforeEach(() => {
        graph = new SkillGraph();
    });

    describe('DAG Validation', () => {
        it('sorts valid DAG correctly', () => {
            // A -> B -> C
            graph.addNode({ id: 'A' });
            graph.addNode({ id: 'B' });
            graph.addNode({ id: 'C' });
            graph.addEdge({ fromId: 'A', toId: 'B', type: 'PREREQUISITE', provenance: MOCK_PROV });
            graph.addEdge({ fromId: 'B', toId: 'C', type: 'PREREQUISITE', provenance: MOCK_PROV });

            const sort = graph.topologicalSort();
            expect(sort.indexOf('A')).toBeLessThan(sort.indexOf('B'));
            expect(sort.indexOf('B')).toBeLessThan(sort.indexOf('C'));
        });

        it('detects cycles successfully', () => {
            // A -> B -> A
            graph.addNode({ id: 'A' });
            graph.addNode({ id: 'B' });
            graph.addEdge({ fromId: 'A', toId: 'B', type: 'PREREQUISITE', provenance: MOCK_PROV });
            graph.addEdge({ fromId: 'B', toId: 'A', type: 'PREREQUISITE', provenance: MOCK_PROV });

            expect(() => graph.detectCycles()).toThrowError(/Cycle detected/);
        });
    });

    describe('Eligibility Evaluation', () => {
        beforeEach(() => {
            graph.addNode({ id: 'A' });
            graph.addNode({ id: 'B' });
            graph.addNode({ id: 'C' });
            graph.addEdge({ fromId: 'A', toId: 'C', type: 'PREREQUISITE', provenance: MOCK_PROV });
            graph.addEdge({ fromId: 'B', toId: 'C', type: 'PREREQUISITE', provenance: MOCK_PROV });
        });

        it('returns BLOCKED for completely missing prerequisites', () => {
            const state = { A: 0, B: 0, C: 0 };
            expect(graph.evaluateEligibility('C', state, 1.0)).toBe('BLOCKED_BY_PREREQUISITE');
        });

        it('returns BLOCKED for partially satisfied prerequisites', () => {
            const state = { A: 1.0, B: 0.5, C: 0 };
            expect(graph.evaluateEligibility('C', state, 1.0)).toBe('BLOCKED_BY_PREREQUISITE');
        });

        it('returns AVAILABLE when multiple prerequisites met', () => {
            const state = { A: 1.0, B: 1.0, C: 0 };
            expect(graph.evaluateEligibility('C', state, 1.0)).toBe('AVAILABLE');
        });

        it('returns ALREADY_MASTERED if node exceeds threshold', () => {
            const state = { A: 1.0, B: 1.0, C: 1.0 };
            expect(graph.evaluateEligibility('C', state, 1.0)).toBe('ALREADY_MASTERED');
        });
    });

    describe('Prerequisite Transitive Closure', () => {
        it('returns all nested dependencies', () => {
            // A -> B -> C -> D
            // Also A -> D
            graph.addNode({ id: 'A' }); graph.addNode({ id: 'B' });
            graph.addNode({ id: 'C' }); graph.addNode({ id: 'D' });

            graph.addEdge({ fromId: 'A', toId: 'B', type: 'PREREQUISITE', provenance: MOCK_PROV });
            graph.addEdge({ fromId: 'B', toId: 'C', type: 'PREREQUISITE', provenance: MOCK_PROV });
            graph.addEdge({ fromId: 'C', toId: 'D', type: 'PREREQUISITE', provenance: MOCK_PROV });
            graph.addEdge({ fromId: 'A', toId: 'D', type: 'PREREQUISITE', provenance: MOCK_PROV });

            const closure = graph.getPrerequisiteClosure('D');
            expect(closure.has('A')).toBeTruthy();
            expect(closure.has('B')).toBeTruthy();
            expect(closure.has('C')).toBeTruthy();
            expect(closure.size).toBe(3);
        });
    });

});
