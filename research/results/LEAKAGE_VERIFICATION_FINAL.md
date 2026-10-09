# LEAKAGE VERIFICATION

- target career is not used as an input feature: **PASS** (Masked in Python and TS scripts)
- career_preference is not used as an input feature: **PASS**
- careerGoals.targetRole is not used during prediction: **PASS** (Explicitly set to empty string)
- no feature is derived from the target label: **FAIL** (The dataset is synthetic; skills were procedurally generated from the career_preference. ML baselines easily achieve high accuracy because of this procedural generation.)
- no test-set information is used during feature selection: **PASS**
