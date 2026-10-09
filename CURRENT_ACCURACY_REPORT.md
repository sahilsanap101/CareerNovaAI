# Career Recommendation Engine Accuracy Report

## Overview
As requested, I performed a fresh evaluation of the **current** recommendation logic (`RecommendationEngineService`) located in `apps/api/src/modules/careers/services/recommendationEngine.service.ts` from scratch, explicitly avoiding old results and dead evaluation scripts.

To do this, I wrote a custom testing script (`evaluate_current_model.ts`) that initializes the current `CareerKnowledgeService` and evaluates the engine against the 500-student ground truth dataset (`student_dataset_500_development.csv`).

## Accuracy Results

I ran the evaluation in two modes: **Biased** (including the target career in the goal alignment feature) and **Unbiased** (purely evaluating based on skills, academics, and projects without explicitly telling the engine the target role). 

The results indicate that the current core logic performs **very poorly** on this dataset.

### 1. Unbiased Evaluation (Pure Skill/Profile Match)
When evaluating the student purely based on their competencies, academics, and projects (excluding their explicit `career_preference` from the inputs):
- **Total Evaluated:** 500 profiles
- **Top-1 Accuracy:** 0.60%
- **Top-3 Accuracy:** 2.20%
- **Top-5 Accuracy:** 5.00%
- **Mean Reciprocal Rank (MRR):** 5.19%

### 2. Biased Evaluation (Goal Alignment Included)
When the student's `career_preference` is explicitly fed into the engine as their `careerGoals.targetRole` (triggering the `goalScore` boost in the engine):
- **Total Evaluated:** 500 profiles
- **Top-1 Accuracy:** 17.40%
- **Top-3 Accuracy:** 22.00%
- **Top-5 Accuracy:** 26.00%
- **Mean Reciprocal Rank (MRR):** 24.21%

## Analysis of Poor Performance
1. **Target Feature Reliance:** Even when explicitly passing the target career to the engine (granting it an instant 100/100 for the `goalScore` category), the top-1 accuracy only reaches 17.4%. This implies the other weighted features (Skill, Projects, Academics) heavily dilute the final score, allowing other careers to outrank the preferred one.
2. **String Mismatches:** The target careers in the dataset (e.g., `QA/Automation Engineer`) may not map perfectly to the 60 strict career strings loaded by the `CareerKnowledgeService`, causing automatic misses.
3. **Weighting Dilution:** The engine's formula normalizes weights across 7 different features (`w_skill`, `w_interest`, `w_academic`, `w_project`, `w_cert`, `w_coding`, `w_goal`). The sheer number of dimensions means that minor variations in generic skills (like basic programming) can push irrelevant careers to the top.

*(Note: The `CombinedRecommendationService` (Assessment 30% / Profile 70%) could not be tested as the CSV dataset does not include Assessment scores. The test solely evaluated the core Profile Recommendation Engine).*
