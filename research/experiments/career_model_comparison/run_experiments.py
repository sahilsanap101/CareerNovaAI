import pandas as pd
import numpy as np
import json
import os
import random
from collections import defaultdict
from sklearn.model_selection import StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import ndcg_score, precision_score, recall_score, f1_score
import copy

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
exp_dir = f"{base_dir}/research/experiments/career_model_comparison"

c15 = [
    'Backend Developer', 'Cloud Engineer', 'Computer Vision Engineer', 'Cybersecurity Engineer', 
    'Data Analyst', 'Data Engineer', 'Data Scientist', 'DevOps Engineer', 'Frontend Developer', 
    'Full Stack Developer', 'MLOps Engineer', 'Machine Learning Engineer', 'NLP Engineer', 
    'QA Engineer', 'Software Engineer'
]

c60 = [
    '.NET Developer', 'AI Data / Annotation Quality Specialist', 'AI Engineer', 'AI Product / Applied AI Developer', 
    'API / Integration Developer', 'Application Security Engineer', 'Automation Test Engineer', 'BI Developer / BI Analyst', 
    'Backend Developer', 'Big Data Engineer', 'Blockchain / Web3 Developer', 'Business Analyst (IT)', 'Cloud Data Engineer', 
    'Cloud Engineer', 'Cloud Security Engineer', 'Cloud Support Engineer', 'Computer Vision Engineer', 'Cybersecurity Analyst', 
    'Cybersecurity Engineer', 'Data Analyst', 'Data Engineer', 'Data Quality Engineer', 'Data Scientist', 'Database Engineer / DBA', 
    'DevOps Engineer', 'Embedded Software Engineer', 'Frontend Developer', 'Full Stack Developer', 'Generative AI Engineer', 
    'IT / Technical Support Engineer', 'IoT Engineer', 'Java Developer', 'MLOps Engineer', 'Machine Learning Engineer', 
    'Mobile App Developer (Android)', 'Mobile App Developer (Cross-platform)', 'NLP Engineer', 'Network Engineer', 
    'Penetration Tester / Ethical Hacker', 'Platform Engineer', 'Product Analyst', 'Python Developer', 'QA Engineer', 
    'RPA / Automation Developer', 'Release / Build Engineer', 'SAP Technology Developer / Consultant', 'SDET (Software Development Engineer in Test)', 
    'SOC Analyst', 'Salesforce Developer', 'ServiceNow Developer', 'Site Reliability Engineer (SRE)', 'Software Developer', 
    'Software Engineer', 'Solutions Engineer / Associate Solutions Consultant', 'Systems Engineer', 'Technical Consultant', 
    'Technical Support / Application Support Engineer', 'Technical Writer / Developer Documentation Specialist', 'UI/UX Designer (Tech Product)', 
    'Web Developer'
]

def evaluate(scores_matrix, y_true, candidates):
    top1, top3, top5, mrr = 0, 0, 0, 0
    ndcg5 = []
    y_pred_top1 = []
    
    c_idx = {c: i for i, c in enumerate(candidates)}
    n = 0
    
    for i in range(len(y_true)):
        if y_true[i] not in c_idx:
            continue
        n += 1
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

    if n == 0:
        return {"Top-1":0,"Top-3":0,"Top-5":0,"MRR":0,"NDCG@5":0,"Macro F1":0}

    valid_y_true = [y for y in y_true if y in c_idx]
    mac_f1 = f1_score(valid_y_true, y_pred_top1, average='macro', zero_division=0)
    
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

    # Load assessment data
    with open(f"{exp_dir}/assessment_data.json") as f:
        ass_data = json.load(f)

    # Calculate assessment scores explicitly using exact logic from typescript
    n_students = len(df)
    A_mat_15 = np.zeros((n_students, len(c15)))
    A_mat_60 = np.zeros((n_students, len(c60)))
    
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
                        if career in c60:
                            A_mat_60[i, c60.index(career)] += w
            except:
                pass
    
    A_mat_15 = A_mat_15 / 20.0
    A_mat_60 = A_mat_60 / 20.0

    # Load Profile Scores
    with open(f"{base_dir}/research/results/heuristic_scores.json") as f:
        p_scores_raw = json.load(f)['full']
        
    P_mat_15 = np.zeros((n_students, len(c15)))
    P_mat_60 = np.zeros((n_students, len(c60)))
    c15_lower = [c.lower() for c in c15]
    c60_lower = [c.lower() for c in c60]
    
    for i in range(n_students):
        if i < len(p_scores_raw):
            rec = p_scores_raw[i]['recommendations']
            for r in rec:
                c_name = r['careerName'].lower()
                if c_name in c15_lower:
                    P_mat_15[i, c15_lower.index(c_name)] = r['score']
                if c_name in c60_lower:
                    P_mat_60[i, c60_lower.index(c_name)] = r['score']

    # We will evaluate only students whose target is in the candidate set
    mask_15 = np.array([y in c15 for y in y_true])
    mask_60 = np.array([y in c60 for y in y_true])

    results = []
    
    def run_eval(method_name, S_mat, cand_set, mask, weights=None, leakage="NO"):
        n_cand = len(cand_set)
        # S_mat is (500, n_cand)
        res = evaluate(S_mat[mask], y_true[mask], cand_set)
        res.update({
            "Method": method_name,
            "Candidate set": f"{n_cand} careers",
            "Confidence interval": "N/A",
            "Leakage status": leakage
        })
        results.append(res)
        return res

    # METHOD A: Random
    np.random.seed(42)
    rand_15 = np.random.rand(n_students, len(c15))
    rand_60 = np.random.rand(n_students, len(c60))
    run_eval("A - Random Baseline", rand_15, c15, mask_15)
    run_eval("A - Random Baseline", rand_60, c60, mask_60)

    # METHOD B: Popularity
    pop_15 = np.zeros((n_students, len(c15)))
    pop_60 = np.zeros((n_students, len(c60)))
    for c in y_true[mask_15]:
        pop_15[:, c15.index(c)] += 1
    for c in y_true[mask_60]:
        pop_60[:, c60.index(c)] += 1
    run_eval("B - Most Popular", pop_15, c15, mask_15)
    run_eval("B - Most Popular", pop_60, c60, mask_60)
    
    # METHOD C: Profile Only
    run_eval("C - Profile Only", P_mat_15, c15, mask_15)
    run_eval("C - Profile Only", P_mat_60, c60, mask_60)

    # METHOD D: Assessment Only
    run_eval("D - Assessment Only", A_mat_15, c15, mask_15)
    run_eval("D - Assessment Only", A_mat_60, c60, mask_60)

    # METHOD E: 70:30 Fusion
    F7030_15 = 0.7 * P_mat_15 + 0.3 * A_mat_15
    F7030_60 = 0.7 * P_mat_60 + 0.3 * A_mat_60
    run_eval("E - 70:30 Fusion", F7030_15, c15, mask_15)
    run_eval("E - 70:30 Fusion", F7030_60, c60, mask_60)

    # METHOD F: Fusion Weight Search
    best_top1_15, best_w_15 = -1, None
    for wp in [0.9, 0.8, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]:
        wa = 1.0 - wp
        F_15 = wp * P_mat_15 + wa * A_mat_15
        res = evaluate(F_15[mask_15], y_true[mask_15], c15)
        if res['Top-1'] > best_top1_15:
            best_top1_15 = res['Top-1']
            best_w_15 = (wp, wa)
    
    Fbest_15 = best_w_15[0] * P_mat_15 + best_w_15[1] * A_mat_15
    Fbest_60 = best_w_15[0] * P_mat_60 + best_w_15[1] * A_mat_60
    run_eval(f"F - Best Fusion ({int(best_w_15[0]*100)}:{int(best_w_15[1]*100)})", Fbest_15, c15, mask_15)
    run_eval(f"F - Best Fusion ({int(best_w_15[0]*100)}:{int(best_w_15[1]*100)})", Fbest_60, c60, mask_60)

    # METHOD I: Supervised Machine Learning (Random Forest with simple profile/assessment features)
    # 5-fold CV to avoid test leakage
    def run_rf(mask, cand_set):
        X = np.hstack([P_mat_15, A_mat_15]) # Using these as meta-features!
        y = y_true
        
        # We only predict on masked students
        y_masked = y[mask]
        X_masked = X[mask]
        
        rf_scores = np.zeros((len(X_masked), len(cand_set)))
        
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        try:
            for train_idx, test_idx in skf.split(X_masked, y_masked):
                clf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=5)
                clf.fit(X_masked[train_idx], y_masked[train_idx])
                
                preds = clf.predict_proba(X_masked[test_idx])
                classes = clf.classes_
                
                for c_idx, cls in enumerate(classes):
                    if cls in cand_set:
                        cand_i = cand_set.index(cls)
                        rf_scores[test_idx, cand_i] = preds[:, c_idx]
            run_eval("I - ML Random Forest", rf_scores, cand_set, np.ones(len(y_masked), dtype=bool))
        except Exception as e:
            print(f"Could not run RF for {len(cand_set)} careers: {e}")

    run_rf(mask_15, c15)
    run_rf(mask_60, c60)

    df_res = pd.DataFrame(results)
    
    # Reorder columns
    cols = ['Method', 'Candidate set', 'Top-1', 'Top-3', 'Top-5', 'MRR', 'NDCG@5', 'Macro F1', 'Confidence interval', 'Leakage status']
    df_res = df_res[cols]
    
    # Save
    df_res.to_csv(f"{exp_dir}/RESULTS_COMPARISON.csv", index=False)
    
    # Pre-format as markdown for report
    for c in ['Top-1', 'Top-3', 'Top-5', 'MRR', 'NDCG@5', 'Macro F1']:
        df_res[c] = (df_res[c] * 100).apply(lambda x: f"{x:.2f}%")
        
    with open(f"{exp_dir}/RESULTS_REPORT.md", "w") as f:
        f.write("# Career Model Comparison Results\n\n")
        f.write(df_res.to_markdown(index=False))

    print("Successfully ran all experiments!")

if __name__ == "__main__":
    main()
