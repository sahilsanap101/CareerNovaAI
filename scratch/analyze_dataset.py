import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, top_k_accuracy_score, precision_score, recall_score, f1_score
from scipy.stats import entropy
import json

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"

# 1. LOAD DATA
df_stu = pd.read_csv(f"{base_dir}/research/data/evaluation/student_dataset_500_minimal.csv")
c15 = pd.read_csv(f"{base_dir}/research/data/evaluation/career_evaluation_15.csv")['career_name'].tolist()

valid_idx = df_stu['preferred_career'].isin(c15)
df_stu = df_stu[valid_idx].copy()
y = df_stu['preferred_career'].values

# Feature sets
profile_cols = ['year', 'semester', 'cgpa', 'projects_count', 'certifications_count'] 
# We need to one-hot encode or parse the text columns for a full Random Forest.
# Since we just want dimension-level ablation, let's extract simple numerical proxies for the text.

def extract_features(df):
    X = pd.DataFrame(index=df.index)
    # Academics
    X['cgpa'] = df['cgpa']
    # Projects
    X['projects'] = df['projects_count']
    # Certs
    X['certs'] = df['certifications_count']
    # Coding
    X['coding'] = df['coding_evidence'].fillna('').apply(len)
    # Goal
    X['goal_len'] = df['career_goal'].fillna('').apply(len)
    # Skills
    X['skills'] = df['skills'].fillna('').apply(len)
    # Interests
    X['interests'] = df['interests'].fillna('').apply(len)
    
    # Assessment
    for i in range(1, 21):
        c = f'assessment_q{i:02d}'
        X[c] = df[c].fillna(3)
        
    return X

X_all = extract_features(df_stu)

dim_groups = {
    'academics': ['cgpa'],
    'projects': ['projects'],
    'certifications': ['certs'],
    'coding': ['coding'],
    'career_goal': ['goal_len'],
    'skills': ['skills'],
    'interests': ['interests']
}
prof_cols = [c for g in dim_groups.values() for c in g]
ass_cols = [f'assessment_q{i:02d}' for i in range(1, 21)]

# 5. EMPIRICAL TARGET-DEPENDENCE ANALYSIS
print("Target Distribution:")
print(df_stu['preferred_career'].value_counts())

maj_class = df_stu['preferred_career'].mode()[0]
acc_maj = (y == maj_class).mean()
acc_rnd = 1.0 / 15

print(f"Majority Top-1: {acc_maj}")
print(f"Uniform Random Top-1: {acc_rnd}")

def eval_rf(X_train, y_train):
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    top1, top3, top5 = [], [], []
    
    for tr, ts in cv.split(X_train, y_train):
        rf.fit(X_train.iloc[tr], y_train[tr])
        probs = rf.predict_proba(X_train.iloc[ts])
        classes = rf.classes_
        
        for i in range(len(ts)):
            true_cls = y_train[ts[i]]
            s = probs[i]
            ranked = classes[np.argsort(s)[::-1]]
            rank = np.where(ranked == true_cls)[0][0] + 1
            top1.append(1 if rank == 1 else 0)
            top3.append(1 if rank <= 3 else 0)
            top5.append(1 if rank <= 5 else 0)
            
    return np.mean(top1), np.mean(top3), np.mean(top5)

# Profile Only (P)
t1_p, t3_p, t5_p = eval_rf(X_all[prof_cols], y)
# Assessment Only (A)
t1_a, t3_a, t5_a = eval_rf(X_all[ass_cols], y)
# P + A
t1_pa, t3_pa, t5_pa = eval_rf(X_all[prof_cols + ass_cols], y)

print(f"Profile-only: {t1_p}")
print(f"Assessment-only: {t1_a}")
print(f"P + A: {t1_pa}")

# 6. ABLATION
res = []
res.append({"Model": "P (All 7)", "Top-1": t1_p})
for dim, cols in dim_groups.items():
    ab_cols = [c for c in prof_cols if c not in cols]
    t1, _, _ = eval_rf(X_all[ab_cols], y)
    res.append({"Model": f"P(-{dim})", "Top-1": t1})
res.append({"Model": "A", "Top-1": t1_a})
res.append({"Model": "P + A", "Top-1": t1_pa})

df_ab = pd.DataFrame(res)
df_ab.to_csv(f"{base_dir}/research/results/profile_ablation_prompt7.csv", index=False)

# 7. ASSESSMENT-TARGET DEPENDENCE
import scipy.stats as stats
assoc = []
for col in ass_cols:
    # Kruskal-Wallis or ANOVA since Q is 1-5 and target is categorical
    groups = [X_all[col][y == c].values for c in c15]
    h, p = stats.kruskal(*groups)
    assoc.append({
        "question": col,
        "measure": "Kruskal-Wallis H",
        "statistic": h,
        "p_value": p,
        "interpretation": "Significant" if p < 0.05 else "Not Significant"
    })
df_assoc = pd.DataFrame(assoc)
df_assoc.to_csv(f"{base_dir}/research/results/assessment_target_association.csv", index=False)

print("Done")
