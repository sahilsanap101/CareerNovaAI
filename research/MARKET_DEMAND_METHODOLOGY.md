# Job-Market Skill Demand Methodology

## Objective
To estimate externally observed skill demand derived from job-posting datasets in a reproducible and auditable manner, decoupled from the legacy heuristic recommendation engine.

## Extraction and Enumeration
1. **Deduplication**: Identical postings (matching title, employer, location, and date within a 48-hour window) are aggressively deduplicated to prevent frequency skew.
2. **Career Classification**: Job postings are mapped to canonical `Career` definitions via the Entity Resolution pipeline (or a designated classification mapping heuristic).
3. **Skill Normalization**: Raw skill substrings contained in postings are mapped to canonical `Skill` IDs using semantic matching. Unmapped terms are excluded from statistical probability calculations but stored statically in a separate review queue.
4. **Missing Data Handling**: Postings with zero resolvable skills do not contribute to the aggregated skill totals but still contribute to the global posting denominator for absolute frequency metrics.

## Statistical Safeguards implemented
- **No Evaluation Leakage**: Datasets utilized for historical backtesting are strictly split from datasets used for temporal outcome validation. 
- **No Future Information**: Time-series demand calculations ($t_n$) strictly utilize data where $datePosted \leq t_n$.
- **Historical Honesty**: Computed frequencies represent historical bounds. We explicitly disallow the terminology "live demand" for batch-processed CSVs.
- **Independence of Salary**: Salary predictions are disjointed from market frequency unless a statistically causal independent covariate dataset verifies the projection.
