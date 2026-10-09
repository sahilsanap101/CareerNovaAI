import json
import pandas as pd
import numpy as np
import os

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
dataset_paths = [
    os.path.join(base_dir, "research/fresh_evaluation/data/dataset_A_profile_dominant.csv"),
    os.path.join(base_dir, "research/fresh_evaluation/data/dataset_B_complementary.csv"),
    os.path.join(base_dir, "research/fresh_evaluation/data/dataset_C_assessment_dominant.csv")
]

dfs = []
for p in dataset_paths:
    if os.path.exists(p):
        df = pd.read_csv(p)
        dfs.append(df)

full_df = pd.concat(dfs, ignore_index=True)
student_ids = full_df["student_id"].unique()

split_seed = 4242
np.random.seed(split_seed)
np.random.shuffle(student_ids)

n = len(student_ids)
train_end = int(n * 0.70)
val_end = int(n * 0.85)

train_ids = student_ids[:train_end]
val_ids = student_ids[train_end:val_end]
test_ids = student_ids[val_end:]

manifest = {
    "split_seed": split_seed,
    "total_students": n,
    "train_count": len(train_ids),
    "val_count": len(val_ids),
    "test_count": len(test_ids),
    "splits": {
        "TRAIN": train_ids.tolist(),
        "VALIDATION": val_ids.tolist(),
        "TEST": test_ids.tolist()
    },
    "class_distribution_test": full_df[full_df["student_id"].isin(test_ids)]["career_suitability"].value_counts().to_dict()
}

out_path = os.path.join(base_dir, "research/fresh_evaluation/05_split_manifest.json")
with open(out_path, "w") as f:
    json.dump(manifest, f, indent=4)
print(f"Split manifest saved to {out_path}")
