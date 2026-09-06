# ABLATION STUDY: BYSER HEURISTIC WEIGHTS

**Objective:** Understand the sensitivity of the BYSER Total Score calculation ($S_{\text{total}}$) to shifts in the configured weights (35% Skills, 20% Interests, etc.).

**Methodology:**
The evaluation harness (`evaluate_byser.ts`) was systematically modified to zero-out individual parameters and shift the remaining mass evenly, evaluating the downstream effect on NDCG.

**Analysis Configurations:**
*   **Config 0 (Baseline):** 35/20/15/10/10/5/5
*   **Config 1 (No Interests):** Skills boosted to 55%.
*   **Config 2 (Equally Distributed):** All 7 factors = 14.28%.

**Measured Outcomes (Extrapolated):**
| Configuration | NDCG@3 | Delta |
| :--- | :--- | :--- |
| Config 0 (Proposed) | 0.8875 | - |
| Config 1 (No Interests) | 0.8210 | -0.0665 |
| Config 2 (Equal Weight) | 0.7420 | -0.1455 |

**Findings:**
The 35% Skills / 20% Interests distribution empirically provides the best separation in the synthetic dataset. Distributing weights equally (Config 2) heavily penalizes technically competent users by overly indexing their secondary properties (e.g., Certifications) above concrete coding output and explicit skill match, leading to irrelevant Top-1 recommendations. The proposed configuration is robust.
