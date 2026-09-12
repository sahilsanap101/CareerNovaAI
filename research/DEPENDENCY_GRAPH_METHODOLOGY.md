# Skill Dependency Graph Methodology

## Objective
To transform the prior visualization-oriented skill array into a rigid, mathematically validated directed acyclic graph (DAG) acting as a foundational constraint matrix for the career path optimizer.

## Representation Parameters
1. **Nodes (`Skill`)**: Standardized Canonical Skill IDs reflecting independent learnable concepts.
2. **Edges (`SkillDependency`)**:
   - `PREREQUISITE`: Mandatory antecedent required before node mastery can commence.
   - `COREQUISITE`: Skills highly recommended to be learned simultaneously or in overlapping intervals.
   - `OPTIONAL`: Enhancing but non-blocking dependencies.

## Verification Constraints
A skill is only marked computationally `AVAILABLE` to a student at time $t$ if every node in its dependency set marked as `PREREQUISITE` possesses an assessed proficiency equal to or greater than the required antecedent threshold. 

## The Algorithmic Outputs
- **`AVAILABLE`**: Prerequisites are completely satisfied.
- **`BLOCKED_BY_PREREQUISITE`**: At least one mandatory upstream skill lacks sufficient mastery.
- **`ALREADY_MASTERED`**: Target skill itself exceeds the target mastery threshold.
- **`NOT_RELEVANT`**: Node exists in graph but doesn't map to the student's current career vector.
- **`OPTIONAL`**: No blocking relations; learning yields bonus utility but isn't strictly necessitated.

## No Fabrication Policy
To support scientific viability, no edges may be dynamically fabricated or heuristically mapped by black-box algorithms without provenance tracking. Every edge persists metadata defining its origin (e.g., extracted from ESCO API), the evidence (corpus context), its confidence, and its manual validation status.
