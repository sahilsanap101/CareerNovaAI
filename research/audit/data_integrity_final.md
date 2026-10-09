# Data Integrity Final Report

This report outlines the structural dataset fixes, leakage evaluations, and integrity checks performed for the PATHFORGE IEEE submission.

## A. What is correct
- The **7-Dimensional Profile** is fully represented in the evaluation dataset (Skills, Interests, Projects, Academics, Certifications, Coding Experience, Career Goals).
- The 15-career evaluation catalog is a strict, valid subset of the 60-career production catalog.
- The datasets are clean from structural null errors that would crash the mathematical rankers.

## B. What is inconsistent
- **Career-Skill Evaluation Mappings:** The original `career_skill_evaluation_15.csv` contained 25 career-skill mappings (e.g., C14-AWS, C01-DSA) that did not exist in the canonical 60-career production system. This has been corrected by extracting the canonical mapping to `career_skill_evaluation_15_corrected.csv`.
- **Collection Template Schema:** The original `student_data_collection_template_500.csv` lacked the 20 assessment fields required by the architecture. This was fixed in `_v2.csv`.

## C. What is leakage
- **Target Feature Leakage:** The `preferred_career` column in `student_dataset_500_minimal.csv` is the direct ground-truth label. If this column is exposed to the recommendation system during inference, it directly leaks the target.
- **Train/Test Contamination (Hold-out Risk):** The 15-career evaluation subset is entirely contained within the 60-career production catalog. Evaluating over these 15 careers is an **in-distribution** ranking test. If zero-shot generalization is claimed in the paper, it is a leakage vector, because the model inherently knows the definitions of these careers.

## D. What is not actually leakage
- **`career_goal` Column:** While highly correlated with the target, the `career_goal` feature in the student dataset is a generalized text descriptor (e.g., "Build secure systems..."), not an exact match to the `preferred_career` label (e.g., "Cybersecurity Engineer"). It is a valid feature of the 7-dimensional profile and is safe for inference.
- **`aliases` in Skill Catalog:** The skill catalog `aliases` field is highly sparse (260/270 missing), but inspecting the codebase reveals that aliases are used solely for unstructured text extraction (e.g., `resumeMatcher.service.ts`) and are **not required** for the core recommendation or topological skill gap algorithms, which operate on canonical skill vectors.

## E. What must be fixed
- Use `career_skill_evaluation_15_corrected.csv` as the evaluation subgraph instead of the original, guaranteeing consistency with the production knowledge base.
- Drop `preferred_career` strictly before passing feature vectors to the baseline recommenders (B0-B4) for ranking.
- Adopt `student_data_collection_template_500_v2.csv` for any ongoing real-world data collection to ensure the 20 assessment features are recorded.

## F. What must not be changed
- **Do not populate missing `aliases`** with synthetic or LLM-generated data, as it is completely unnecessary for the core pipeline and risks introducing hallucinated term overlaps.
- **Do not modify the 60-career production dataset.** It is the canonical foundation. Any discrepancies found in smaller subsets should be corrected to align with this master set.
- **Do not remove `career_goal`** from the features, as it legitimately belongs to the declared profile dimensions.

## G. Exact next experiment to run
Run the **Baseline Ablation Evaluation** (B0 through B4) strictly utilizing:
1. Input Features: `student_dataset_500_minimal.csv` (with `preferred_career` stripped prior to inference).
2. Canonical Knowledge: The frozen 60-career production catalog.
3. Metric Computation: Compute Recall@1 and NDCG exclusively against the ground-truth target without any prior data leakage.
