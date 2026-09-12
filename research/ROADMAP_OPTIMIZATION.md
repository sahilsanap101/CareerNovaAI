# B3 Roadmap Optimization Methodology

## The Sequential Skill Planner
The B3 engine is fundamentally distinct from the static, heuristic-bucketed Legacy R0 generator. R0 grouped skills statically by semantic buckets (Fundamentals, Advanced). B3 is a dynamic, budget-constrained graph traversal optimizer.

## Core Inputs
1. **Student State**: Current proficiency vectors mapping missing prerequisites.
2. **Skill Priorities**: Derived multiplicatively via B2 (Gap * Importance * Demand).
3. **Formal Skill DAG**: The isolated DAG component resolving `AVAILABLE` vs `BLOCKED_BY_PREREQUISITE` statuses securely.
4. **Learning Budget**: Hard constraints regarding the temporal or cognitive resources available per sequence phase.

## Path Algorithms
At each phase interval, the Planner:
1. Calculates the transitive closure subset of missing abilities.
2. Filters out `ALREADY_MASTERED` nodes.
3. Iterates over the `SkillGraph` evaluating true eligibility status based on *simulated current state* (this accommodates skills learned in Phase 1 unlocking Phase 2 targets).
4. For all `AVAILABLE` targets, attempts selection optimizing for highest Priority, bounded heavily by remaining Phase Learning Cost limits.
5. Emits strict justifications detailing exact prerequisites met or why a node remains uncallable.

NO LLMS are utilized during execution to generate sequential paths. Output deterministically follows mathematical cost-optimizations against the topological sorting algorithms.
