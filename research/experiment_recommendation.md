# EXPERIMENT: RECOMMENDATION PERFORMANCE

**Objective:** Validate that the BYSER algorithm correctly prioritizes multi-factor candidate profiling over single-factor heuristics.

**Location / Script:**
Script generated locally at `apps/api/scripts/evaluate_byser.ts`.

**Dataset:**
*   1,000 synthetic profiles representing the Prisma `StudentProfile` relation.
*   Variables included randomized CGPA, 1-5 proficiency vectors, and priority-linked goals.

**Baselines Evaluated:**
1.  **POP-FREQ:** Assigns careers based purely on a randomized demand scalar.
2.  **JACCARD SKILL MATCH:** Evaluates overlap using purely boolean presence $\frac{|U \cap C|}{|U \cup C|}$.

**Ground Truth (Proxy):**
A hybrid priority metric was constructed calculating theoretical maximum overlap assuming a user was fully competent in their explicit career goal.

**Metric:**
*   **NDCG@3 (Normalized Discounted Cumulative Gain):** Measures ranking quality, penalizing relevant careers appearing lower in the top 3 spots.

**Findings:**
BYSER achieved ~0.88 NDCG compared to Jaccard's 0.64. By factoring in 1-10 ImportanceWeights and the 1-5 User Proficiency scaling instead of boolean existence, BYSER achieves significantly higher relevancy clustering at the top of the recommendation array.
