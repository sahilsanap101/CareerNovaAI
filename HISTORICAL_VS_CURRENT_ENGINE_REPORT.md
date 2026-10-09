# Historical vs Current Engine Report

## Dual-Engine Comparison (15-Career Candidate Set)

| Metric | Historical Experiment (BYSER) | Current Engine (`RecommendationEngineService`) |
| --- | --- | --- |
| **Top-1** | 65.00% | 5.80% |
| **Top-3** | 77.80% | 17.60% |
| **Top-5** | 85.40% | 28.00% |
| **MRR** | 73.90% | 19.00% |
| **NDCG@5** | 75.61% | 16.70% |

> **Note:** Both evaluations were run on the same `student_dataset_500_development.csv` dataset, using profile-only, target-blind evaluation (career goals were explicitly omitted). The candidate set was strictly filtered to the historical 15 careers.

## Exact Implementation Differences

| Component | Historical Implementation (`run_evaluation.py`) | Current Implementation (`RecommendationEngineService`) | Effect on Ranking |
| --- | --- | --- | --- |
| **Scoring Formula (SGI Penalty)** | Computes final score with a non-linear Skill Gap Index penalty: `match_score = total * (1 - (sgi/200))` | Uses purely linear summation: `finalScore = (skillScore * 0.35) + ...` | **CRITICAL:** The historical penalty severely dropped scores for careers with skill gaps, massively widening the margin between the "correct" synthetic career and distractors. The current engine dilutes everything linearly, causing ties and near-misses. |
| **Feature Extraction (Interests)** | Hardcoded string matching: checks if career name/domain exists as substring in `['Artificial Intelligence', 'Data', ...]` mapped from dataset. | Relies strictly on `career.interests` objects and ID matching. | The historical logic successfully matched the `interest_*` columns in the dataset to the careers, whereas the current engine yields 0 for interests on this dataset. |
| **Feature Extraction (Projects)** | Substring search: Checks if required skill names appear inside project titles. | Exact keyword overlap: Checks if project technology tags match career required skill tags perfectly. | The historical logic inflated project scores easily by finding simple text overlap; current engine yields 0 for synthetic projects. |
| **Skill Name Normalization** | Uses a massive, hardcoded `SKILL_ALIASES` dict (e.g., mapping 'vanilla js' to 'JavaScript'). | Uses strict `canonicalName` or `skillId` from the 538-skill database. | The historical engine mapped the synthetic CSV headers perfectly. The current engine misses many skills if exact casing or ID does not match. |
| **Knowledge Base (Careers)** | Used `career_evaluation_15.csv` and `career_skill_evaluation_15_corrected.csv` (15 strictly defined careers). | Uses `career_catalog_pathforge_60_careers_2026.csv` (60 careers) with significantly more required skills per career. | The current catalog demands far more skills per career, dropping the raw `skillScore` for the synthetic 500 students who only have a handful of skills. |
