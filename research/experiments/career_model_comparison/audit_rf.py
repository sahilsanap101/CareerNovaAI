import pandas as pd
import numpy as np
import json
import os
from sklearn.model_selection import StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import ndcg_score, precision_score, recall_score, f1_score, confusion_matrix

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
exp_dir = f"{base_dir}/research/experiments/career_model_comparison"

c15 = [
    'Backend Developer', 'Cloud Engineer', 'Computer Vision Engineer', 'Cybersecurity Engineer', 
    'Data Analyst', 'Data Engineer', 'Data Scientist', 'DevOps Engineer', 'Frontend Developer', 
    'Full Stack Developer', 'MLOps Engineer', 'Machine Learning Engineer', 'NLP Engineer', 
    'QA Engineer', 'Software Engineer'
]

def evaluate_metrics(scores_matrix, y_true, candidates):
    top1, top3, top5, mrr = 0, 0, 0, 0
    ndcg5 = []
    y_pred_top1 = []
    
    c_idx = {c: i for i, c in enumerate(candidates)}
    n = len(y_true)
    
    for i in range(n):
        true_i = c_idx[y_true[i]]
        s = scores_matrix[i]
        
        ranked = np.argsort(s)[::-1]
        y_pred_top1.append(candidates[ranked[0]])
        
        rank = np.where(ranked == true_i)[0]
        if len(rank) > 0:
            rank = rank[0] + 1
            if rank == 1: top1 += 1
            if rank <= 3: top3 += 1
            if rank <= 5: top5 += 1
            mrr += 1.0 / rank
            
            rel = np.zeros(len(candidates))
            rel[true_i] = 1.0
            ndcg5.append(ndcg_score([rel], [s], k=5))
        else:
            ndcg5.append(0.0)

    mac_f1 = f1_score(y_true, y_pred_top1, average='macro', zero_division=0)
    
    return {
        "Top-1": top1 / n,
        "Top-3": top3 / n,
        "Top-5": top5 / n,
        "MRR": mrr / n,
        "NDCG@5": np.mean(ndcg5),
        "Macro F1": mac_f1
    }

def main():
    df = pd.read_csv(f"{base_dir}/research/data/evaluation/student_dataset_500_minimal.csv")
    y_true = df['preferred_career'].values

    with open(f"{exp_dir}/assessment_data.json") as f:
        ass_data = json.load(f)

    n_students = len(df)
    A_mat_15 = np.zeros((n_students, len(c15)))
    
    for i in range(n_students):
        for q in range(20):
            ans = str(df.iloc[i][f'assessment_q{q+1:02d}'])
            try:
                opt_idx = int(float(ans)) - 1
                if 0 <= opt_idx < len(ass_data[q]['options']):
                    cw = ass_data[q]['options'][opt_idx]['careerWeights']
                    for career, w in cw.items():
                        if career in c15:
                            A_mat_15[i, c15.index(career)] += w
            except:
                pass
    A_mat_15 = A_mat_15 / 20.0

    with open(f"{base_dir}/research/results/heuristic_scores.json") as f:
        p_scores_raw = json.load(f)['full']
        
    P_mat_15 = np.zeros((n_students, len(c15)))
    c15_lower = [c.lower() for c in c15]
    
    for i in range(n_students):
        if i < len(p_scores_raw):
            rec = p_scores_raw[i]['recommendations']
            for r in rec:
                c_name = r['careerName'].lower()
                if c_name in c15_lower:
                    P_mat_15[i, c15_lower.index(c_name)] = r['score']

    mask_15 = np.array([y in c15 for y in y_true])
    y_masked = y_true[mask_15]
    P_masked = P_mat_15[mask_15]
    A_masked = A_mat_15[mask_15]
    
    # Baseline Scores Arrays
    S_pop = np.zeros_like(P_masked)
    S_rand = np.random.RandomState(42).rand(*P_masked.shape)
    S_rf = np.zeros_like(P_masked)
    S_7030 = 0.7 * P_masked + 0.3 * A_masked
    
    X = np.hstack([P_masked, A_masked])
    
    feature_names = [f"Profile_{c}" for c in c15] + [f"Assess_{c}" for c in c15]
    importances = np.zeros(len(feature_names))
    
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    student_predictions = []
    
    for fold, (train_idx, test_idx) in enumerate(skf.split(X, y_masked)):
        # Popularity baseline per fold
        y_train = y_masked[train_idx]
        counts = pd.Series(y_train).value_counts().to_dict()
        for i, c in enumerate(c15):
            S_pop[test_idx, i] = counts.get(c, 0)
            
        # RF model
        clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
        clf.fit(X[train_idx], y_train)
        preds = clf.predict_proba(X[test_idx])
        classes = clf.classes_
        
        importances += clf.feature_importances_ / 5.0
        
        for c_idx, cls in enumerate(classes):
            if cls in c15:
                cand_i = c15.index(cls)
                S_rf[test_idx, cand_i] = preds[:, c_idx]
                
    # Save verification predictions
    for i in range(len(y_masked)):
        student_predictions.append({
            "student_idx": i,
            "true_career": y_masked[i],
            "rf_top1_pred": c15[np.argmax(S_rf[i])],
            "rf_score_top1": np.max(S_rf[i]),
            "pop_top1_pred": c15[np.argmax(S_pop[i])]
        })
        
    pd.DataFrame(student_predictions).to_csv(f"{exp_dir}/RF_PREDICTION_VERIFICATION.csv", index=False)
    
    # Calculate metrics
    res_rand = evaluate_metrics(S_rand, y_masked, c15)
    res_pop = evaluate_metrics(S_pop, y_masked, c15)
    res_prof = evaluate_metrics(P_masked, y_masked, c15)
    res_ass = evaluate_metrics(A_masked, y_masked, c15)
    res_7030 = evaluate_metrics(S_7030, y_masked, c15)
    res_rf = evaluate_metrics(S_rf, y_masked, c15)
    
    metrics_df = pd.DataFrame([
        {"Method": "Random", **res_rand},
        {"Method": "Popularity (OOF)", **res_pop},
        {"Method": "Profile", **res_prof},
        {"Method": "Assessment", **res_ass},
        {"Method": "70:30 Fusion", **res_7030},
        {"Method": "Random Forest (OOF)", **res_rf},
    ])
    metrics_df.to_csv(f"{exp_dir}/INDEPENDENT_RF_METRICS.csv", index=False)
    
    # Feature Importances
    fi_df = pd.DataFrame({
        "Feature": feature_names,
        "Importance": importances
    }).sort_values(by="Importance", ascending=False)
    fi_df.to_csv(f"{exp_dir}/RF_FEATURE_IMPORTANCES.csv", index=False)
    
    # Confusion Matrix
    y_pred_rf = [c15[np.argmax(S_rf[i])] for i in range(len(y_masked))]
    cm = confusion_matrix(y_masked, y_pred_rf, labels=c15)
    cm_df = pd.DataFrame(cm, index=c15, columns=c15)
    cm_df.to_csv(f"{exp_dir}/RF_CONFUSION_MATRIX.csv")

    # Bootstrap CIs for RF vs 70:30 MRR
    def get_rank(s, true_c):
        c_idx = c15.index(true_c)
        ranked = np.argsort(s)[::-1]
        return np.where(ranked == c_idx)[0][0] + 1

    mrr_rf = [1.0/get_rank(S_rf[i], y_masked[i]) for i in range(len(y_masked))]
    mrr_7030 = [1.0/get_rank(S_7030[i], y_masked[i]) for i in range(len(y_masked))]
    diffs = np.array(mrr_rf) - np.array(mrr_7030)
    
    np.random.seed(42)
    boot_means = [np.mean(np.random.choice(diffs, size=len(diffs), replace=True)) for _ in range(1000)]
    ci_low = np.percentile(boot_means, 2.5)
    ci_high = np.percentile(boot_means, 97.5)
    
    with open(f"{exp_dir}/BOOTSTRAP_CI.json", "w") as f:
        json.dump({
            "RF_vs_7030_MRR_Diff": float(np.mean(diffs)),
            "95_CI_Lower": float(ci_low),
            "95_CI_Upper": float(ci_high)
        }, f, indent=2)

if __name__ == "__main__":
    main()
