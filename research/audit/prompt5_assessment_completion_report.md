# PATHFORGE Assessment Completion Report (Prompt 5)

## A. Original Assessment Implementation State
As documented in `research/audit/original_assessment_state.md`, while the database schema and normalization/fusion logic existed in the codebase, the explicit 20 Likert-scale questions mapped definitively to the 15 evaluation careers were missing from the implementation configuration. Therefore, the assessment mapping did not exist in a reproducible format.

## B. Newly Specified 20 Questions
I designed 20 distinct questions perfectly aligned with the PATHFORGE conceptual methodology:
- Questions 1-4 cover **work and role preferences**
- Questions 5-8 cover **problem-solving and learning preferences**
- Questions 9-12 cover **technology and domain interests**
- Questions 13-16 cover **work style**
- Questions 17-20 cover **career direction**

Each question utilizes a consistent 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree). Questions are intentionally conceptually broad and do not leak the explicit target label (e.g., asking about scaling cloud instances instead of "Do you want to be a Cloud Engineer").

## C. Weight Matrix
A deterministic weight matrix was constructed mapping the 20 questions to the exact 15 careers used in evaluation. Weights were generated purely theoretically based on the underlying construct, explicitly devoid of any signal extraction from `preferred_career` or tuning on the synthetic `student_dataset_500_minimal.csv`.

## D. Design Rationale
Documented in `research/audit/assessment_design_v1.md`. Every question targets specific subsets of careers (e.g., "automated scripts for deployments" targets DevOps and Cloud Engineer) without exposing the literal career title.

## E. Exact Scoring Formula
Documented in `research/audit/assessment_scoring_v1.md`. It formally defines $Q(u,c)$, $A(u,c)$, and $Amax(c)$, including Likert response mappings and robust handling for un-answered questions to ensure the theoretical maximum denominator stays proportional.

## F. Configuration Files
The exact reproducible structures generated are:
- `research/data/collection/career_assessment_questions_v1.json` (and `.csv`)
- `research/data/collection/career_assessment_weight_matrix_v1.json` (and `.csv`)

## G. Unit-Test Results
Documented in `research/audit/assessment_unit_test_report.md`. A clean sweep of 8/8 tests verified that response encoding, multi-question aggregation, dynamic theoretical maximum bounding, ranking sorting, and 70:30 fusion behaved exactly as formulated by the original backend implementation logic.

## H. Changes Made to the Application
The `getQuestions()` function inside `apps/api/src/modules/profile/services/assessment.service.ts` was refactored. It no longer attempts to seed or read from an empty/unpopulated database table. Instead, it reads directly from `career_assessment_questions_v1.json`, mapping the Likert responses (1-5) and normalized weights to the application's internal structure. No underlying mathematical logic was altered.

## I. Assumptions Introduced
- **Linear Likert Scaling:** We assume a linear progression for Likert weights: Strongly Disagree (0.0), Disagree (0.25), Neutral (0.50), Agree (0.75), Strongly Agree (1.0).
- **Static Base Contribution:** Every question contributes equally at its base.

## J. Explicit Specification Statement
**This is a new versioned assessment specification.** Since the original question-to-career mappings were absent from the repository, this acts as the explicit, versioned, transparent baseline: **PATHFORGE Assessment Specification v1**. It must not be cited as the historical ground truth of the application, but rather as the standardized evaluation proxy.

## K. Exact Files for Future P2 Evaluation
When calculating the full P2 (70:30 Hybrid Recommendation) pipeline, you must use:
1. `research/audit/recommendation_weights_exact.json`
2. `research/audit/academic_stage_multipliers_exact.csv`
3. `research/data/collection/career_assessment_questions_v1.json`
4. `research/data/collection/career_assessment_weight_matrix_v1.json`
