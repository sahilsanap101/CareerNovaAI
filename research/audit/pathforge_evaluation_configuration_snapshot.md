# PATHFORGE Evaluation Configuration Snapshot

This document snapshots the authoritative PATHFORGE scoring configurations used to audit alignment against the `synthetic_v2` benchmark.

## 1. Profile Scoring Model P(u,c)
The Profile scoring engine (`RecommendationEngineService.ts`) calculates $P(u,c)$ as a weighted sum of matching indicators across seven dimensions.
**Profile Weights:**
- SKILLS: 0.35
- INTERESTS: 0.20
- ACADEMIC: 0.15
- PROJECTS: 0.10
- CERTIFICATIONS: 0.05
- CODING: 0.10
- GOALS: 0.05
*Note: Due to `synthetic_v2` using abstract latent profiles (`profile_dim_1` to `7`), the TS parser cannot natively load these continuous vectors as traditional JSON schema arrays. The alignment audit reflects this structural mismatch.*

## 2. Assessment Scoring Model Q(u,c)
The Assessment engine (`AssessmentService.ts`) calculates $Q(u,c)$ using **Assessment Specification v1**.
- **Inputs:** `assessment_q01` through `assessment_q20` on a 1-5 Likert scale.
- **Normalization:** Min-Max normalized based on theoretical maximum per career.
- **Weights:** Loaded from `research/data/collection/career_assessment_weight_matrix_v1.json`.

## 3. Fusion Model
**Final Score** = $0.70 \times P(u,c) + 0.30 \times Q(u,c)$
