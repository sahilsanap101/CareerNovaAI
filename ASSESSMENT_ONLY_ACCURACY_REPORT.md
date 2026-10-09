# ASSESSMENT-ONLY CAREER RECOMMENDATION ACCURACY EVALUATION

This report evaluates the accuracy of the PATHFORGE recommendation engine using **ONLY** the 20-question career assessment, as requested. The evaluation strictly isolates the assessment logic from profile features (skills, projects, etc.) and avoids the 70:30 fusion.

## 1. Assessment Engine Used
The evaluation uses the exact `assessment.data.ts` logic as currently implemented in the `profile` module.
The scoring follows the requested direct mapping: 
`selected option -> option.careerWeights -> accumulate career score -> normalize`

## 2. Number of Questions
20 questions.

## 3. Question/Option Schema
Multiple-choice options mapped to `Q<X>_O<Y>`. Each option contains `careerWeights` for specific careers (e.g., `{"Frontend Developer": 1.0}`).

## 4. Dataset Used
`research/data/evaluation/student_dataset_500_minimal.csv`

## 5. Dataset Size
500 students.

## 6. Target Labels
The independent `preferred_career` column in the evaluation dataset.

## 7. Leakage Check
No target leakage detected. The `preferred_career` was strictly excluded from all assessment inputs, and no profile/skill features were utilized in this evaluation pipeline. 

## 8. Candidate Set
- **Experiment A:** 15-Career Controlled Benchmark.
- **Experiment B:** 60-Career Production Benchmark.

---

## 9-16. Metrics

| Metric | Experiment A (15 Careers) | Experiment B (60 Careers) |
| --- | --- | --- |
| **Top-1** | 7.60% | 7.60% |
| **Top-3** | 21.80% | 21.80% |
| **Top-5** | 36.60% | 36.40% |
| **MRR** | 23.49% | 21.65% |
| **NDCG@5** | 21.62% | 21.54% |
| **Macro Precision** | 3.45% | 3.45% |
| **Macro Recall** | 6.37% | 6.37% |
| **Macro F1** | 3.73% | 3.73% |

*Note: The target labels in the dataset belong to the 15-career subset, hence the exact same Top-1 accuracy for the 60-career candidate set. However, the presence of 45 distractor careers in Experiment B slightly degraded Top-5, MRR, and NDCG@5 by pushing the correct prediction further down the rank in some cases.*

## 17. Random Baseline
- **For 15 careers:** 
  - Random Top-1 = 6.67%
  - Random Top-3 = 20.00%
  - Random Top-5 = 33.33%
- **For 60 careers:** 
  - Random Top-1 = 1.67%
  - Random Top-3 = 5.00%
  - Random Top-5 = 8.33%

**Performance Beats Baseline:** YES (marginally for 15 careers, distinctly for 60 careers).

## 18. Representative Predictions

**Student ID: S0004**
- Target: AI/ML Engineer
- Top Predictions (60-career): 
  1. Data Scientist (Raw: 6.80, Norm: 0.340)
  2. Data Analyst (Raw: 4.00, Norm: 0.200)
  3. Full Stack Developer (Raw: 2.80, Norm: 0.140)
- Result: Target was pushed down slightly (Data Scientist outranked AI/ML Engineer based on options picked).

**Student ID: S0007**
- Target: Cloud Engineer
- Top Predictions (60-career): 
  1. Backend Developer (Raw: 6.60, Norm: 0.330)
  2. Software Engineer (Raw: 4.20, Norm: 0.210)
  3. Data Engineer (Raw: 4.00, Norm: 0.200)
- Result: Target missed the Top 5.

## 19. Failure Cases
- **Generic Weights:** Many options give high weights (0.8 - 1.0) to overlapping careers like `Software Engineer`, `Full Stack Developer`, and `Backend Developer`. Without skills to break ties, these generic careers consistently bubble to the top.
- **Out of Bounds Answers:** Some students generated answers like "5" for Q14 and Q15, but those questions only have 3 or 4 valid options, resulting in ignored weights for those questions.
- **Low Signal-to-Noise:** The assessment alone is inherently a low-fidelity signal. A user expressing interest in "Building backend systems" naturally matches multiple careers (Backend Developer, Java Developer, Python Developer) equally. 

## 20. Dataset Limitations
- The dataset `preferred_career` is distributed across 15 careers.
- Real-world accuracy of the assessment *without* profile/skill fusion is inevitably low because the assessment was designed to be a supplementary 30% signal, not a standalone classifier.
