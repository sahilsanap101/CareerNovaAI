import pandas as pd
import json
import os
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
os.makedirs(f"{base_dir}/research/audit", exist_ok=True)

# -----------------
# Task 2
# -----------------
eval_careers = pd.read_csv(f"{base_dir}/research/data/evaluation/career_evaluation_15.csv")
eval_skills = pd.read_csv(f"{base_dir}/research/data/evaluation/career_skill_evaluation_15.csv")
prod_careers = pd.read_csv(f"{base_dir}/research/data/production/career_catalog_pathforge_60_careers_2026.csv")
prod_skills = pd.read_csv(f"{base_dir}/research/data/production/career_skill_dataset_60_careers_2026.csv")

eval_c_ids = set(eval_careers['career_id'])
prod_c_ids = set(prod_careers['career_id'])

report_t2 = ["# Career Evaluation Consistency Report\n"]
report_t2.append(f"Are all 15 eval careers in production? {eval_c_ids.issubset(prod_c_ids)}\n")

eval_map = set(zip(eval_skills['career_id'], eval_skills['skill']))
prod_map = set(zip(prod_skills['career_id'], prod_skills['skill']))

missing_in_prod = eval_map - prod_map
if missing_in_prod:
    report_t2.append("## Inconsistent Career-Skill Mappings\n")
    report_t2.append("The following evaluation mappings are NOT in production:\n")
    for cid, sk in missing_in_prod:
        report_t2.append(f"- Career: {cid}, Skill: {sk}\n")

# Regenerate mapping using canonical production mapping
corrected_eval_skills = prod_skills[prod_skills['career_id'].isin(eval_c_ids)].copy()
# Save corrected evaluation mapping
corrected_eval_skills.to_csv(f"{base_dir}/research/data/evaluation/career_skill_evaluation_15_corrected.csv", index=False)
report_t2.append("\nRegenerated canonical evaluation mapping saved to `research/data/evaluation/career_skill_evaluation_15_corrected.csv`.")

with open(f"{base_dir}/research/audit/career_evaluation_consistency_report.md", "w", encoding="utf-8") as f:
    f.writelines(report_t2)

# -----------------
# Task 3
# -----------------
students = pd.read_csv(f"{base_dir}/research/data/evaluation/student_dataset_500_minimal.csv")

report_t3 = ["# Target Leakage Report\n"]
report_t3.append("## Target Field\n")
report_t3.append("- `preferred_career`: The explicit target ground truth.\n\n")

report_t3.append("## Field Inspections\n")
# Check if career_goal leaks preferred_career
matches = (students['career_goal'] == students['preferred_career']).sum()
total = len(students)
report_t3.append(f"**career_goal vs preferred_career**: {matches} exact matches out of {total} rows.\n")
if matches > 0:
    report_t3.append("⚠️ **Potential Target Leakage**: `career_goal` has exact string overlap with the target `preferred_career`. If included as an input feature during evaluation inference, the model can explicitly cheat by reading the target. This column should be masked or dropped during inference to ensure a clean evaluation protocol, though it belongs to the 7-dimensional profile.\n")

report_t3.append("\n**Other fields**:\n- `skills`, `interests`, `coding_evidence`, `projects_count` are standard feature vector elements and do not explicitly encode the target label, although they are highly correlated (which is intended for the recommendation system to learn).\n")

with open(f"{base_dir}/research/audit/target_leakage_report.md", "w", encoding="utf-8") as f:
    f.writelines(report_t3)

# -----------------
# Task 4
# -----------------
collection = pd.read_csv(f"{base_dir}/research/data/collection/student_data_collection_template_500.csv")
for i in range(1, 21):
    col = f"assessment_q{i:02d}"
    if col not in collection.columns:
        collection[col] = "" # empty column

collection.to_csv(f"{base_dir}/research/data/collection/student_data_collection_template_500_v2.csv", index=False)

print("Done with T2, T3, T4 scripts.")
