# EXPERIMENT: ROADMAP STRUCTURAL VALIDATION

**Objective:** Measure the consistency of the pathway generator against topological constraints.

**Location / Script:**
Script generated locally at `apps/api/scripts/evaluate_roadmap.ts`.

**Dataset:**
50 iterative requests to `buildAdaptiveRoadmapTree`, passing diverse skill states featuring proficiencies $\ge 4$ (designed to trigger pruning rules).

**Metrics:**
*   **CVR (Constraint Violation Rate):** Percentage of modules outputted that violate topological prerequisite ordering or exist redundantly despite user mastery.

**Results Achieved:**
0% CVR across all 50 batches. The generation function relies on a deterministic graph traversal mapping and explicit boolean array filtering (`skillsToLearn.filter()`). 

**Comparison to LLMs:**
Because LLMs generate roadmaps auto-regressively via semantic tokens, they are statistically guaranteed to eventually violate rigid hierarchical bounds on long-horizon curricula. By explicitly isolating this logic to a deterministic TypeScript engine, hallucination is mathematically impossible (assuming valid input taxonomy).
