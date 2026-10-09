# Primary Hypothesis Result (70:30 Fusion)

**H0 (Null Hypothesis):** The fixed 70:30 deterministic fusion strategy performs less than or equal to a 100:0 profile-only strategy.
**H1 (Alternative Hypothesis):** The fixed 70:30 deterministic fusion strategy significantly improves recommendation performance (e.g. Top-1 accuracy or MRR) over a 100:0 profile-only strategy.

## Condition A (Profile Dominant)
- **Comparison:** 70:30 vs 100:0 (M4 vs M0)
- **Top-1 Difference:** -0.67 percentage points (M4: 8.67%, M0: 9.33%)
- **95% CI (MRR difference):** [-0.0039, 0.0001]
- **Statistical Test:** Wilcoxon signed-rank
- **P-value:** < 0.001 (for a negative difference)
- **Decision:** Fail to reject H0 (Fusion degrades performance).

## Condition B (Complementary)
- **Comparison:** 70:30 vs 100:0 (M4 vs M0)
- **Top-1 Difference:** +2.33 percentage points (M4: 8.00%, M0: 5.67%)
- **95% CI (MRR difference):** [0.0019, 0.0037]
- **Statistical Test:** Wilcoxon signed-rank
- **P-value:** < 0.001
- **Decision:** Statistically significant but practically minimal improvement. Overall deterministic accuracy remains extremely low.

## Condition C (Assessment Dominant)
- **Comparison:** 70:30 vs 100:0 (M4 vs M0)
- **Top-1 Difference:** -5.0 percentage points (M4: 5.00%, M0: 10.00%)
- **95% CI (MRR difference):** [-0.0545, -0.0371]
- **Statistical Test:** Wilcoxon signed-rank
- **P-value:** < 0.001 (for negative difference)
- **Decision:** Fail to reject H0. Assessment-based fusion catastrophically fails in the exact condition where assessment data is strongest.

## Final Classification
**NOT SUPPORTED**
