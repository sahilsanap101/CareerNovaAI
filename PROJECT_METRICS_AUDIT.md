# PATHFORGE Metrics Audit

## 1. Current System Configurations
- **Recommendation Feature Weights (`BYSER_WEIGHTS`):**
  - SKILLS: 0.35
  - INTERESTS: 0.20
  - PROJECTS: 0.15
  - ACADEMIC: 0.10
  - CERTIFICATIONS: 0.10
  - CODING: 0.05
  - GOALS: 0.05
- **Stage Adjustments:**
  - **Exploratory (Year 1-2):** Interests (x1.5), Academics (x1.2), Skills (x0.7), Coding (x0.5). Global multiplier = 0.8
  - **Placement Ready (Year 3-4):** Skills (x1.1), Coding (x1.2), Projects (x1.1), Goals (x1.2). Global multiplier = 1.2
- **Fusion Weights:**
  - Profile Score: 70%
  - Assessment Score: 30%

## 2. Dataset Properties
- **Test Dataset Size:** 2000 samples (as defined in `generate_dataset.py`)
- **Number of Careers (Classes):** 15
- **Random Seed for Fresh Evaluation:** `master_seed = 9999` (Latent matrices seeded with 101 and 102).
- **Candidate Set:** All 15 careers are evaluated and ranked for every student.

## 3. Fresh Evaluation Metrics (Current Results)

| Metric | Profile-only | Assessment-only | Current Fusion |
|---|---|---|---|
| Top-1 | 5.33% | 7.00% | 5.33% |
| Top-3 | 15.89% | 20.00% | 15.89% |
| Top-5 | 28.89% | 34.78% | 28.89% |
| MRR | 0.197 | 0.228 | 0.197 |
| NDCG@5 | 0.165 | 0.204 | 0.165 |

### Fresh Ablation Metrics
| Ablation | Top-1 | Top-5 | MRR |
|---|---|---|---|
| without Skills | 5.33% | 28.89% | 0.197 |
| without Interests | 5.33% | 28.89% | 0.197 |
| without Projects | 5.33% | 28.89% | 0.197 |
| without Academics | 5.33% | 28.89% | 0.197 |
| without Certifications| 5.77% | 30.22% | 0.210 |
| without Coding | 5.33% | 28.89% | 0.197 |
| without Goals | 6.55% | 32.88% | 0.214 |

## 4. Baseline Metrics
- **Uniform Random Top-1:** 1/15 ≈ 6.67%
- **Uniform Random Top-3:** 3/15 = 20.00%
- **Uniform Random Top-5:** 5/15 = 33.33%
- **Majority Class Top-1:** ~7-10% (dependent on generator bias)

## 5. Metric Formulas
- **Top-K:** `Sum(1 if True_Rank <= K else 0) / N`
- **MRR (Mean Reciprocal Rank):** `Sum(1 / True_Rank) / N`
- **NDCG@5 (Normalized Discounted Cumulative Gain):** `DCG@5 / IDCG@5`
  - `DCG@5 = Sum(rel / log2(i + 2))` for i=0 to 4
  - `IDCG@5 = 1.0` (Since there is only 1 true career, the ideal rank is 1)
- **Macro/Micro F1, Precision, Recall:** Standard sklearn implementations (`precision_recall_fscore_support`).
