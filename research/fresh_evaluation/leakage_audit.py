import json
import pandas as pd
import os

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
dataset_paths = [
    os.path.join(base_dir, "research/fresh_evaluation/data/dataset_A_profile_dominant.csv"),
    os.path.join(base_dir, "research/fresh_evaluation/data/dataset_B_complementary.csv"),
    os.path.join(base_dir, "research/fresh_evaluation/data/dataset_C_assessment_dominant.csv")
]

audit_results = {
    "status": "PASS",
    "checks": []
}

for path in dataset_paths:
    if not os.path.exists(path):
        continue
        
    df = pd.read_csv(path)
    
    # Check 1: target career never used as input feature
    target_in_profile = df.apply(lambda row: row['career_suitability'] in row['profile_json'], axis=1).sum()
    audit_results["checks"].append({
        "dataset": os.path.basename(path),
        "check_name": "target_career_in_profile",
        "passed": int(target_in_profile) == 0,
        "violations": int(target_in_profile)
    })
    
    # Check 2: preferred career excluded from model inputs (it's not in profile_json)
    pref_in_profile = df.apply(lambda row: row['student_preference'] in row['profile_json'], axis=1).sum()
    audit_results["checks"].append({
        "dataset": os.path.basename(path),
        "check_name": "preferred_career_in_profile",
        "passed": int(pref_in_profile) == 0,
        "violations": int(pref_in_profile)
    })

    if target_in_profile > 0 or pref_in_profile > 0:
        audit_results["status"] = "FAIL"

out_path = os.path.join(base_dir, "research/fresh_evaluation/04_leakage_audit.json")
with open(out_path, "w") as f:
    json.dump(audit_results, f, indent=4)
print(f"Leakage audit saved to {out_path}")
