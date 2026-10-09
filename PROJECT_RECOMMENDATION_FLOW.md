# PATHFORGE Recommendation Flow

The following diagram and description represent the **CURRENT end-to-end recommendation pipeline** as implemented in `recommendationEngine.service.ts` and `run_fresh_inference.ts`.

## Pipeline Diagram

```text
[ STUDENT INPUT DATA ]
         │
         ▼
[ PROFILE SCORE (70%) ]──────────────────────────────────┐
  │                                                      │
  ├─> 1. Skills (35%)                                    │
  │   - Check student proficiency vs required            │
  │   - Core (w=10), Important (w=7), Other (w=4)        │
  │                                                      │
  ├─> 2. Interests (20%)                                 │
  │   - Count exact matching interest IDs                │
  │                                                      │
  ├─> 3. Projects (15%)                                  │
  │   - Match project tech stack with career skills      │
  │                                                      │
  ├─> 4. Academics (10%)                                 │
  │   - Score CGPA brackets & Core Branch match          │
  │                                                      │
  ├─> 5. Certifications (10%)                            │
  │   - Text match certification title with career skills│
  │                                                      │
  ├─> 6. Coding Evidence (5%)                            │
  │   - Score based on problems solved                   │
  │                                                      │
  └─> 7. Career Goals (5%)                               │
      - Text match target role/industry                  │
                                                         │
                                                         │
[ ASSESSMENT SCORE (30%) ]───────────────────────────────┤
  │                                                      │
  └─> 1. Answer 20 Likert-Scale questions                │
      2. Map answers to predefined career weights        │
      3. Compute: (Raw Score / Max Possible) * 100       │
         *** BUG DETECTED: Assessment evaluates to 0 *** │
                                                         │
                                                         ▼
                                            [ FUSION & RANKING ]
                                              (Profile * 0.70)
                                                     +
                                            (Assessment * 0.30)
                                                     │
                                                     ▼
                                            [ FINAL RANKED LIST ]
                                              (Top-1, Top-3, Top-5)
```

## Description of Execution Path

1. **`run_fresh_inference.ts` Initialization:**
   - Reads `test_inputs.json`.
   - Parses the JSON profile string into a `StudentRecommendationProfile` object.
   
2. **Profile Evaluation (`RecommendationEngineService`):**
   - Fetches the 15 controlled careers from `CareerKnowledgeService`.
   - Dynamically scales the 7 core feature weights based on the student's `yearStage` (Exploratory vs. Placement Ready).
   - Iterates over each career, evaluating the 7 feature categories.
   - Summarizes the individual component scores into a `finalScore` (0-100).
   - *Note on Ablations*: The ablation routine simply passes `0` for the designated weight to `RecommendationEngineService`.

3. **Assessment Evaluation (`run_fresh_inference.ts`):**
   - Iterates through `assessment_q01` to `assessment_q20`.
   - Attempts to match `qId: "Q1"` against the `career_assessment_questions_v1.json` which uses `question_id: "Q01"`. 
   - Attempts to read `qDef.options` which does not exist in the JSON schema.
   - Calculates a score of `0` for all 15 careers due to this schema/mapping mismatch.

4. **Fusion (`run_fresh_inference.ts`):**
   - Applies the 70:30 fusion formula: `fusionMap.set(careerName, pScore * 0.70 + aScore * 0.30)`.
   - Since `aScore` is inherently 0 for all classes, the fusion simply becomes a scaled version of the `Profile-only` score.

5. **Ranking:**
   - Evaluated careers are sorted in descending order of their final fused score.
   - Due to the assessment bug and synthetic data independence (uncorrelated latent generation), the recommendation ranks devolve into predicting noise, hovering strictly around random-chance (6.6%).
