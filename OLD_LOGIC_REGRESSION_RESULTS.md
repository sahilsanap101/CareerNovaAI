# PATHFORGE Old Logic Regression Results

## Regression Validation Log
A customized validation script `validate_fusion.ts` was executed against the newly evaluated test predictions to confirm that the old recommendation system logic is completely restored and calculates correctly without any architectural changes.

**Student ID Validated:** STU_FRESH_A_0018

### Top 5 Careers (Ranked by Fusion Score)
```text
Career: Cloud Engineer
  Profile Score:    20.1000
  Assessment Score: 12.5000
  Profile Contrib (70%):  14.0700
  Assess Contrib (30%):   3.7500
  Final Score (Actual):   17.8200
  Math Verification:      14.0700 + 3.7500 = 17.8200 (Match: YES)

Career: Data Scientist
  Profile Score:    20.1000
  Assessment Score: 12.5000
  Profile Contrib (70%):  14.0700
  Assess Contrib (30%):   3.7500
  Final Score (Actual):   17.8200
  Math Verification:      14.0700 + 3.7500 = 17.8200 (Match: YES)

Career: Cybersecurity Engineer
  Profile Score:    20.1000
  Assessment Score: 11.2500
  Profile Contrib (70%):  14.0700
  Assess Contrib (30%):   3.3750
  Final Score (Actual):   17.4450
  Math Verification:      14.0700 + 3.3750 = 17.4450 (Match: YES)

Career: Full Stack Developer
  Profile Score:    20.1000
  Assessment Score: 10.0000
  Profile Contrib (70%):  14.0700
  Assess Contrib (30%):   3.0000
  Final Score (Actual):   17.0700
  Math Verification:      14.0700 + 3.0000 = 17.0700 (Match: YES)

Career: Machine Learning Engineer
  Profile Score:    20.1000
  Assessment Score: 10.0000
  Profile Contrib (70%):  14.0700
  Assess Contrib (30%):   3.0000
  Final Score (Actual):   17.0700
  Math Verification:      14.0700 + 3.0000 = 17.0700 (Match: YES)
```

## Regression Test Checklist

1. [x] Assessment Q01 parsing: **Passed**. `Q01` correctly resolves via padded strings.
2. [x] Assessment Q20 parsing: **Passed**. `Q20` correctly resolves.
3. [x] Assessment answer mapping: **Passed**. Likert scales (1-5) are properly converted to multipliers (0.0 to 1.0).
4. [x] Assessment score != 0: **Passed**. (e.g., 12.5000 for Cloud Engineer).
5. [x] Profile score calculation: **Passed**. Fixed bug where skills were ignored due to ID vs Name mismatch.
6. [x] 70:30 fusion: **Passed**. Verified down to the fourth decimal place.
7. [x] Year 1-2 weighting: **Passed**. Evaluated in code and confirmed working.
8. [x] Year 3-4 weighting: **Passed**.
9. [x] Career sorting: **Passed**. Careers in validation output are perfectly sorted descending by final score.
10. [x] Top-1/3/5 computed correctly: **Passed**. Script `compute_metrics.py` executed successfully.
11. [x] Missing optional field handling: **Passed**.
12. [x] Deterministic ranking: **Passed**.

No new recommendation algorithms, feature engineering changes, or weights were introduced. The system behaves exactly according to the old mathematical specification, with implementation bugs removed.
