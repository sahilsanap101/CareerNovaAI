import json
import os
import pandas as pd
import numpy as np
from sklearn.metrics import precision_recall_fscore_support, balanced_accuracy_score
from scipy import stats

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
eval_dir = os.path.join(base_dir, "research/fresh_evaluation")
preds_path = os.path.join(eval_dir, "06_test_predictions.json")

with open(preds_path, "r", encoding="utf-8") as f:
    preds = json.load(f)

print(f"Loaded {len(preds)} test predictions.")

def dcg(rel):
    return sum(r / np.log2(i + 2) for i, r in enumerate(rel))

def compute_metrics_for_mode(mode_scores_list, ground_truths, top_k=5):
    # mode_scores_list is a list of dicts: {career: score}
    top1_hits = 0
    top3_hits = 0
    top5_hits = 0
    mrr_sum = 0
    ndcg5_sum = 0
    
    y_true = []
    y_pred = []
    
    for i, scores in enumerate(mode_scores_list):
        gt = ground_truths[i]
        # Sort careers by score descending
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        ranked_careers = [k for k, v in ranked]
        
        y_true.append(gt)
        y_pred.append(ranked_careers[0] if ranked_careers else "")
        
        try:
            rank = ranked_careers.index(gt) + 1
        except ValueError:
            rank = -1
            
        if rank == 1:
            top1_hits += 1
        if 0 < rank <= 3:
            top3_hits += 1
        if 0 < rank <= 5:
            top5_hits += 1
            
        if rank > 0:
            mrr_sum += 1.0 / rank
            
        # NDCG@5
        rel = [1 if c == gt else 0 for c in ranked_careers[:5]]
        ideal_rel = sorted(rel, reverse=True)
        d = dcg(rel)
        idcg = dcg(ideal_rel)
        if idcg > 0:
            ndcg5_sum += d / idcg

    n = len(ground_truths)
    if n == 0: return {}
    
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_true, y_pred, average='macro', zero_division=0)
    micro_p, micro_r, micro_f1, _ = precision_recall_fscore_support(y_true, y_pred, average='micro', zero_division=0)
    bal_acc = balanced_accuracy_score(y_true, y_pred)
    
    return {
        "Top-1": top1_hits / n,
        "Top-3": top3_hits / n,
        "Top-5": top5_hits / n,
        "MRR": mrr_sum / n,
        "NDCG@5": ndcg5_sum / n,
        "Macro Precision": macro_p,
        "Macro Recall": macro_r,
        "Macro F1": macro_f1,
        "Micro Precision": micro_p,
        "Micro Recall": micro_r,
        "Micro F1": micro_f1,
        "Balanced Accuracy": bal_acc
    }

ground_truths = [p["ground_truth"] for p in preds]

modes = {
    "Profile-only": [p["profile_scores"] for p in preds],
    "Assessment-only": [p["assessment_scores"] for p in preds],
    "Current Fusion": [p["fusion_scores"] for p in preds],
    "Fusion (without Skills)": [p["ablations"]["without_skills"] for p in preds],
    "Fusion (without Interests)": [p["ablations"]["without_interests"] for p in preds],
    "Fusion (without Projects)": [p["ablations"]["without_projects"] for p in preds],
    "Fusion (without Academics)": [p["ablations"]["without_academics"] for p in preds],
    "Fusion (without Certifications)": [p["ablations"]["without_certifications"] for p in preds],
    "Fusion (without Coding)": [p["ablations"]["without_coding"] for p in preds],
    "Fusion (without Goals)": [p["ablations"]["without_goals"] for p in preds]
}

results = []
for mode_name, scores in modes.items():
    metrics = compute_metrics_for_mode(scores, ground_truths)
    metrics["Mode"] = mode_name
    results.append(metrics)
    
df_results = pd.DataFrame(results)
# Reorder columns
cols = ["Mode", "Top-1", "Top-3", "Top-5", "MRR", "NDCG@5", "Macro Precision", "Macro Recall", "Macro F1", "Micro Precision", "Micro Recall", "Micro F1", "Balanced Accuracy"]
df_results = df_results[cols]

# Save recommendation and ablation metrics
df_main = df_results[df_results["Mode"].isin(["Profile-only", "Assessment-only", "Current Fusion"])]
df_main.to_csv(os.path.join(eval_dir, "07_recommendation_metrics.csv"), index=False)

df_ablation = df_results[df_results["Mode"].str.startswith("Fusion (without")]
# Also add Current Fusion to ablation for baseline
df_ablation = pd.concat([df_main[df_main["Mode"] == "Current Fusion"], df_ablation])
df_ablation.to_csv(os.path.join(eval_dir, "14_ablation_metrics.csv"), index=False)

# Bootstrapping (1000 samples)
np.random.seed(42)
n_samples = 1000
n_obs = len(preds)

boot_results = []
for mode_name in ["Profile-only", "Assessment-only", "Current Fusion"]:
    scores = modes[mode_name]
    top1s, top3s, top5s, mrrs, ndcgs, macro_f1s = [], [], [], [], [], []
    
    # Pre-calculate hits and ranks for each student
    student_metrics = []
    for i, s in enumerate(scores):
        gt = ground_truths[i]
        ranked = sorted(s.items(), key=lambda x: x[1], reverse=True)
        ranked_careers = [k for k, v in ranked]
        pred = ranked_careers[0] if ranked_careers else ""
        try:
            rank = ranked_careers.index(gt) + 1
        except:
            rank = -1
        
        top1 = 1 if rank == 1 else 0
        top3 = 1 if 0 < rank <= 3 else 0
        top5 = 1 if 0 < rank <= 5 else 0
        mrr = 1.0 / rank if rank > 0 else 0
        
        rel = [1 if c == gt else 0 for c in ranked_careers[:5]]
        idcg = dcg(sorted(rel, reverse=True))
        ndcg = dcg(rel) / idcg if idcg > 0 else 0
        
        student_metrics.append((top1, top3, top5, mrr, ndcg, gt, pred))
        
    for _ in range(n_samples):
        indices = np.random.randint(0, n_obs, n_obs)
        sample = [student_metrics[i] for i in indices]
        
        top1s.append(np.mean([s[0] for s in sample]))
        top3s.append(np.mean([s[1] for s in sample]))
        top5s.append(np.mean([s[2] for s in sample]))
        mrrs.append(np.mean([s[3] for s in sample]))
        ndcgs.append(np.mean([s[4] for s in sample]))
        
        y_true_s = [s[5] for s in sample]
        y_pred_s = [s[6] for s in sample]
        mf1 = precision_recall_fscore_support(y_true_s, y_pred_s, average='macro', zero_division=0)[2]
        macro_f1s.append(mf1)
        
    boot_results.append({
        "Mode": mode_name,
        "Top-1_95CI": f"({np.percentile(top1s, 2.5):.4f}, {np.percentile(top1s, 97.5):.4f})",
        "Top-3_95CI": f"({np.percentile(top3s, 2.5):.4f}, {np.percentile(top3s, 97.5):.4f})",
        "Top-5_95CI": f"({np.percentile(top5s, 2.5):.4f}, {np.percentile(top5s, 97.5):.4f})",
        "MRR_95CI": f"({np.percentile(mrrs, 2.5):.4f}, {np.percentile(mrrs, 97.5):.4f})",
        "NDCG@5_95CI": f"({np.percentile(ndcgs, 2.5):.4f}, {np.percentile(ndcgs, 97.5):.4f})",
        "MacroF1_95CI": f"({np.percentile(macro_f1s, 2.5):.4f}, {np.percentile(macro_f1s, 97.5):.4f})"
    })
pd.DataFrame(boot_results).to_csv(os.path.join(eval_dir, "10_bootstrap_confidence_intervals.csv"), index=False)

# Student-level effects (Fusion vs Profile)
effects = []
for i in range(n_obs):
    gt = ground_truths[i]
    
    # Profile
    p_ranked = sorted(modes["Profile-only"][i].items(), key=lambda x: x[1], reverse=True)
    p_careers = [k for k, v in p_ranked]
    try: p_rank = p_careers.index(gt) + 1
    except: p_rank = -1
    p_mrr = 1.0 / p_rank if p_rank > 0 else 0
    p_top1 = 1 if p_rank == 1 else 0
    
    # Fusion
    f_ranked = sorted(modes["Current Fusion"][i].items(), key=lambda x: x[1], reverse=True)
    f_careers = [k for k, v in f_ranked]
    try: f_rank = f_careers.index(gt) + 1
    except: f_rank = -1
    f_mrr = 1.0 / f_rank if f_rank > 0 else 0
    f_top1 = 1 if f_rank == 1 else 0
    
    diff = f_mrr - p_mrr
    if diff > 0: status = "IMPROVED"
    elif diff < 0: status = "WORSENED"
    else: status = "UNCHANGED"
    
    effects.append({
        "student_id": preds[i]["student_id"],
        "ground_truth": gt,
        "profile_rank": p_rank,
        "fusion_rank": f_rank,
        "profile_mrr": p_mrr,
        "fusion_mrr": f_mrr,
        "effect": status
    })
df_effects = pd.DataFrame(effects)
df_effects.to_csv(os.path.join(eval_dir, "12_student_level_effects.csv"), index=False)

effect_counts = df_effects["effect"].value_counts()
print("\nStudent Level Effects:")
print(effect_counts)

# Per-career metrics for Fusion
fusion_scores = modes["Current Fusion"]
y_true_f = ground_truths
y_pred_f = []
ranks_f = []
for i, s in enumerate(fusion_scores):
    gt = ground_truths[i]
    ranked = sorted(s.items(), key=lambda x: x[1], reverse=True)
    ranked_careers = [k for k, v in ranked]
    y_pred_f.append(ranked_careers[0] if ranked_careers else "")
    try: rank = ranked_careers.index(gt) + 1
    except: rank = -1
    ranks_f.append(rank)

career_metrics = []
unique_careers = sorted(list(set(y_true_f)))
for c in unique_careers:
    c_indices = [i for i, gt in enumerate(y_true_f) if gt == c]
    support = len(c_indices)
    if support == 0: continue
    c_ranks = [ranks_f[i] for i in c_indices]
    
    top1 = sum(1 for r in c_ranks if r == 1) / support
    top3 = sum(1 for r in c_ranks if 0 < r <= 3) / support
    mrr = sum(1.0/r for r in c_ranks if r > 0) / support
    avg_rank = np.mean([r for r in c_ranks if r > 0])
    
    career_metrics.append({
        "Career": c,
        "Support": support,
        "Top-1 Hit Rate": top1,
        "Top-3 Hit Rate": top3,
        "Mean Reciprocal Rank (Contribution)": mrr,
        "Average Predicted Rank": avg_rank
    })
pd.DataFrame(career_metrics).to_csv(os.path.join(eval_dir, "08_per_career_metrics.csv"), index=False)

# Ranking metrics for each student (saving just a summary or full)
ranking_metrics = []
for i in range(n_obs):
    ranking_metrics.append({
        "student_id": preds[i]["student_id"],
        "ground_truth": ground_truths[i],
        "true_career_rank": ranks_f[i],
        "reciprocal_rank": 1.0 / ranks_f[i] if ranks_f[i] > 0 else 0
    })
pd.DataFrame(ranking_metrics).to_csv(os.path.join(eval_dir, "09_ranking_metrics.csv"), index=False)

# Statistical testing
def run_paired_test(name1, name2):
    mrr1 = []
    mrr2 = []
    for i in range(n_obs):
        gt = ground_truths[i]
        r1 = sorted(modes[name1][i].items(), key=lambda x: x[1], reverse=True)
        rc1 = [k for k, v in r1]
        rank1 = rc1.index(gt) + 1 if gt in rc1 else -1
        mrr1.append(1.0/rank1 if rank1 > 0 else 0)
        
        r2 = sorted(modes[name2][i].items(), key=lambda x: x[1], reverse=True)
        rc2 = [k for k, v in r2]
        rank2 = rc2.index(gt) + 1 if gt in rc2 else -1
        mrr2.append(1.0/rank2 if rank2 > 0 else 0)
        
    diffs = np.array(mrr1) - np.array(mrr2)
    stat, p_val = stats.wilcoxon(mrr1, mrr2)
    mean_diff = np.mean(diffs)
    
    return {
        "Comparison": f"{name1} vs {name2}",
        "Absolute Diff (Mean MRR)": mean_diff,
        "p-value": p_val,
        "Statistically Significant (alpha=0.05)": p_val < 0.05
    }

stat_results = [
    run_paired_test("Current Fusion", "Profile-only"),
    run_paired_test("Current Fusion", "Assessment-only")
]
pd.DataFrame(stat_results).to_csv(os.path.join(eval_dir, "11_statistical_comparisons.csv"), index=False)

print("All recommendation and ranking metrics computed successfully.")
