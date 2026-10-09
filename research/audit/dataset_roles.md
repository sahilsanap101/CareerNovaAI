# PATHFORGE Dataset Roles

To ensure a strict, reproducible research protocol for the IEEE submission, the following dataset roles have been explicitly defined:

## 1. Production Knowledge Base
**Files:**
- `research/data/production/career_catalog_pathforge_60_careers_2026.csv`
- `research/data/production/career_skill_dataset_60_careers_2026.csv`
- `research/data/production/skill_catalog_pathforge_2026.csv`
- `research/data/production/complete_personalized_roadmaps_careers_1_60.json`
**Role:**
The canonical, master source of truth for the recommendation system. All algorithms (topological graphs, dimension mapping) use these exact 60 careers and their verified skill requirements as the core constraint space.

## 2. Controlled Synthetic Development/Evaluation Dataset
**Files:**
- `research/data/evaluation/student_dataset_500_minimal.csv`
**Role:**
Used exclusively for baseline testing, system calibration, and algorithm evaluation (e.g., computing NDCG, Recall). Contains synthetic students with the full 7-dimensional profile and the 20 assessment fields. The target label `preferred_career` is provided here for metrics calculation, but must be masked during model inference to prevent target leakage.

## 3. Real Student Collection Template
**Files:**
- `research/data/collection/student_data_collection_template_500_v2.csv` (and original)
**Role:**
A schema-enforced, empty collection template containing the exact required structural features (including all 7 dimensions and 20 assessment fields). Distributed to real-world participants to collect live cohort data that identically matches the expected input vector of the production system.

## 4. Future Real-Student Evaluation Dataset
**Files:** (To be generated from the collection template)
**Role:**
Once the data collection template is populated by actual students, it will serve as the true hold-out test set for the closed-loop system, providing real-world validation of the baseline results against actual human trajectories and noisy responses.

## 5. Frozen 15-Career Evaluation Subset
**Files:**
- `research/data/evaluation/career_evaluation_15.csv`
- `research/data/evaluation/career_skill_evaluation_15_corrected.csv` (and original)
**Role:**
A controlled, frozen subset of 15 specific careers utilized during model ablation and benchmark comparisons. It allows for computationally cheaper, reproducible metric generation on a fixed subgraph before running full 60-career integration testing.
