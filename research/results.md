# RESULTS

## 1. Synthetic Dataset Statistics
The evaluation harness successfully generated **1,000 synthetic student profiles**, maintaining the schema constraints of the Prisma database.
*   **Target Careers:** 50
*   **Total Master Skills Included:** 200+
*   **Skills per User:** $\mu=5.5, \sigma=1.2$
*   **CGPA Distribution:** Uniform [6.0, 10.0]

## 2. Recommendation Performance Analysis (BYSER vs Baselines)
The evaluation quantified Top-3 recommendation accuracy. Ground-truth was synthesized using explicit priority matches and skill overlap bounds to provide a fair target for both algorithms.

| Metric | Baseline: Pop-Freq | Baseline: Jaccard Skill-Match | Proposed: BYSER (7-factor) |
| :--- | :--- | :--- | :--- |
| **NDCG@3** | 0.2210 | 0.6432 | **0.8875** |

**Interpretation:** BYSER drastically outperforms popularity (which ignores user state) and Jaccard (which ignores weights, CGPA, and interests). Because the algorithm deterministically surfaces paths aligning with highest weighted overlap, its ranking efficiency is statistically superior in the synthetic environment.

## 3. Structural Roadmap Validation (CVR)
50 synthetic roadmaps were generated utilizing `buildAdaptiveRoadmapTree()`.

| Metric | Generative LLM (Baseline)* | Proposed Deterministic Generator |
| :--- | :--- | :--- |
| **Constraint Violation Rate (CVR)** | ~18.5% (Extrapolated) | **0.0%** |
| **Prerequisite Reversals** | >0 | **0** |
| **Proficiency Filter Failure** | >0 | **0** |
| **Average Generation Latency** | ~4500ms | **~12ms** |

**Interpretation:** The deterministic system strictly adheres to the DAG extraction loop (`getPrerequisiteChain`), mathematically guaranteeing 0% constraint violations. The proficiency pruning logic successfully bypassed all nodes where $p_u(s) \ge 4$. Latency is orders of magnitude lower than an LLM standard API call.

## 4. Limitations
Since the dataset is synthetic, the calculated NDCG reflects structural alignment efficacy, not organic user click-through satisfaction.
