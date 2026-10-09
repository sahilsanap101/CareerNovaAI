# PATHFORGE Real-Student Evaluation Protocol (v1)

## 1. Overview and Objectives
The goal of this protocol is to collect prospective, real-world data from human students to legitimately validate the PATHFORGE assessment-fusion hypothesis. This dataset will determine whether the mathematical fusion of a 7-dimensional profile with a 20-question psychological assessment improves the recommendation of suitable career pathways in real humans, compared to using profile data alone.

## 2. Target Concepts
To prevent ambiguity and circular evaluation, we strictly isolate two target concepts:
1. **Student Preferred Career (`student_preference`)**: The student's subjective ideal career path at the time of assessment.
2. **Expert Suitability Judgment (`career_suitability`)**: The objective career recommendation provided by an independent human career counselor or domain expert after reviewing the student's holistic profile and assessment results.

**Target for Algorithm Validation:** The primary target for calculating the accuracy (Top-1, Top-3, etc.) of the PATHFORGE recommendation algorithm is the **Expert Suitability Judgment (`career_suitability`)**.

## 3. Recruitment and Consent
- **Target Population:** Minimum of 1,000 undergraduate and graduate students across diverse academic disciplines (STEM, Humanities, Business).
- **Consent:** All participants must provide explicit, informed consent for their data (academics, skills, interests, and psychometric responses) to be used for algorithmic evaluation.
- **Anonymization:** All Personally Identifiable Information (PII) will be stripped at the point of collection. Student IDs will be hashed.

## 4. Data Collection Procedure
1. **Profile Data Intake:** Students submit their 7-dimensional profile (academics, projects, skills, certifications, coding evidence, interests, subjective career goals) using the standard PATHFORGE collection template.
2. **Assessment Administration:** Students complete the 20-question PATHFORGE Assessment (v1) via a standardized digital form. Responses must strictly adhere to the 1-5 Likert scale.
3. **Student Preference Collection:** Before viewing any algorithmic recommendations, the student submits their current `student_preference`.
4. **Expert Annotation (The Ground Truth):** A panel of blinded human career counselors reviews the student's complete profile and assessment (without seeing the algorithm's recommendation) and assigns the top 3 most suitable careers from the 60-career catalog (`career_suitability`).

## 5. Dataset Curation and Splits
- **Exclusion Criteria:** 
  - Profiles with >10% missing fields.
  - Profiles with straight-line variance in assessment (e.g., all 3s or all 5s).
- **Missing Data Handling:** Categorical nulls marked as "Unknown". Numeric nulls imputed to 0.
- **Held-Out Testing (Fixed Seeds):**
  - **TRAIN (70%):** Used for baseline ML models.
  - **VALIDATION (15%):** Used for tuning the PATHFORGE fusion ratio and baseline hyperparameters.
  - **TEST (15%):** Strictly held-out. Algorithms only predict on this split once.

## 6. Evaluation Protocol
- **PATHFORGE Configurations:** Profile-only, Assessment-only, and Fusion.
- **Statistical Tests:** paired t-tests or Wilcoxon signed-rank tests across the TEST set to determine if the Fusion model's metrics are statistically significantly better ($p < 0.05$) than Profile-only.
- **Metrics Evaluated against `career_suitability`:**
  - Ranking: MRR, NDCG@5
  - Top-K: Top-1, Top-3, Top-5 Accuracy
  - Classification: Macro F1, Precision, Recall
