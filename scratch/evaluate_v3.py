import pandas as pd
import numpy as np
import scipy.stats as stats
import json
import os

np.random.seed(42)
base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"

df = pd.read_csv(os.path.join(base_dir, "scratch/synthetic_v3_raw_scores.csv"))

ratios = {
    "M0": (1.0, 0.0),
    "M1": (0.0, 1.0),
    "M2": (0.5, 0.5),
    "M3": (0.6, 0.4),
    "M4": (0.7, 0.3),
    "M5": (0.8, 0.2),
    "M6": (0.3, 0.7),
    "M7": (0.4, 0.6),
    "M8": (0.2, 0.8)
}

def get_ndcg(rank, k=5):
    if rank <= k:
        return 1.0 / np.log2(rank + 1)
    return 0.0

def evaluate_predictions(group, p_col):
    # Tie-breaking: score desc, then career_name asc
    group = group.sort_values(by=[p_col, "career_name"], ascending=[False, True]).reset_index()
    # Rank is 1-indexed
    target_rank = group[group["ground_truth"] == 1].index[0] + 1
    top1 = group.loc[0, "ground_truth"] == 1
    pred_top1 = group.loc[0, "career_name"]
    target_career = group[group["ground_truth"] == 1]["career_name"].values[0]
    
    return {
        "student_id": group["student_id"].iloc[0],
        "target": target_career,
        "predicted_top1": pred_top1,
        "rank": target_rank,
        "top1": 1 if target_rank == 1 else 0,
        "top3": 1 if target_rank <= 3 else 0,
        "top5": 1 if target_rank <= 5 else 0,
        "rr": 1.0 / target_rank,
        "ndcg5": get_ndcg(target_rank),
        "full_ranked_list": group["career_name"].tolist()
    }

metrics_test = []
metrics_val = []
predictions_out = []
student_effects = []
bootstrap_ci = []
per_career = []

conditions = ["A", "B", "C"]

for c in conditions:
    cond_df = df[df["condition"] == c]
    val_df = cond_df[cond_df["split"] == "VALIDATION"]
    test_df = cond_df[cond_df["split"] == "TEST"]
    
    val_results = {}
    test_results = {}
    
    for m_name, (w_p, w_q) in ratios.items():
        val_df = val_df.copy()
        test_df = test_df.copy()
        val_df[f"score_{m_name}"] = val_df["p_score"] * w_p + val_df["q_score"] * w_q
        test_df[f"score_{m_name}"] = test_df["p_score"] * w_p + test_df["q_score"] * w_q
        
        # Validation Eval
        val_evals = val_df.groupby("student_id").apply(lambda g: pd.Series(evaluate_predictions(g, f"score_{m_name}"))).reset_index(drop=True)
        val_results[m_name] = val_evals
        
        metrics_val.append({
            "condition": c,
            "model": m_name,
            "fusion_ratio": f"{int(w_p*100)}:{int(w_q*100)}",
            "top1": val_evals["top1"].mean(),
            "top3": val_evals["top3"].mean(),
            "top5": val_evals["top5"].mean(),
            "mrr": val_evals["rr"].mean(),
            "ndcg5": val_evals["ndcg5"].mean()
        })
        
        # Test Eval
        test_evals = test_df.groupby("student_id").apply(lambda g: pd.Series(evaluate_predictions(g, f"score_{m_name}"))).reset_index(drop=True)
        test_results[m_name] = test_evals
        
        metrics_test.append({
            "condition": c,
            "model": m_name,
            "fusion_ratio": f"{int(w_p*100)}:{int(w_q*100)}",
            "split": "TEST",
            "top1": test_evals["top1"].mean(),
            "top3": test_evals["top3"].mean(),
            "top5": test_evals["top5"].mean(),
            "mrr": test_evals["rr"].mean(),
            "ndcg5": test_evals["ndcg5"].mean(),
            "macro_precision": 0, # Will fill later
            "macro_recall": 0,
            "macro_f1": 0
        })
        
        # Store predictions for M0 and M4
        if m_name in ["M0", "M4"]:
            for _, row in test_evals.iterrows():
                predictions_out.append({
                    "student_id": row["student_id"],
                    "condition": c,
                    "model": m_name,
                    "ground_truth": row["target"],
                    "predicted_top1": row["predicted_top1"],
                    "rank_of_ground_truth": row["rank"],
                    "full_ranked_career_list": "|".join(row["full_ranked_list"])
                })

    # Statistical Comparison M4 vs M0 on TEST
    t_m0 = test_results["M0"]
    t_m4 = test_results["M4"]
    
    merged = t_m4.merge(t_m0, on="student_id", suffixes=("_m4", "_m0"))
    
    # Student Effects
    merged["rank_change"] = merged["rank_m0"] - merged["rank_m4"]  # positive means improved (smaller rank)
    
    improved = (merged["rank_change"] > 0).sum()
    worsened = (merged["rank_change"] < 0).sum()
    unchanged = (merged["rank_change"] == 0).sum()
    total = len(merged)
    
    student_effects.append({
        "condition": c,
        "improved_count": improved,
        "improved_pct": improved / total * 100,
        "worsened_count": worsened,
        "worsened_pct": worsened / total * 100,
        "unchanged_count": unchanged,
        "unchanged_pct": unchanged / total * 100,
        "mean_rank_change": merged["rank_change"].mean(),
        "median_rank_change": merged["rank_change"].median()
    })
    
    # Bootstrap CI and Paired tests
    for metric in ["rr", "ndcg5", "top1", "top3", "top5"]:
        diff = merged[f"{metric}_m4"] - merged[f"{metric}_m0"]
        mean_diff = diff.mean()
        median_diff = diff.median()
        
        # Bootstrap
        n_boot = 1000
        boot_means = [np.mean(np.random.choice(diff, size=total, replace=True)) for _ in range(n_boot)]
        ci_lower = np.percentile(boot_means, 2.5)
        ci_upper = np.percentile(boot_means, 97.5)
        
        # Wilcoxon
        if np.all(diff == 0):
            p_val = 1.0
        else:
            _, p_val = stats.wilcoxon(diff)
            
        bootstrap_ci.append({
            "condition": c,
            "metric": metric,
            "mean_diff": mean_diff,
            "median_diff": median_diff,
            "ci_lower_95": ci_lower,
            "ci_upper_95": ci_upper,
            "p_value": p_val
        })

pd.DataFrame(metrics_test).to_csv(os.path.join(base_dir, "research/results/fusion_comparison_v3_test.csv"), index=False)
pd.DataFrame(metrics_val).to_csv(os.path.join(base_dir, "research/results/fusion_validation_ratio_selection_v3.csv"), index=False)
pd.DataFrame(predictions_out).to_csv(os.path.join(base_dir, "research/results/fusion_predictions_v3.csv"), index=False)
pd.DataFrame(student_effects).to_csv(os.path.join(base_dir, "research/results/fusion_student_effects_v3.csv"), index=False)
pd.DataFrame(bootstrap_ci).to_csv(os.path.join(base_dir, "research/results/fusion_bootstrap_ci_v3.csv"), index=False)

print("Evaluation complete.")
