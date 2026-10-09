import pandas as pd
import json
import os

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
manifest_path = os.path.join(base_dir, "research/fresh_evaluation/05_split_manifest.json")
with open(manifest_path, "r") as f:
    manifest = json.load(f)

test_ids = set(manifest["splits"]["TEST"])
test_rows = []

for cond in ["A_profile_dominant", "B_complementary", "C_assessment_dominant"]:
    p = os.path.join(base_dir, f"research/fresh_evaluation/data/dataset_{cond}.csv")
    if os.path.exists(p):
        df = pd.read_csv(p)
        for _, row in df.iterrows():
            if row["student_id"] in test_ids:
                d = row.to_dict()
                d["profile_json"] = json.loads(d["profile_json"])
                test_rows.append(d)

out_path = os.path.join(base_dir, "research/fresh_evaluation/data/test_inputs.json")
with open(out_path, "w") as f:
    json.dump(test_rows, f, indent=4)
print(f"Saved {len(test_rows)} test inputs to {out_path}")
