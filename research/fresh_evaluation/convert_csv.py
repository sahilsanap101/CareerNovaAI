import json
import pandas as pd
import os

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
eval_dir = os.path.join(base_dir, "research/fresh_evaluation")

with open(os.path.join(eval_dir, "06_test_predictions.json"), "r") as f:
    preds = json.load(f)

csv_records = []
for p in preds:
    r = {
        "student_id": p["student_id"],
        "ground_truth": p["ground_truth"],
        "profile_scores": json.dumps(p["profile_scores"]),
        "assessment_scores": json.dumps(p["assessment_scores"]),
        "fusion_scores": json.dumps(p["fusion_scores"]),
        "ablations": json.dumps(p["ablations"])
    }
    csv_records.append(r)

df = pd.DataFrame(csv_records)
df.to_csv(os.path.join(eval_dir, "06_test_predictions.csv"), index=False)
print("Saved 06_test_predictions.csv")
