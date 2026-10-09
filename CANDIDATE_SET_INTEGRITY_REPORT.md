# PATHFORGE Candidate Set Integrity Report

## 1. Ground-Truth Career Count
**15 Careers**
The fresh dataset generator (`generate_dataset.py`) explicitly loads `research/data/synthetic_v3/synthetic_v3_career_subset_v1.json`, generating `career_suitability` labels exclusively from this 15-career subset.

## 2. Candidate Career Count
**60 Careers**
During inference (`run_fresh_inference.ts`), `CareerKnowledgeService.getCareersForRecommendation()` loads the full `career_catalog_pathforge_60_careers_2026.csv`. The recommendation engine evaluates and scores all 60 careers for every student.

## 3. Exact Career Names in Each Set

### The 15 Ground-Truth Careers (Subset)
1. .NET Developer
2. AI Data / Annotation Quality Specialist
3. AI Engineer
4. AI Product / Applied AI Developer
5. API / Integration Developer
6. Application Security Engineer
7. Automation Test Engineer
8. BI Developer / BI Analyst
9. Backend Developer
10. Big Data Engineer
11. Blockchain / Web3 Developer
12. Business Analyst (IT)
13. Cloud Data Engineer
14. Cloud Engineer
15. Cloud Security Engineer

### The 60 Candidate Careers (Full Catalog)
Contains all 15 above, plus 45 additional careers (e.g., Computer Vision Engineer, Data Analyst, Data Scientist, DevOps Engineer, Full Stack Developer, Machine Learning Engineer, MLOps Engineer, NLP Engineer, Frontend Developer, QA Engineer, Software Engineer, etc.).

## 4. Intersection & Mismatches
- **Intersection:** All 15 ground-truth careers are present in the 60 candidate careers (True subset).
- **Missing Careers:** None. The candidate set includes all necessary targets.
- **Extra Careers:** There are 45 "extra" careers evaluated by the recommendation engine that will *never* appear as a ground-truth label in the test dataset.

## 5. Is the Evaluation Ranking 15 or 60 Careers?
**60 Careers.**
The metric script (`compute_metrics.py`) loops over `fusion_scores`, which contains all 60 scored careers, and ranks them all. It then searches for the rank of the ground-truth career among the 60.

## 6. What Should the Intended OLD Evaluation Use?
The intended evaluation for this dataset should use **15 Careers**.
In the original evaluation design (`evaluate_experiments.ts`), there was an explicit separation:
- **Experiment A (Controlled 15-career):** `recs.filter(r => CONTROLLED_CAREERS.has(r.careerName.toLowerCase()))`
- **Experiment B:** Full 60-career catalog.

Because the fresh dataset (`generate_dataset.py`) is hardcoded to generate targets exclusively from the 15-career subset, it was clearly generated for the **Controlled 15-career** experiment. Ranking them against 60 careers introduces a severe candidate-set mismatch.

## 7. Correct Random Baselines

### For the Current (Invalid) 60-Career Ranking:
- **Top-1:** 1/60 = **1.66%**
- **Top-3:** 3/60 = **5.00%**
- **Top-5:** 5/60 = **8.33%**
*(This perfectly matches the 0.8% - 1.3% Top-1 metrics observed in the recent regression test, further proving that the uncorrelated generator results in purely random performance against the 60 candidates).*

### For the Correct (Intended) 15-Career Ranking:
- **Top-1:** 1/15 = **6.67%**
- **Top-3:** 3/15 = **20.00%**
- **Top-5:** 5/15 = **33.33%**

## 8. Is the Current Evaluation Valid?
**INVALID.**
The evaluation pipeline suffers from a severe candidate-set mismatch. 
- **Dataset Generation:** Uses a 15-career space.
- **Inference Engine:** Generates scores for a 60-career space.
- **Metric Calculation:** Ranks across the 60-career space.

By failing to filter the predictions down to the 15 candidates before ranking, the `compute_metrics.py` script treats it as a 1-in-60 classification problem, artificially deflating the metrics and violating the mathematical design of the generated dataset.

## 9. Recommendation to Restore the OLD Evaluation Setup
To restore mathematical integrity without changing the recommendation engine logic:
Modify `compute_metrics.py` to filter `scores` down to the 15 valid ground-truth careers *before* sorting and calculating `rank`. 
```python
# Pseudo-fix for compute_metrics.py
valid_candidates = set(ground_truths) # The 15 unique target careers
filtered_scores = {k: v for k, v in scores.items() if k in valid_candidates}
ranked = sorted(filtered_scores.items(), key=lambda x: x[1], reverse=True)
```
This single change will correctly align the inference ranking space with the dataset generation space.
