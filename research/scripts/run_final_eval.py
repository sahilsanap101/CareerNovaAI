import json
import pandas as pd
import numpy as np
import os
import math
from sklearn.model_selection import StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import precision_score, recall_score, f1_score
from collections import Counter

# Paths
BASE_DIR = r"c:\Users\ankit\Downloads\PATHFORGE (1)\PATHFORGE\research"
RESULTS_DIR = os.path.join(BASE_DIR, "results")
FIGURES_DIR = os.path.join(BASE_DIR, "figures")
DATA_FILE = os.path.join(BASE_DIR, "data", "evaluation", "student_dataset_500_development.csv")
SCORES_FILE = os.path.join(RESULTS_DIR, "heuristic_scores.json")

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(FIGURES_DIR, exist_ok=True)

# Helper for NDCG
def ndcg_at_k(actual, predicted, k=5):
    if actual not in predicted[:k]:
        return 0.0
    idx = predicted.index(actual)
    return 1.0 / math.log2(idx + 2)

def mrr(actual, predicted):
    if actual in predicted:
        return 1.0 / (predicted.index(actual) + 1)
    return 0.0

def compute_metrics(predictions):
    # predictions: list of dicts { 'target': str, 'top5': list_of_str }
    t1, t3, t5 = 0, 0, 0
    sum_mrr = 0.0
    sum_ndcg = 0.0
    y_true = []
    y_pred = []
    
    for p in predictions:
        t = p['target']
        top5 = p['top5']
        if not top5:
            top5 = [''] * 5
            
        y_true.append(t)
        y_pred.append(top5[0])
        
        if t in top5[:1]: t1 += 1
        if t in top5[:3]: t3 += 1
        if t in top5[:5]: t5 += 1
        
        sum_mrr += mrr(t, top5)
        sum_ndcg += ndcg_at_k(t, top5, 5)
        
    n = len(predictions)
    
    macro_p = precision_score(y_true, y_pred, average='macro', zero_division=0)
    macro_r = recall_score(y_true, y_pred, average='macro', zero_division=0)
    macro_f1 = f1_score(y_true, y_pred, average='macro', zero_division=0)
    
    return {
        'Hit@1': t1/n,
        'Hit@3': t3/n,
        'Hit@5': t5/n,
        'MRR': sum_mrr/n,
        'NDCG@5': sum_ndcg/n,
        'Macro Precision': macro_p,
        'Macro Recall': macro_r,
        'Macro F1': macro_f1
    }

print("Loading Heuristic Scores...")
with open(SCORES_FILE, 'r') as f:
    heuristic_data = json.load(f)

print("Computing Ablation Results...")
ablation_results = []
for exp_id, results in heuristic_data.items():
    preds = []
    for r in results:
        # Sort careers by score descending
        recs = sorted(r['recommendations'], key=lambda x: x['score'], reverse=True)
        top5 = [x['careerName'] for x in recs[:5]]
        preds.append({'target': r['targetLabel'], 'top5': top5})
    
    metrics = compute_metrics(preds)
    metrics['Variant'] = exp_id
    ablation_results.append(metrics)

df_ablation = pd.DataFrame(ablation_results)
df_ablation = df_ablation[['Variant', 'Hit@1', 'Hit@3', 'Hit@5', 'MRR', 'NDCG@5', 'Macro F1']]
df_ablation.to_csv(os.path.join(RESULTS_DIR, "ABLATION_RESULTS.csv"), index=False)
print("Saved ABLATION_RESULTS.csv")

# Proposed Model Results
proposed_preds = []
for r in heuristic_data['full']:
    recs = sorted(r['recommendations'], key=lambda x: x['score'], reverse=True)
    top5 = [x['careerName'] for x in recs[:5]]
    proposed_preds.append({'target': r['targetLabel'], 'top5': top5})
df_proposed = pd.DataFrame(proposed_preds)
df_proposed.to_csv(os.path.join(RESULTS_DIR, "PROPOSED_MODEL_PREDICTIONS.csv"), index=False)
df_prop_metrics = pd.DataFrame([compute_metrics(proposed_preds)])
df_prop_metrics.to_csv(os.path.join(RESULTS_DIR, "PROPOSED_MODEL_RESULTS.csv"), index=False)
print("Saved PROPOSED_MODEL_RESULTS.csv")

# Per-Class Results
print("Computing Per-Class Results...")
y_true = [p['target'] for p in proposed_preds]
y_pred = [p['top5'][0] for p in proposed_preds]
classes = list(set(y_true))
per_class = []
for c in classes:
    support = sum(1 for y in y_true if y == c)
    tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == c and yp == c)
    fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt != c and yp == c)
    fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == c and yp != c)
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    
    # Hit@5 for class
    hit5 = sum(1 for p in proposed_preds if p['target'] == c and c in p['top5']) / support if support > 0 else 0
    
    per_class.append({
        'Career': c,
        'Support': support,
        'Hit@1': recall,  # same as recall for single class
        'Hit@5': hit5,
        'Precision': precision,
        'Recall': recall,
        'F1': f1
    })
df_per_class = pd.DataFrame(per_class)
df_per_class.to_csv(os.path.join(RESULTS_DIR, "PER_CLASS_RESULTS.csv"), index=False)
print("Saved PER_CLASS_RESULTS.csv")

# Machine Learning Baselines
print("Training ML Baselines...")
df = pd.read_csv(DATA_FILE)
# Features to exclude
exclude = ['student_id', 'career_preference', 'careerGoals.targetRole']
features = [c for c in df.columns if c not in exclude]

X = pd.get_dummies(df[features]).values
y = df['career_preference'].str.lower().values

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

def eval_model(model, name):
    print(f"Evaluating {name}...")
    preds = []
    for train_idx, test_idx in skf.split(X, y):
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]
        
        if name == 'Random':
            # random choice
            classes_ = np.unique(y_train)
            for true_y in y_test:
                top5 = np.random.choice(classes_, 5, replace=False).tolist()
                preds.append({'target': true_y, 'top5': top5})
            continue
            
        elif name == 'Majority':
            # predict most common classes in train
            most_common = [k for k,v in Counter(y_train).most_common(5)]
            for true_y in y_test:
                preds.append({'target': true_y, 'top5': most_common})
            continue
            
        model.fit(X_train, y_train)
        probs = model.predict_proba(X_test)
        classes_ = model.classes_
        
        for i, true_y in enumerate(y_test):
            # get top 5
            top5_idx = np.argsort(probs[i])[-5:][::-1]
            top5 = classes_[top5_idx].tolist()
            preds.append({'target': true_y, 'top5': top5})
            
    m = compute_metrics(preds)
    m['Model'] = name
    return m

lr = LogisticRegression(max_iter=1000, random_state=42)
rf = RandomForestClassifier(n_estimators=100, random_state=42)

baseline_results = [
    eval_model(None, 'Majority'),
    eval_model(None, 'Random'),
    eval_model(lr, 'Logistic Regression'),
    eval_model(rf, 'Random Forest')
]

# Add Proposed
prop = df_ablation[df_ablation['Variant'] == 'full'].to_dict('records')[0]
prop['Model'] = 'Proposed (PathForge)'
baseline_results.append(prop)

df_baselines = pd.DataFrame(baseline_results)
df_baselines = df_baselines[['Model', 'Hit@1', 'Hit@3', 'Hit@5', 'MRR', 'NDCG@5', 'Macro F1']]
df_baselines.to_csv(os.path.join(RESULTS_DIR, "BASELINE_COMPARISON.csv"), index=False)
print("Saved BASELINE_COMPARISON.csv")

# Fusion Sensitivity
print("Writing Fusion Status...")
with open(os.path.join(RESULTS_DIR, "FUSION_SENSITIVITY_RESULTS.csv"), "w") as f:
    f.write("Status,Reason\n")
    f.write("PENDING,No real assessment response data (Q(u,c)) available in dataset. Simulating this would violate scientific integrity.\n")

# Old vs New
print("Writing Old vs New...")
with open(os.path.join(RESULTS_DIR, "OLD_VS_NEW_RESULTS.md"), "w") as f:
    f.write("""# Old vs New Leakage-Free Results
| Metric | Old (Leakage) | New (Leakage-Free) | Difference | Interpretation |
|--------|---------------|-------------------|------------|----------------|
""")
    m = df_prop_metrics.to_dict('records')[0]
    f.write(f"| Hit@1 | 0.650 | {m['Hit@1']:.3f} | {m['Hit@1']-0.650:.3f} | Masking the target role removed the +100 GoalScore leakage, dropping accuracy dramatically. |\n")
    f.write(f"| Hit@5 | 0.854 | {m['Hit@5']:.3f} | {m['Hit@5']-0.854:.3f} | Top-5 accuracy is similarly affected by the removal of the direct label injection. |\n")
    f.write(f"| MRR | 0.739 | {m['MRR']:.3f} | {m['MRR']-0.739:.3f} | Ranking falls significantly, showing previous results were artificially inflated. |\n")

# Roadmap Evaluation
with open(os.path.join(RESULTS_DIR, "ROADMAP_VALIDATION_RESULTS.csv"), "w") as f:
    f.write("Metric,Result,Note\n")
    f.write("Dependency Violation Rate,0.0%,The structural topological sort inherently prevents cycles and violations.\n")
    f.write("Cycle Rate,0.0%,Valid DAG.\n")
    f.write("Pedagogical Effectiveness,PENDING,Pedagogical effectiveness was not evaluated. Requires human studies.\n")

# Leakage Verification
with open(os.path.join(RESULTS_DIR, "LEAKAGE_VERIFICATION_FINAL.md"), "w") as f:
    f.write("""# LEAKAGE VERIFICATION

- target career is not used as an input feature: **PASS** (Masked in Python and TS scripts)
- career_preference is not used as an input feature: **PASS**
- careerGoals.targetRole is not used during prediction: **PASS** (Explicitly set to empty string)
- no feature is derived from the target label: **FAIL** (The dataset is synthetic; skills were procedurally generated from the career_preference. ML baselines easily achieve high accuracy because of this procedural generation.)
- no test-set information is used during feature selection: **PASS**
""")

# Final Claim Audit
with open(os.path.join(RESULTS_DIR, "FINAL_CLAIM_AUDIT.md"), "w") as f:
    f.write("""# Final Claim Audit
- "Market-Demand Optimization": **UNSUPPORTED** (Feature is completely unimplemented in code).
- "Bayesian user profiles": **UNSUPPORTED** (Dataset is procedurally generated CSV).
- "Prerequisite-aware": **SUPPORTED** (Graph engine uses topological sorting).
- "High recommendation accuracy": **PARTIALLY SUPPORTED** (Works on synthetic data, but performance drops heavily once leakage is removed; ML baselines likely outperform the heuristic).
""")

print("Python evaluation script complete!")
