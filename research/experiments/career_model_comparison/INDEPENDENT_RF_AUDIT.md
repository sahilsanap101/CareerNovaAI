# Independent Random Forest Audit

## 1. Metric Reproduction
I successfully reproduced the exact metrics reported for the Random Forest on the 15-career set:
- **Top-1:** 37.40%
- **Top-3:** 71.80%
- **Top-5:** 88.00%
- **MRR:** 57.60%
- **NDCG@5:** 64.06%
- **Macro F1:** 32.47%

## 2. Methodology Verification
- **Validation Strategy:** The metrics were correctly calculated using 5-fold Stratified Cross-Validation.
- **Out-of-Fold Predictions:** I verified that the saved predictions for each student were genuinely generated out-of-fold. The model that scored a student was explicitly *not* trained on that student.
- **Fair Baseline Comparison:** The Popularity baseline was recalculated by estimating popularity *strictly from the training folds* rather than the global dataset. The CV Popularity baseline Top-1 is 12.40% (identical to the global estimate because the distribution is highly symmetric in this dataset).
- **Statistical Significance:** A paired bootstrap test on the MRR difference between the Random Forest (0.576) and the 70:30 Heuristic (0.225) yields a mean difference of +0.351 (95% CI: [0.314, 0.388]). This confirms the performance improvement is highly statistically significant.

## 3. Feature Design Audit
The input matrix to the Random Forest consisted of exactly 30 features:
- 15 Profile Heuristic Scores (one for each candidate career).
- 15 Assessment Heuristic Scores (one for each candidate career).

By utilizing these scores as meta-features, the Random Forest essentially acted as a non-linear calibrator. It successfully learned how the manual heuristic scores (which performed poorly on their own) structurally mapped to the ground-truth labels.
