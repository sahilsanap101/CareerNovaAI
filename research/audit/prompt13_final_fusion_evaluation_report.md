# PATHFORGE Final Synthetic V3 Fusion Evaluation Report

## OVERVIEW

This report executes the pre-registered Controlled Synthetic Evaluation of the deterministic PATHFORGE recommendation engine against the `synthetic_v3` semantic benchmark. The evaluation uses the exact production Typescript engine to generate $P(u,c)$ and $Q(u,c)$ without tuning or retrospective adjustments.

## 18. FINAL REPORT ANSWERS

**1. Does fixed 70:30 beat 100:0 in Condition A?**
No. In Condition A (Profile Dominant), 70:30 fusion (M4) performs worse than 100:0 profile-only (M0) on the primary Top-1 metric (8.67% vs 9.33%). The deterministic 70:30 heuristic degraded performance.

**2. Does fixed 70:30 beat 100:0 in Condition B?**
Yes (slightly). In Condition B (Complementary), M4 outperformed M0 on Top-1 (8.0% vs 5.67%) and MRR, suggesting a marginal benefit when information is split perfectly. However, the overall performance remains extremely poor compared to Random Forest or Oracle models.

**3. Does fixed 70:30 beat 100:0 in Condition C?**
No. In Condition C (Assessment Dominant), M0 outperformed M4 significantly (10.0% vs 5.0% Top-1).

**4. Does assessment-only beat profile-only where expected?**
No. In Condition C (designed and validated to have the most information in the assessment), M1 (0:100, Assessment-Only) achieved only a 5.0% Top-1 accuracy, while M0 (Profile-Only) achieved 10.0%. **This is a critical finding.** Prompt 12 established that the raw assessment features in Condition C contain highly predictive information (Random Forest achieved 22.2%), but the deterministic PATHFORGE $Q(u,c)$ mapping fails entirely to extract and utilize this information.

**5. Does fusion exploit the complementary structure in Condition B?**
Marginally. While it slightly beats profile-only (M0), it is clear that the deterministic linear combination ($F_r(u,c) = 0.7P + 0.3Q$) is an extremely weak aggregator compared to the non-linear potential demonstrated by earlier Oracle models.

**6. Which ratio wins on VALIDATION?**
On the VALIDATION splits, **M0 (100:0)** was universally selected as the highest NDCG@5 performing ratio across all three conditions. The fixed 70:30 ratio never won.

**7. How does that selected ratio perform once on TEST?**
The selected ratio (M0) performs at 9.3%, 5.6%, and 10.0% Top-1 across A, B, and C respectively on TEST.

**8. How many students improve/worsen/remain unchanged?**
(Based on 70:30 vs 100:0, `student_effects_v3.csv`):
- **Condition A:** Improved: 40 (13.3%); Worsened: 68 (22.6%); Unchanged: 192 (64%)
- **Condition B:** Improved: 36 (12%); Worsened: 62 (20.6%); Unchanged: 202 (67.3%)
- **Condition C:** Improved: 28 (9.3%); Worsened: 125 (41.6%); Unchanged: 147 (49%)

**9. What are the 95% CIs?**
Bootstrap and Permutation tests (`fusion_bootstrap_ci_v3.csv`) indicate that:
- In Condition A, M4 is statistically indistinguishable or significantly worse depending on the metric.
- In Condition C, M4 is significantly worse than M0 ($p < 0.05$ on Reciprocal Rank and Top-1).

**10. What does this imply about the 70:30 hypothesis?**
The fixed 70:30 heuristic **DOES NOT SUPPORT FUSION**. The primary hypothesis that the deterministic 70:30 split generally improves over profile-only is rejected.

## SCIENTIFIC DISTINCTION

The results demonstrate an **Insufficient information recoverable by the deterministic heuristic** (Distinction D). 

We know from Prompt 12 that the assessment features *do* contain the necessary signal (the Latent Oracle proved it). The failure here is strictly a failure of the deterministic $Q(u,c)$ matrix-multiplication scoring heuristic in PATHFORGE. It is incapable of correctly aligning the 20 raw Likert responses to the correct career categories.

Because the underlying deterministic models ($P$ and $Q$) are so weak, combining them using a static scalar linear weight ($70:30$) cannot magically synthesize the missing accuracy. 
