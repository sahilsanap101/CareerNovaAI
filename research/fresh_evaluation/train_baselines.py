import json
import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import precision_recall_fscore_support

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
eval_dir = os.path.join(base_dir, "research/fresh_evaluation")
manifest_path = os.path.join(eval_dir, "05_split_manifest.json")

with open(manifest_path, "r") as f:
    manifest = json.load(f)

# Load data
dfs = []
for cond in ["A_profile_dominant", "B_complementary", "C_assessment_dominant"]:
    p = os.path.join(eval_dir, f"data/dataset_{cond}.csv")
    if os.path.exists(p):
        dfs.append(pd.read_csv(p))

df = pd.concat(dfs, ignore_index=True)

# Feature extraction for baseline
def extract_features(row):
    prof = json.loads(row["profile_json"])
    
    # Simple aggregations of profile for the baseline model
    feats = {}
    feats["cgpa"] = prof.get("academic", {}).get("cgpa", 0.0)
    feats["num_skills"] = len(prof.get("skills", {}))
    feats["num_projects"] = len(prof.get("projects", []))
    feats["coding_problems"] = prof.get("codingEvidence", {}).get("totalProblemsSolved", 0)
    feats["num_certs"] = len(prof.get("certifications", []))
    
    # Average assessment
    for i in range(1, 21):
        feats[f"A{i}"] = row[f"assessment_q{i:02d}"]
        
    return feats

feature_list = []
for i, row in df.iterrows():
    f_dict = extract_features(row)
    feature_list.append(f_dict)
    
df_feats = pd.DataFrame(feature_list)
y = df["career_suitability"]

train_ids = set(manifest["splits"]["TRAIN"])
val_ids = set(manifest["splits"]["VALIDATION"])
test_ids = set(manifest["splits"]["TEST"])

is_train = df["student_id"].isin(train_ids)
is_val = df["student_id"].isin(val_ids)
is_test = df["student_id"].isin(test_ids)

X_train, y_train = df_feats[is_train], y[is_train]
X_val, y_val = df_feats[is_val], y[is_val]
X_test, y_test = df_feats[is_test], y[is_test]

# Profile-only features
prof_cols = ["cgpa", "num_skills", "num_projects", "coding_problems", "num_certs"]
ass_cols = [f"A{i}" for i in range(1, 21)]

results = []

def eval_model(model, X_train, y_train, X_test, y_test, mode_name, model_name):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_test, y_pred, average='macro', zero_division=0)
    top1 = np.mean(y_test == y_pred)
    
    return {
        "Baseline Mode": mode_name,
        "Algorithm": model_name,
        "Top-1 Hit Rate": top1,
        "Macro F1": macro_f1
    }

rf = RandomForestClassifier(n_estimators=100, random_state=42)
gb = GradientBoostingClassifier(n_estimators=50, random_state=42)

# Profile-only
results.append(eval_model(rf, X_train[prof_cols], y_train, X_test[prof_cols], y_test, "Profile-only", "Random Forest"))
results.append(eval_model(gb, X_train[prof_cols], y_train, X_test[prof_cols], y_test, "Profile-only", "Gradient Boosted Tree"))

# Assessment-only
results.append(eval_model(rf, X_train[ass_cols], y_train, X_test[ass_cols], y_test, "Assessment-only", "Random Forest"))
results.append(eval_model(gb, X_train[ass_cols], y_train, X_test[ass_cols], y_test, "Assessment-only", "Gradient Boosted Tree"))

# Combined (Fusion)
results.append(eval_model(rf, X_train, y_train, X_test, y_test, "Profile + Assessment", "Random Forest"))
results.append(eval_model(gb, X_train, y_train, X_test, y_test, "Profile + Assessment", "Gradient Boosted Tree"))

df_base = pd.DataFrame(results)
df_base.to_csv(os.path.join(eval_dir, "13_baseline_comparison.csv"), index=False)
print("Baseline comparison generated.")
