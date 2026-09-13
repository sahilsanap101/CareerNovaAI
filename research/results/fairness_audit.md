# Algorithmic Fairness Audit: Demographic Independence

> **Note on Synthetic Data & Target Independence**: The demographic fields (Gender, Category) generated within `eval_dataset.csv` were assigned uniformly at random, completely independently of the profile's skills, interests, or ground-truth career label (N=200). Therefore, finding 'no skew' is mathematically guaranteed by construction. This audit serves strictly as a sanity-check confirming the evaluation script pipeline functions correctly. It is **NOT** a meaningful validation of algorithmic fairness. A true fairness audit must be re-run manually once real student demographic inputs organically populate the feedback architecture (N=30+).

### 1. Gender Distribution Assessment
*Note: To satisfy Chi-Square approximation validity assumptions (requiring expected cell counts ≥ 5), sparse demographic categories ('Non-Binary', 'Prefer not to say') were merged into an 'Other/Undisclosed' group prior to calculation.*

#### Contingency Table
| Group | AI Engineer | Backend Developer | Frontend Developer |
| --- | --- | --- | --- |
| Female | 27 | 27 | 38 |
| Male | 41 | 18 | 33 |
| Other/Undisclosed | 7 | 1 | 8 |


**Chi-Square Statistic**: 7.89
**p-value**: 0.096

**Interpretation**: No statistically significant association between gender subgroups and recommendation outputs was detected in this synthetic sample. Crucially, the absence of detected skew here is *not* proof of an unbiased algorithm. A definitive fairness evaluation cannot be claimed until real student populations with organic trait-clustering are evaluated.

---
### 2. Category Background Assessment
*Note: Similar to gender, the sparse 'Prefer not to say' category subgroup was collapsed into an 'Other/Undisclosed' group to prevent expected cell counts under 5 invalidating the Chi-Square approximation.*

#### Contingency Table
| Group | AI Engineer | Backend Developer | Frontend Developer |
| --- | --- | --- | --- |
| General | 42 | 29 | 45 |
| Other/Undisclosed | 4 | 1 | 2 |
| Reserved | 29 | 16 | 32 |


**Chi-Square Statistic**: 1.68
**p-value**: 0.794

**Interpretation**: No statistically significant association was detected between social category parameters and the deterministic recommendations. Again, relying uniquely on randomly generated variables means this result absolutely does *not* assert or guarantee fairness in production logic.
