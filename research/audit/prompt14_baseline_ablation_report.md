# PATHFORGE Baseline Comparison and Ablation Report (Prompt 14)

## OVERVIEW

This report extends the evaluation of the deterministic PATHFORGE recommendation engine against standard learned baselines (Random Forest, HistGradientBoosting) to determine whether poor performance is due to a lack of information in the semantic profiles, or a failure of the deterministic scoring function to recover that information.

## FINAL INTERPRETATION TABLE

| Question | Evidence |
| :--- | :--- |
| **1. Does profile contain predictive information?** | **Yes.** Learned models (RF Profile-only) significantly outperform the PATHFORGE Profile-only heuristic (M0). The information exists but is poorly extracted by the deterministic heuristic. |
| **2. Does assessment contain predictive information?** | **Yes.** Learned models (RF Assessment-only) strongly outperform the PATHFORGE Assessment-only (M1) heuristic. In Condition C, the assessment is highly predictive for RF, but nearly useless for PATHFORGE. |
| **3. Does assessment add information beyond profile?** | **Yes.** RF Combined models demonstrate higher accuracy and NDCG than RF Profile-only models, especially in Conditions B and C where assessment information was injected by the generator. |
| **4. Does PATHFORGE recover profile information effectively?** | **No.** M0 (100:0) is vastly outperformed by baseline tree-based estimators utilizing the exact same information. |
| **5. Does PATHFORGE recover assessment information effectively?** | **No.** M1 (0:100) performs extremely poorly, indicating the deterministic Likert-to-Career mapping fails to exploit the available signal. |
| **6. Does 70:30 exploit complementary information?** | **Marginally, but irrelevantly.** Because the base deterministic functions $P$ and $Q$ are so weak, combining them linearly offers negligible improvements compared to the non-linear potential of learned models. |
| **7. Does RF outperform deterministic PATHFORGE?** | **Yes.** Random Forest combined heavily outperforms M4 across all conditions. |
| **8. Does XGBoost (Gradient Boosting) outperform deterministic PATHFORGE?** | **Yes.** Gradient Boosting heavily outperforms M4 across all conditions. |
| **9. Which PATHFORGE component is the main bottleneck?** | **The deterministic scoring functions.** The failure is not in the data structure, but in the rigid, heuristic feature mappings and linear aggregations used to rank careers. |
| **10. Does the evidence support the original 70:30 claim?** | **No.** The claim that a 70:30 deterministic fusion generally provides accurate and improved career recommendations is scientifically unsupported. |


## REQUIRED FINAL VERDICT

**PATHFORGE Deterministic System Classification:**
**C. Not supported under the controlled synthetic benchmark**

**70:30 Fusion Hypothesis Classification:**
**Not Supported** (The deterministic combination of two failing heuristics does not yield a successful recommendation engine).

**Assessment Component Classification:**
**Evidence of useful information** / **Current scoring fails to recover available information**
