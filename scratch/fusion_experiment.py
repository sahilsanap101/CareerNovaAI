import json
import pandas as pd
import numpy as np
import os
from sklearn.metrics import ndcg_score, precision_score, recall_score, f1_score
from scipy import stats

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"

os.makedirs(f"{base_dir}/research/results", exist_ok=True)

# 1. LOAD DATA
df_stu = pd.read_csv(f"{base_dir}/research/data/evaluation/student_dataset_500_minimal.csv")
c15 = pd.read_csv(f"{base_dir}/research/data/evaluation/career_evaluation_15.csv")['career_name'].tolist()
c15_lower = [c.lower() for c in c15]
with open(f"{base_dir}/research/data/collection/career_assessment_weight_matrix_v1.json") as f:
    w_matrix = json.load(f)
with open(f"{base_dir}/research/results/heuristic_scores.json") as f:
    p_scores_raw = json.load(f)['full']

# Align datasets
valid_students = []
y_true = []
for idx, row in df_stu.iterrows():
    if row['preferred_career'] in c15:
        # Find matching student in p_scores
        # Assume order is identical or map by ID. p_scores has studentId?
        # Actually heuristic_scores.json has 'studentId'
        sid = row['id'] if 'id' in row else idx
        match = next((s for s in p_scores_raw if s.get('studentId') == row.get('id', '') or s.get('targetLabel') == row['preferred_career']), None)
        if match:
            # We map simply by matching index if 'id' missing
            pass
        valid_students.append(idx)

df_stu_valid = df_stu.iloc[valid_students].copy()
y_true = df_stu_valid['preferred_career'].values

# P(u,c) matrix
P_mat = np.zeros((len(df_stu_valid), len(c15)))
for i, idx in enumerate(df_stu_valid.index):
    rec = p_scores_raw[idx]['recommendations']
    rec_dict = {r['careerName'].lower(): r['score'] for r in rec}
    for j, c in enumerate(c15):
        P_mat[i, j] = rec_dict.get(c.lower(), 0.0)

def calc_Q(df_stu, encoding_map):
    Q_mat = np.zeros((len(df_stu), len(c15)))
    for i, (_, row) in enumerate(df_stu.iterrows()):
        for j, c in enumerate(c15):
            A = 0.0
            Amax = 0.0
            for q_idx in range(1, 21):
                q_col = f"assessment_q{q_idx:02d}"
                if q_col in row and pd.notna(row[q_col]):
                    val = str(int(row[q_col]))
                    enc = encoding_map.get(val, 0)
                    w = float(w_matrix[q_idx-1].get(c, 0.0))
                    if w > 0:
                        A += w * enc
                        Amax += w * 1.0
            Q_mat[i, j] = (A / Amax * 100) if Amax > 0 else 0.0
    return Q_mat

enc_std = {'1': 0.0, '2': 0.25, '3': 0.50, '4': 0.75, '5': 1.0}
enc_sens = {'1': 0.0, '2': 0.20, '3': 0.50, '4': 0.80, '5': 1.0}

Q_mat = calc_Q(df_stu_valid, enc_std)
Q_mat_sens = calc_Q(df_stu_valid, enc_sens)

models = {
    'M0': (1.0, 0.0),
    'M1': (0.0, 1.0),
    'M2': (0.5, 0.5),
    'M3': (0.6, 0.4),
    'M4': (0.7, 0.3),
    'M5': (0.8, 0.2),
    'M6': (0.3, 0.7),
    'M7': (1.0, 0.0),
    'M8': (0.0, 1.0)
}

def evaluate(scores, y_true):
    top1, top3, top5, mrr = 0, 0, 0, 0
    ndcg5 = []
    y_pred_top1 = []
    
    c_idx = {c: i for i, c in enumerate(c15)}
    
    for i in range(len(y_true)):
        true_i = c_idx[y_true[i]]
        s = scores[i]
        ranked = np.argsort(s)[::-1]
        
        y_pred_top1.append(c15[ranked[0]])
        rank = np.where(ranked == true_i)[0][0] + 1
        
        if rank == 1: top1 += 1
        if rank <= 3: top3 += 1
        if rank <= 5: top5 += 1
        mrr += 1.0 / rank
        
        rel = np.zeros(len(c15))
        rel[true_i] = 1.0
        ndcg5.append(ndcg_score([rel], [s], k=5))
        
    n = len(y_true)
    mac_p = precision_score(y_true, y_pred_top1, average='macro', zero_division=0)
    mac_r = recall_score(y_true, y_pred_top1, average='macro', zero_division=0)
    mac_f1 = f1_score(y_true, y_pred_top1, average='macro', zero_division=0)
    
    return {
        "Top-1": top1 / n,
        "Top-3": top3 / n,
        "Top-5": top5 / n,
        "MRR": mrr / n,
        "NDCG@5": np.mean(ndcg5),
        "Macro Precision": mac_p,
        "Macro Recall": mac_r,
        "Macro F1": mac_f1,
        "Mean Final Score": np.mean(scores)
    }

results = []
pred_ranks_all = {}

for m_name, (wp, wq) in models.items():
    s = wp * P_mat + wq * Q_mat
    pred_ranks_all[m_name] = s
    res = evaluate(s, y_true)
    res['Model'] = m_name
    res['Weights'] = f"{int(wp*100)}:{int(wq*100)}"
    results.append(res)

df_res = pd.DataFrame(results)
df_res.to_csv(f"{base_dir}/research/results/fusion_comparison_v1.csv", index=False)

# Rank change analysis
def get_rank(s, true_c):
    c_idx = c15.index(true_c)
    ranked = np.argsort(s)[::-1]
    return np.where(ranked == c_idx)[0][0] + 1

student_effects = []
p_only = pred_ranks_all['M0']
f_7030 = pred_ranks_all['M4']
f_5050 = pred_ranks_all['M2']

improves = 0
worsens = 0
unchanged = 0
rank_changes = []

for i in range(len(y_true)):
    t_c = y_true[i]
    r_p = get_rank(p_only[i], t_c)
    r_f = get_rank(f_7030[i], t_c)
    
    delta = r_p - r_f  # positive means improved rank (lower number)
    rank_changes.append(delta)
    
    if delta > 0:
        improves += 1
        cat = "A (Improves)"
    elif delta < 0:
        worsens += 1
        cat = "C (Worsens)"
    else:
        unchanged += 1
        cat = "B (Unchanged)"
        
    student_effects.append({
        "student_idx": i,
        "target": t_c,
        "rank_profile": r_p,
        "rank_7030": r_f,
        "rank_change": delta,
        "category": cat
    })

pd.DataFrame(student_effects).to_csv(f"{base_dir}/research/results/fusion_student_level_effects.csv", index=False)

# Assessment sensitivity
s_sens = 0.7 * P_mat + 0.3 * Q_mat_sens
res_sens = evaluate(s_sens, y_true)
df_sens = pd.DataFrame([res_sens])
df_sens['Model'] = 'M4_7030_Sensitivity'
df_sens.to_csv(f"{base_dir}/research/results/assessment_sensitivity.csv", index=False)

# Bootstrap CI for MRR delta (70:30 vs 100:0)
mrr_p = [1.0/get_rank(p_only[i], y_true[i]) for i in range(len(y_true))]
mrr_f = [1.0/get_rank(f_7030[i], y_true[i]) for i in range(len(y_true))]
diffs = np.array(mrr_f) - np.array(mrr_p)

np.random.seed(42)
n_boot = 1000
boot_means = [np.mean(np.random.choice(diffs, size=len(diffs), replace=True)) for _ in range(n_boot)]
ci_low = np.percentile(boot_means, 2.5)
ci_high = np.percentile(boot_means, 97.5)

ci_df = pd.DataFrame([{"Comparison": "70:30 vs 100:0 (MRR)", "Mean Diff": np.mean(diffs), "95% CI Lower": ci_low, "95% CI Upper": ci_high}])
ci_df.to_csv(f"{base_dir}/research/results/fusion_confidence_intervals.csv", index=False)

# Export predictions
pred_df = pd.DataFrame(f_7030, columns=c15)
pred_df['Target'] = y_true
pred_df.to_csv(f"{base_dir}/research/results/fusion_predictions_v1.csv", index=False)

print("Done")
