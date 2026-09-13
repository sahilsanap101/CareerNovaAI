# Model Baseline Comparison (Test Set N=60)
> BYSER and TF-IDF were evaluated on the same 30% held-out test set as the Random Forest algorithm (n=60 mappings).

### Ablation Study & Explainability Trade-Off

| Model Framework | Precision@1 | CI (95%) | Macro-F1 | Explanation available to end-user without extra tooling? | Deterministic output for same input? |
|---|---|---|---|---|---|
| **BYSER Algorithm (+Market Alignment)** | 71.7% | [60.0%, 83.3%] | 70.5% | Yes | Yes |
| **BYSER Algorithm (Base)** | 73.3% | [61.7%, 85.0%] | 73.2% | Yes | Yes |
| **Random Forest (scikit-learn)** | 76.7% | [66.7%, 86.7%] | 76.2% | No | Yes |
| **TF-IDF String Similarity** | 83.3% | [73.3%, 91.7%] | 82.6% | No | Yes |

### Statistical Significance (McNemar's Test Pairwise Matrix)
| Model A | Model B | Discordant (B got right, A got wrong) | Discordant (A got right, B got wrong) | χ² Statistic | p-value | Interpretation |
|---|---|---|---|---|---|---|
| BYSER (Base) | BYSER (+Market) | 4 | 5 | 0.00 | 1.000 | not statistically significant |
| BYSER (Base) | Random Forest | 7 | 5 | 0.08 | 0.773 | not statistically significant |
| BYSER (Base) | TF-IDF | 7 | 1 | 3.12 | 0.077 | not statistically significant |
| BYSER (+Market) | Random Forest | 7 | 4 | 0.36 | 0.546 | not statistically significant |
| BYSER (+Market) | TF-IDF | 8 | 1 | 4.00 | 0.046 | significant |
| Random Forest | TF-IDF | 7 | 3 | 0.90 | 0.343 | not statistically significant |

### Interpretation
The inclusion of Market Demand mappings resulted in a Precision@1 of 71.7%, compared to 73.3% for the Base algorithm. Under an uncorrected significance threshold, the market-alignment variant showed a statistically significant deficit against the TF-IDF baseline (p=0.046), whereas the base BYSER algorithm's comparison against TF-IDF did not reach significance (p=0.077).

Because 6 pairwise tests were run, we must apply a Bonferroni correction (adjusted α = 0.05/6 ≈ 0.0083). Under this stricter, more appropriate threshold for multiple comparisons, NONE of the 6 pairwise differences reach statistical significance, including the p=0.046 result.

Ultimately, the market-alignment extension did not improve performance in this evaluation and may have marginally worsened it, though not to a degree that survives correction for multiple comparisons. This stands as a legitimate negative result: attempting to inject broad proxy demand signals overtop an explicitly tuned deterministic framework yielded no structural advantage.

Both TF-IDF and Random Forest operate as black-box predictors that do not naturally decompose into human-readable rationale without additional tooling (such as SHAP or LIME). The BYSER algorithm explicitly computes independent constituent scores matching the user interface components (e.g. skills gaps, project links, and interests matches), ensuring complete transparency natively within the application boundary without secondary analytical instrumentation.