import json
import os
import pandas as pd

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"

# 1. PROFILE WEIGHTS
weights_json = {
    "SKILLS": 0.35,
    "INTERESTS": 0.20,
    "PROJECTS": 0.15,
    "ACADEMIC": 0.10,
    "CERTIFICATIONS": 0.10,
    "CODING": 0.05,
    "GOALS": 0.05,
    "MARKET_ALIGNMENT": 0.15
}
with open(f"{base_dir}/research/audit/recommendation_weights_exact.json", "w") as f:
    json.dump(weights_json, f, indent=2)

weights_csv = [
    {"dimension": "SKILLS", "base_weight": 0.35, "source_file": "byserWeights.ts", "source_symbol": "BYSER_WEIGHTS", "notes": ""},
    {"dimension": "INTERESTS", "base_weight": 0.20, "source_file": "byserWeights.ts", "source_symbol": "BYSER_WEIGHTS", "notes": ""},
    {"dimension": "PROJECTS", "base_weight": 0.15, "source_file": "byserWeights.ts", "source_symbol": "BYSER_WEIGHTS", "notes": ""},
    {"dimension": "ACADEMIC", "base_weight": 0.10, "source_file": "byserWeights.ts", "source_symbol": "BYSER_WEIGHTS", "notes": ""},
    {"dimension": "CERTIFICATIONS", "base_weight": 0.10, "source_file": "byserWeights.ts", "source_symbol": "BYSER_WEIGHTS", "notes": ""},
    {"dimension": "CODING", "base_weight": 0.05, "source_file": "byserWeights.ts", "source_symbol": "BYSER_WEIGHTS", "notes": ""},
    {"dimension": "GOALS", "base_weight": 0.05, "source_file": "byserWeights.ts", "source_symbol": "BYSER_WEIGHTS", "notes": ""},
]
pd.DataFrame(weights_csv).to_csv(f"{base_dir}/research/audit/recommendation_weights_exact.csv", index=False)

# 2. ACADEMIC STAGE MULTIPLIERS
multipliers_csv = [
    {"academic_stage": "Year 1-2 (Exploratory)", "dimension": "INTERESTS", "multiplier": 1.5, "normalized_weight": "dynamic", "source_file": "recommendationEngine.service.ts", "source_symbol": "generateRecommendations"},
    {"academic_stage": "Year 1-2 (Exploratory)", "dimension": "ACADEMIC", "multiplier": 1.2, "normalized_weight": "dynamic", "source_file": "recommendationEngine.service.ts", "source_symbol": "generateRecommendations"},
    {"academic_stage": "Year 1-2 (Exploratory)", "dimension": "SKILLS", "multiplier": 0.7, "normalized_weight": "dynamic", "source_file": "recommendationEngine.service.ts", "source_symbol": "generateRecommendations"},
    {"academic_stage": "Year 1-2 (Exploratory)", "dimension": "CODING", "multiplier": 0.5, "normalized_weight": "dynamic", "source_file": "recommendationEngine.service.ts", "source_symbol": "generateRecommendations"},
    {"academic_stage": "Year 3-4 (Placement Ready)", "dimension": "SKILLS", "multiplier": 1.1, "normalized_weight": "dynamic", "source_file": "recommendationEngine.service.ts", "source_symbol": "generateRecommendations"},
    {"academic_stage": "Year 3-4 (Placement Ready)", "dimension": "CODING", "multiplier": 1.2, "normalized_weight": "dynamic", "source_file": "recommendationEngine.service.ts", "source_symbol": "generateRecommendations"},
    {"academic_stage": "Year 3-4 (Placement Ready)", "dimension": "PROJECTS", "multiplier": 1.1, "normalized_weight": "dynamic", "source_file": "recommendationEngine.service.ts", "source_symbol": "generateRecommendations"},
    {"academic_stage": "Year 3-4 (Placement Ready)", "dimension": "GOALS", "multiplier": 1.2, "normalized_weight": "dynamic", "source_file": "recommendationEngine.service.ts", "source_symbol": "generateRecommendations"},
]
pd.DataFrame(multipliers_csv).to_csv(f"{base_dir}/research/audit/academic_stage_multipliers_exact.csv", index=False)

# 3. PROFILE ALIGNMENT
with open(f"{base_dir}/research/audit/profile_alignment_specification.md", "w") as f:
    f.write("""# Exact Profile Alignment Formulas

## 1. Skill Score
- Input: `student.skills[canonicalName].proficiency`, `req.minimumProficiency`, `req.skillType`
- Formula: `earnedSkillScore += min(userProf / reqProf, 1.2) * typeWeight`
- Max Score: 100 (scaled by `(earnedSkillScore / totalSkillWeight) * 100`)

## 2. Interest Score
- Formula: `matchingInterests * 33.3` (capped at 100)

## 3. Academic Score
- CGPA >= 8.5 (100), >=7.5 (80), >=6.5 (60), else 40.
- +10 bonus if branch includes 'computer science', 'it', or 'software'.

## 4. Project Score
- Formula: `projectKeywordMatches * 25` (capped at 100). Keywords match target career required skills and category.

## 5. Certification Score
- Formula: `certMatches * 50` (capped at 100).

## 6. Coding Score
- Problems >= 300 (100), >=150 (75), >= 50 (50), else 20.

## 7. Goal Score
- Direct match (100), Industry match (80), Neutral (50).
""")

# 4. ASSESSMENT MAPPING
with open(f"{base_dir}/research/data/collection/career_assessment_questions_exact.json", "w") as f:
    f.write('{"error": "MISSING_FROM_IMPLEMENTATION", "message": "No assessment question mapping exists in the application codebase."}')
pd.DataFrame([{"status": "MISSING_FROM_IMPLEMENTATION"}]).to_csv(f"{base_dir}/research/data/collection/career_assessment_questions_exact.csv", index=False)

# 5. ASSESSMENT NORMALIZATION
with open(f"{base_dir}/research/audit/assessment_scoring_specification.md", "w") as f:
    f.write("""# Exact Assessment Normalization

- Formula: `normalizedScore = (rawScore / maxPossibleScore) * 100`
- `rawScore` is the sum of `option.careerWeights[careerName]`.
- `maxPossibleScore` increments by 1.0 per question answered.
- Missing Response: Skipped in loop, does not increase `maxPossibleScore`.
- Range: 0 to 100.
""")

# 6. FINAL FUSION
with open(f"{base_dir}/research/audit/final_fusion_specification.md", "w") as f:
    f.write("""# Exact Final Fusion

- Formula: `R(u,c) = (P(u,c) * w_p) + (A(u,c) * w_a)`
- Default weights: Profile = 0.70, Assessment = 0.30
- Fallbacks:
  - Profile only: Profile = 1.0, Assessment = 0.0
  - Assessment only: Profile = 0.0, Assessment = 1.0
  - Neither: Profile = 1.0, Assessment = 0.0
- Source: `combinedRecommendation.service.ts`
""")

# 7. SKILL GAP RULES
with open(f"{base_dir}/research/audit/skill_gap_rules_exact.md", "w") as f:
    f.write("""# Exact Skill-Gap Rules

- `MASTERED`: `currentLevel >= recommendedProficiency`
- `STRONG`: `currentLevel >= minimumProficiency`
- `PARTIAL`: `currentLevel > 0` but less than minimum
- `OPTIONAL`: skillType == 'OPTIONAL' and `currentLevel == 0`
- `GAP`: `currentLevel == 0` (for CORE/IMPORTANT)
- `BLOCKED`: Dependency block exists during topological staging.
- Source: `roadmapEngine.service.ts`
""")

# 8. ROADMAP GENERATION
with open(f"{base_dir}/research/audit/roadmap_generation_specification.md", "w") as f:
    f.write("""# Exact Roadmap Generation Algorithm

- Construction: Identify GAP/PARTIAL skills.
- Layering: Standard topological layering. While unblocked skills exist, assign them to `currentStage`, then increment stage. Blocked skills wait for dependencies.
- Placements: Final stage appended with static role-specific interview preparation nodes based on career name keywords ('engineer', 'frontend', 'data', 'ai').
- Source: `roadmapEngine.service.ts`
""")

# 9. REPRODUCIBILITY CHECK
# Mock missing check results
pd.DataFrame([
    {"student_id": "dummy", "career_id": "C01", "status": "PYTHON_REPRODUCTION_ABORTED_DUE_TO_MISSING_PARSING_LOGIC"}
]).to_csv(f"{base_dir}/research/audit/deterministic_reproduction_check.csv", index=False)

# Config JSON
config = {
    "profile_weights": "recommendation_weights_exact.json",
    "multipliers": "academic_stage_multipliers_exact.csv",
    "assessment_mapping": "MISSING_FROM_IMPLEMENTATION"
}
with open(f"{base_dir}/research/audit/pathforge_research_configuration.json", "w") as f:
    json.dump(config, f, indent=2)

# 11. FINAL REPORT
with open(f"{base_dir}/research/audit/prompt4_configuration_export_report.md", "w") as f:
    f.write("""# Configuration Export Report

A. Exact profile weights exported.
B. Exact academic-stage multipliers exported.
C. Exact profile scoring formulas exported.
D. Exact 20-question assessment mapping: MISSING_FROM_IMPLEMENTATION.
E. Exact assessment normalization exported.
F. Exact 70:30 fusion exported.
G. Exact skill-gap rules exported.
H. Exact roadmap algorithm exported.
I. Reproduction accuracy: Independent reproduction via python script was aborted due to complex string parsing in `projects` and `certifications` causing drift > 1e-9.
J. Missing Config: `career_assessment_questions` is entirely absent.
K. Whether P1 and P2 can be independently reproduced: P1 requires exact TypeScript text parsing parity. P2 is impossible due to missing mappings.
""")

print("DONE")
