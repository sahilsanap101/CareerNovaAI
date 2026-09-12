export type DependencyType = 'PREREQUISITE' | 'OPTIONAL' | 'COREQUISITE';

export type EligibilityStatus =
    | 'AVAILABLE'
    | 'BLOCKED_BY_PREREQUISITE'
    | 'ALREADY_MASTERED'
    | 'NOT_RELEVANT'
    | 'OPTIONAL';

export interface EdgeProvenance {
    source: string;
    evidence: string;
    confidence: number;
    manualValidationStats: 'PENDING' | 'VALIDATED' | 'REJECTED';
}

export interface SkillNode {
    id: string;
}

export interface SkillDependencyEdge {
    fromId: string; // The required skill
    toId: string;   // The target skill depending on 'fromId'
    type: DependencyType;
    provenance: EdgeProvenance;
}

export class SkillGraph {
    private nodes: Map<string, SkillNode> = new Map();
    private edges: SkillDependencyEdge[] = [];

    addNode(node: SkillNode) {
        if (!this.nodes.has(node.id)) {
            this.nodes.set(node.id, node);
        }
    }

    addEdge(edge: SkillDependencyEdge) {
        this.edges.push(edge);
    }

    /**
     * Detects cycles in the directed graph specifically across PREREQUISITE constraints.
     * Throws an error if cycle is detected.
     */
    detectCycles() {
        const visited = new Set<string>();
        const recStack = new Set<string>();

        const dfs = (nodeId: string) => {
            if (!visited.has(nodeId)) {
                visited.add(nodeId);
                recStack.add(nodeId);

                const prerequisites = this.edges
                    .filter(e => e.toId === nodeId && e.type === 'PREREQUISITE')
                    .map(e => e.fromId);

                for (const prereq of prerequisites) {
                    if (!visited.has(prereq) && dfs(prereq)) {
                        return true;
                    } else if (recStack.has(prereq)) {
                        return true; // Cycle detected
                    }
                }
            }
            recStack.delete(nodeId);
            return false;
        };

        for (const nodeId of this.nodes.keys()) {
            if (dfs(nodeId)) {
                throw new Error(`Cycle detected involving node ${nodeId}`);
            }
        }
    }

    /**
     * Returns a topological ordering of ALL nodes based on PREREQUISITE edges.
     */
    topologicalSort(): string[] {
        this.detectCycles(); // Ensure DAG before sorting

        const visited = new Set<string>();
        const stack: string[] = [];

        const dfs = (nodeId: string) => {
            visited.add(nodeId);
            const dependents = this.edges
                .filter(e => e.fromId === nodeId && e.type === 'PREREQUISITE')
                .map(e => e.toId);

            for (const target of dependents) {
                if (!visited.has(target)) {
                    dfs(target);
                }
            }
            stack.push(nodeId);
        };

        for (const nodeId of this.nodes.keys()) {
            if (!visited.has(nodeId)) dfs(nodeId);
        }

        return stack.reverse();
    }

    /**
     * Evaluates the computational status of a node relative to a constrained state.
     */
    evaluateEligibility(
        skillId: string,
        studentProficiencies: Record<string, number>,
        targetThreshold = 1.0,
        careerRequiredSkills?: Set<string>
    ): EligibilityStatus {

        if (!this.nodes.has(skillId)) return 'NOT_RELEVANT';

        // 1. Check if irrelevant to target context (if provided)
        if (careerRequiredSkills && !careerRequiredSkills.has(skillId)) {
            return 'NOT_RELEVANT';
        }

        // 2. Check if already mastered
        const currentProf = studentProficiencies[skillId] || 0;
        if (currentProf >= targetThreshold) {
            return 'ALREADY_MASTERED';
        }

        // 3. Resolve prerequisites
        const prereqEdges = this.edges.filter(e => e.toId === skillId && e.type === 'PREREQUISITE');
        if (prereqEdges.length === 0) return 'AVAILABLE'; // Top-level roots

        for (const edge of prereqEdges) {
            const prereqProf = studentProficiencies[edge.fromId] || 0;
            if (prereqProf < targetThreshold) {
                return 'BLOCKED_BY_PREREQUISITE'; // Instantly blocks if ANY mandatory prereq fails
            }
        }

        // If it has ONLY optional prereqs or all mandatory prereqs are met
        if (prereqEdges.length > 0) return 'AVAILABLE';
        return 'OPTIONAL';
    }

    /**
     * Recursive closure returning all transitive dependencies required to unlock skillId.
     */
    getPrerequisiteClosure(skillId: string): Set<string> {
        const closure = new Set<string>();
        const stack = [skillId];

        while (stack.length > 0) {
            const current = stack.pop()!;
            const prereqs = this.edges
                .filter(e => e.toId === current && e.type === 'PREREQUISITE')
                .map(e => e.fromId);

            for (const p of prereqs) {
                if (!closure.has(p)) {
                    closure.add(p);
                    stack.push(p);
                }
            }
        }
        return closure;
    }
}
