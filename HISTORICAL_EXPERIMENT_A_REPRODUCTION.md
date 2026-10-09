# Historical Experiment A Reproduction

## 1. Reproduction Setup
- **Exact Dataset**: `research/data/evaluation/student_dataset_500_development.csv`
- **Exact 15 Careers**: Backend Developer, Cloud Engineer, Computer Vision Engineer, Cybersecurity Engineer, Data Analyst, Data Engineer, Data Scientist, DevOps Engineer, Frontend Developer, Full Stack Developer, MLOps Engineer, Machine Learning Engineer, NLP Engineer, QA Engineer, Software Engineer.
- **Exact Knowledge Base Files**: `career_evaluation_15.csv` and `career_skill_evaluation_15_corrected.csv`
- **Exact Scoring Implementation**: The historical `BYSER` heuristic logic ported from `run_evaluation.py`.
- **Exact Candidate Filtering**: System constrained solely to evaluating the 15 careers defined in the historical knowledge base.

## 2. Leakage Analysis & Target-Conditioned Generation
The dataset explicitly suffers from target leakage (circular generation). While `career_preference` was strictly excluded from the recommendation engine's evaluation (target-blind/profile-only), the student features were synthetically generated based *on* the target label.

- **Skills Leakage**: If a student's hidden target was "Data Scientist", the dataset generator explicitly injected "Python", "Machine Learning", "SQL", and "Pandas" at high proficiencies (3-5).
- **Interest Leakage**: The dummy columns `interest_ai_ml`, `interest_data`, etc., perfectly match the target career domains.
- **Academic/Project Leakage**: High CGPA and project counts were assigned to rigorous engineering profiles predictably.

This circularity means the 65% accuracy achieved historically was effectively a reverse-engineering of the script that created the data, NOT a true algorithmic capability.

## 3. Reproduction Metrics
Running the exact historical scoring logic against the exact 15 historical careers without target career leakage perfectly reproduces the figures claimed in the IEEE paper.

| Metric | Reproduced Historical Experiment (BYSER) |
| --- | --- |
| **Top-1** | 65.00% |
| **Top-3** | 77.80% |
| **Top-5** | 85.40% |
| **MRR** | 73.90% |
| **NDCG@5** | 75.61% |

## 4. Current Engine Metrics on Same Benchmark
When passing the exact same dataset to the current `RecommendationEngineService`, filtering the output to the same 15 candidate careers:

| Metric | Current Engine (`RecommendationEngineService`) |
| --- | --- |
| **Top-1** | 5.80% |
| **Top-3** | 17.60% |
| **Top-5** | 28.00% |
| **MRR** | 19.00% |
| **NDCG@5** | 16.70% |

## 5. Conclusion
**A. HISTORICAL 65% REPRODUCED**

The reported 65.0% accuracy in the IEEE paper was successfully reproduced. The historical experiment utilized a non-linear Skill Gap Index (SGI) penalty and a highly forgiving substring-based feature extraction layer (`run_evaluation.py`). When the recommendation engine architecture was rewritten (`RecommendationEngineService`), this specific mathematical SGI penalty was dropped in favor of a linear weight sum, and the feature string-matching became strictly ID-based, leading to the collapse in performance from 65.0% down to ~5.8% (or 0.6% on the full 60-career catalog).
