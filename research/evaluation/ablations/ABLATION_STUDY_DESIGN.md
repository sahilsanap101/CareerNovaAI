# Controlled Ablation Study Design

To explicitly isolate and prove the statistical merit of each heuristic adjustment made during the PathForge algorithm expansion, this experimental suite strips the proposed model down systematically layer by layer. 

## The Ablation Spectrum

- **A0 (Gap Only)**: Isolates the purest baseline. Sorts unmastered skills exclusively by `StudentProficiency - RequiredProficiency`.
- **A1 (Gap + Career Importance)**: Re-introduces semantic scaling. Asserts whether prioritizing domain-critical skills outperforms pure numeric gap bridging.
- **A2 (Gap + Market Demand)**: Eliminates static semantic importance, utilizing external labor velocity frequencies.
- **A3 (Gap + Importance + Demand)**: Identical to the B2 Prioritizer baseline. The fully unconstrained numeric score.
- **A4 (A3 + Prerequisite Constraints)**: Introduces the DAG Topological closure limitations (`planner.ts`). Should theoretically result in lower immediate Utility maximization but Zero Prerequisite Violations.
- **A5 (A4 + Learning Budget)**: Caps the solver iteratively based on formal threshold hours. Evaluates safe deferral vs algorithm crash limits.
- **A6 (A5 + Closed-Loop Adaptation)**: The full end-state system including chronologic boundary adjustment tracking `RoadmapChurn`.

## Sensitivity Variances
Simultaneously, we measure gradients by sliding scalar bounds:
- **Market Weight Sensitivity** ($\delta \in [0.1, 1.0]$)
- **Learning Cost Variations** (Equalizing costs vs Realistic hours)
- **Budget Scalability** ($10 \text{ hrs} \dots 500 \text{ hrs}$)
- **Strictness Matrix** (Testing "soft" prerequisites yielding penalties vs "hard" topological blockers).

Outputs are forced via the CLI runner into IEEE-ready tables without subjective cherry-picking.
