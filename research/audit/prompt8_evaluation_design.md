# PATHFORGE Evaluation Design & Historical Audit (Prompt 8)

## 1. Freeze Current Results (Prompts 6 & 7)

**What Prompt 6 Established:**
- **FACT:** The existing TS codebase used an arbitrary, hardcoded DB seeding for assessment weights. Assessment Specification v1 was newly introduced, theoretically mapped, and unit-tested in isolation without dataset tuning.
- **EMPIRICAL OBSERVATION:** The deterministic fusion evaluation on `student_dataset_500_minimal.csv` using Assessment v1 and the 70:30 fusion ratio resulted in performance degradation (Top-1 0.074 to 0.032) relative to the Profile-only baseline.

**What Prompt 6 Did NOT Establish:**
- **UNRESOLVED:** It did not explain *why* the assessment degraded performance, nor whether the 70:30 ratio is inherently flawed, nor whether Assessment v1 is fundamentally incorrect.

**What Prompt 7 Established:**
- **FACT:** The generator script for `student_dataset_500_minimal.csv` is completely missing from the repository, rendering the original data generation rules opaque.
- **EMPIRICAL OBSERVATION:** The assessment features in the existing dataset hold massive predictive power for `preferred_career` independently (82.4% RF accuracy).

**What Prompt 7 Did NOT Establish:**
- **UNRESOLVED:** The exact mathematical formulation and random seed used to generate the dataset.

**Why the Existing Synthetic Benchmark Must Not Be Used:**
- **INFERENCE:** The dataset exhibits circular, target-conditioned generation. The target (`preferred_career`) was used to structurally determine the synthetic profile and assessment features (`assessment_q01`-`q20`). Therefore, testing a new, theoretically derived assessment matrix against structurally biased synthetic responses is invalid; it measures the gap between the new theory and the old hidden generation rules, not actual predictive efficacy.

## 2. Define Three Separate Concepts

To establish a scientifically sound benchmark, we must disambiguate:

1. **Student Preference (`student_preference`)**: The student's subjective, self-stated ideal career, which may be influenced by societal biases, salary expectations, or incomplete information.
2. **Career Suitability (`career_suitability`)**: An objective measure of how well a student's underlying aptitudes, intrinsic traits, and acquired skills align with a career's requirements. This is a latent target approximated by expert judgment.
3. **Recommended Career (`recommended_career`)**: The output predicted by the algorithmic recommendation engine (e.g., PATHFORGE).

*Note: In `synthetic_v2`, the target for validation will primarily be `career_suitability`, as the goal of PATHFORGE is to match students to suitable careers, not merely echo their subjective preferences (which may be misaligned).*

## 3. Multiple Controlled Conditions

The new benchmark evaluates fusion behavior across three known information structures:
- **Condition A (Profile-dominant):** The latent suitability signal is primarily encoded in the profile dimensions (skills, academics, projects). The assessment features are noisy or redundant.
- **Condition B (Balanced):** The profile and assessment dimensions contain orthogonal, complementary signals of equal magnitude regarding the latent suitability.
- **Condition C (Assessment-dominant):** The profile is generic/sparse. The latent suitability signal is primarily captured by the deep psychometric/interest traits generated in the assessment.

## 4. Evaluation of Fusion Ratios & Metrics

For each controlled condition, PATHFORGE will test fusion ratios (Profile:Assessment):
`100:0`, `80:20`, `70:30`, `60:40`, `50:50`, `40:60`, `30:70`, `20:80`, `0:100`.

**Evaluation Metrics:**
- **Ranking:** MRR, NDCG@5
- **Top-K Accuracy:** Top-1, Top-3, Top-5
- **Classification:** Macro Precision, Macro Recall, Macro F1
- **Granular:** Per-career F1 metrics

## 5. Pure Oracle Upper Bound

An Oracle model will be trained directly on the underlying `latent_preference_vector` before it is degraded into the observable `profile` and `assessment_responses`.
- **Purpose:** To estimate intrinsic benchmark difficulty and the maximum recoverable signal (Bayes error rate).
- **Assumption:** The Oracle has perfect, noise-free access to the generative causal root, representing the theoretical ceiling of any recommender on this specific dataset condition.

## 6. Held-Out Testing Protocol

All learned baselines must adhere to a strict evaluation protocol:
- **Splits:** 70% TRAIN, 15% VALIDATION, 15% TEST (fixed seed).
- **Tuning:** Hyperparameter tuning (including fusion ratio selection and feature weighting for learned models) must only utilize VALIDATION.
- **Evaluation:** TEST is strictly reserved for the single final evaluation run.

## 7. The Final Validation Experiment

The final experiment will compare:
1. PATHFORGE Profile-only
2. PATHFORGE Assessment-only
3. PATHFORGE Fusion (ratio tuned on VALIDATION)
4. Non-PATHFORGE Baseline 1: Random Forest Classifier (Multi-class)
5. Non-PATHFORGE Baseline 2: XGBoost Ranker or MLP Classifier
*Input constraints: No method will use `career_suitability` or `student_preference` as input features.*

## 8. Final Question Verdict

**"What evidence would be required before PATHFORGE could legitimately claim that assessment fusion improves career recommendation quality?"**

To legitimately claim assessment fusion improves recommendation quality, PATHFORGE requires two phases of evidence:

1. **Synthetic Evidence:** 
   - Statistically significant outperformance of the Fusion model over the Profile-only model on the **Condition B (Balanced)** and **Condition C (Assessment-dominant)** datasets of the `synthetic_v2` benchmark.
   - Proof that the fusion algorithm smoothly modulates weighting, gracefully decaying to Profile-only performance in **Condition A (Profile-dominant)** rather than degrading catastrophically.

2. **Real-World Evidence:**
   - Statistically significant improvement in predicting independent expert-annotated `career_suitability` (or student longitudinal career satisfaction) on a prospectively collected, real-world human dataset, evaluated under a strict Train/Val/Test held-out framework.
   - The Fusion model must demonstrably outperform both the Profile-only ablation and standard non-PATHFORGE ML baselines (e.g., XGBoost) on the unseen TEST set of the real student data.
