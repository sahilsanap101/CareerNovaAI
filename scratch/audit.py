import pandas as pd
import json
import os
import io
import sys

# Ensure print to console with utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

files = {
    "student_collection": "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/data/collection/student_data_collection_template_500.csv",
    "career_eval_15": "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/data/evaluation/career_evaluation_15.csv",
    "career_skill_eval_15": "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/data/evaluation/career_skill_evaluation_15.csv",
    "student_eval_500": "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/data/evaluation/student_dataset_500_minimal.csv",
    "career_prod_60": "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/data/production/career_catalog_pathforge_60_careers_2026.csv",
    "career_skill_prod_60": "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/data/production/career_skill_dataset_60_careers_2026.csv",
    "skill_prod_60": "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/data/production/skill_catalog_pathforge_2026.csv",
    "roadmaps_json": "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/data/production/complete_personalized_roadmaps_careers_1_60.json"
}

dataframes = {}
for name, path in files.items():
    if not os.path.exists(path):
        print(f"NOT FOUND: {path}")
        continue
    if path.endswith('.csv'):
        df = pd.read_csv(path)
        dataframes[name] = df
        
print("--- SUBSET CHECKS ---")
if 'career_eval_15' in dataframes and 'career_prod_60' in dataframes:
    c15 = set(dataframes['career_eval_15']['career_id'])
    c60 = set(dataframes['career_prod_60']['career_id'])
    print(f"c15 is subset of c60: {c15.issubset(c60)}")
    
if 'career_skill_eval_15' in dataframes and 'career_skill_prod_60' in dataframes:
    cs15 = set(zip(dataframes['career_skill_eval_15']['career_id'], dataframes['career_skill_eval_15']['skill']))
    cs60 = set(zip(dataframes['career_skill_prod_60']['career_id'], dataframes['career_skill_prod_60']['skill']))
    print(f"cs15 is subset of cs60: {cs15.issubset(cs60)}")
    print(f"Diff (cs15 - cs60): {cs15 - cs60}")

print("--- STUDENT FEATURES ---")
col_cols = set(dataframes.get('student_collection', pd.DataFrame()).columns)
eval_cols = set(dataframes.get('student_eval_500', pd.DataFrame()).columns)
print("student_collection cols:", list(col_cols))
print("student_eval_500 cols:", list(eval_cols))

# Check for 20 assessment fields
print("\nHas 20 assessment fields in student_collection?", len([c for c in col_cols if 'assessment' in c.lower()]) >= 20)
print("Has 20 assessment fields in student_eval_500?", len([c for c in eval_cols if 'assessment' in c.lower()]) >= 20)
