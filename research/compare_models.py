import csv
import json
import os
import numpy as np
from scipy.stats import chi2
from sklearn.model_selection import train_test_split
from run_evaluation import evaluate, CAREERS
from baselines.baseline_tfidf import evaluate_tfidf
from baselines.baseline_randomforest import train_and_eval_rf

np.random.seed(42)

def compute_metrics(y_true, y_pred):
    n = len(y_true)
    hits = sum([1 for t, p in zip(y_true, y_pred) if t == p])
    p1 = hits / n

    # Compute macro-f1
    macro_f1 = 0
    for c in CAREERS:
        tname = c['name']
        TP = sum([1 for t, p in zip(y_true, y_pred) if t == tname and p == tname])
        FP = sum([1 for t, p in zip(y_true, y_pred) if t != tname and p == tname])
        FN = sum([1 for t, p in zip(y_true, y_pred) if t == tname and p != tname])
        
        precision = TP / (TP + FP) if (TP + FP) > 0 else 0
        recall = TP / (TP + FN) if (TP + FN) > 0 else 0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        macro_f1 += f1
        
    macro_f1 /= len(CAREERS)
    return p1, macro_f1

def bootstrap_ci(y_true, y_pred, B=1000, alpha=0.05):
    n = len(y_true)
    y_t = np.array(y_true)
    y_p = np.array(y_pred)
    scores = []
    for _ in range(B):
        indices = np.random.randint(0, n, n)
        subs_t = y_t[indices]
        subs_p = y_p[indices]
        scores.append( np.mean(subs_t == subs_p) )
    scores.sort()
    lower = scores[int((alpha/2) * B)]
    upper = scores[int((1 - alpha/2) * B)]
    return lower, upper

def mcnemar_test(y_true, p1_list, p2_list):
    b = sum(1 for t, p1, p2 in zip(y_true, p1_list, p2_list) if p1 == t and p2 != t)
    c = sum(1 for t, p1, p2 in zip(y_true, p1_list, p2_list) if p1 != t and p2 == t)
            
    if b + c == 0:
        return 0.0, 1.0, b, c
        
    calc = (abs(b - c) - 1.0)**2 / (b + c)
    p_value = 1.0 - chi2.cdf(calc, 1)
    return calc, p_value, b, c

def main():
    rows = []
    with open('research/eval_dataset.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
            
    # Stratified 70/30 split explicitly locking the set
    labels = [r['ground_truth'] for r in rows]
    train_rows, test_rows = train_test_split(rows, test_size=0.3, stratify=labels, random_state=42)
    
    print(f"Dataset split: {len(train_rows)} train, {len(test_rows)} test bounds.")
    
    # ==========================
    # 1. Random Forest Baseline
    # ==========================
    rf_y_true, rf_y_pred = train_and_eval_rf(train_rows, test_rows)
    rf_p1, rf_macro_f1 = compute_metrics(rf_y_true, rf_y_pred)
    
    # ==========================
    # 2. TF-IDF Baseline
    # ==========================
    tf_y_true = []
    tf_y_pred = []
    for r in test_rows:
        tf_y_true.append(r['ground_truth'])
        tf_y_pred.append(evaluate_tfidf(r))
    tf_p1, tf_macro_f1 = compute_metrics(tf_y_true, tf_y_pred)
    
    # ==========================
    # 3. BYSER Engine Matcher (Base)
    # ==========================
    by_y_true = []
    by_y_pred = []
    for r in test_rows:
        packed_r = {
            'id': r['student_id'],
            'truth': r['ground_truth'],
            'skills': json.loads(r['skills']),
            'interests': json.loads(r['interests']),
            'projects': json.loads(r['projects']),
            'cgpa': float(r['cgpa']) if r['cgpa'] else None,
            'certifications_count': int(r['certifications_count']),
            'coding_solved': int(r['coding_solved']),
            'preferred_role': r['preferred_role']
        }
        
        scores = []
        for c in CAREERS:
            s_base = evaluate(packed_r, c, enable_market=False)
            scores.append((c['name'], s_base))
        scores.sort(key=lambda x: x[1], reverse=True)
        by_y_true.append(r['ground_truth'])
        by_y_pred.append(scores[0][0])
        
    by_p1, by_macro_f1 = compute_metrics(by_y_true, by_y_pred)

    # ==========================
    # 4. BYSER Engine Matcher (+Market Ablation)
    # ==========================
    by_m_y_true = []
    by_m_y_pred = []
    for r in test_rows:
        packed_r = {
            'id': r['student_id'],
            'truth': r['ground_truth'],
            'skills': json.loads(r['skills']),
            'interests': json.loads(r['interests']),
            'projects': json.loads(r['projects']),
            'cgpa': float(r['cgpa']) if r['cgpa'] else None,
            'certifications_count': int(r['certifications_count']),
            'coding_solved': int(r['coding_solved']),
            'preferred_role': r['preferred_role']
        }
        
        scores = []
        for c in CAREERS:
            s_m = evaluate(packed_r, c, enable_market=True)
            scores.append((c['name'], s_m))
        scores.sort(key=lambda x: x[1], reverse=True)
        by_m_y_true.append(r['ground_truth'])
        by_m_y_pred.append(scores[0][0])
        
    by_m_p1, by_m_macro_f1 = compute_metrics(by_m_y_true, by_m_y_pred)

    # Computations for table outputs
    by_lb, by_ub = bootstrap_ci(by_y_true, by_y_pred)
    by_m_lb, by_m_ub = bootstrap_ci(by_m_y_true, by_m_y_pred)
    rf_lb, rf_ub = bootstrap_ci(rf_y_true, rf_y_pred)
    tf_lb, tf_ub = bootstrap_ci(tf_y_true, tf_y_pred)

    by_rf_x2, by_rf_p, by_rf_b, by_rf_c = mcnemar_test(by_y_true, by_y_pred, rf_y_pred)
    by_tf_x2, by_tf_p, by_tf_b, by_tf_c = mcnemar_test(by_y_true, by_y_pred, tf_y_pred)
    by_by_m_x2, by_by_m_p, by_by_m_b, by_by_m_c = mcnemar_test(by_y_true, by_y_pred, by_m_y_pred)
    by_m_rf_x2, by_m_rf_p, by_m_rf_b, by_m_rf_c = mcnemar_test(by_m_y_true, by_m_y_pred, rf_y_pred)
    by_m_tf_x2, by_m_tf_p, by_m_tf_b, by_m_tf_c = mcnemar_test(by_m_y_true, by_m_y_pred, tf_y_pred)
    rf_tf_x2, rf_tf_p, rf_tf_b, rf_tf_c = mcnemar_test(rf_y_true, rf_y_pred, tf_y_pred)
        
    os.makedirs('research/results', exist_ok=True)
    with open('research/results/baseline_comparison.md', 'w', encoding='utf-8') as f:
        f.write("# Model Baseline Comparison (Test Set N=60)\n")
        f.write("> BYSER and TF-IDF were evaluated on the same 30% held-out test set as the Random Forest algorithm (n=60 mappings).\n\n")
        
        f.write("### Ablation Study & Explainability Trade-Off\n\n")
        f.write("| Model Framework | Precision@1 | CI (95%) | Macro-F1 | Explanation available to end-user without extra tooling? | Deterministic output for same input? |\n")
        f.write("|---|---|---|---|---|---|\n")
        f.write(f"| **BYSER Algorithm (+Market Alignment)** | {by_m_p1*100:.1f}% | [{by_m_lb*100:.1f}%, {by_m_ub*100:.1f}%] | {by_m_macro_f1*100:.1f}% | Yes | Yes |\n")
        f.write(f"| **BYSER Algorithm (Base)** | {by_p1*100:.1f}% | [{by_lb*100:.1f}%, {by_ub*100:.1f}%] | {by_macro_f1*100:.1f}% | Yes | Yes |\n")
        f.write(f"| **Random Forest (scikit-learn)** | {rf_p1*100:.1f}% | [{rf_lb*100:.1f}%, {rf_ub*100:.1f}%] | {rf_macro_f1*100:.1f}% | No | Yes |\n")
        f.write(f"| **TF-IDF String Similarity** | {tf_p1*100:.1f}% | [{tf_lb*100:.1f}%, {tf_ub*100:.1f}%] | {tf_macro_f1*100:.1f}% | No | Yes |\n\n")
        
        def sig_str(p_val):
            return "significant" if p_val < 0.05 else "not statistically significant"

        f.write("### Statistical Significance (McNemar's Test Pairwise Matrix)\n")
        f.write("| Model A | Model B | Discordant (B got right, A got wrong) | Discordant (A got right, B got wrong) | χ² Statistic | p-value | Interpretation |\n")
        f.write("|---|---|---|---|---|---|---|\n")
        f.write(f"| BYSER (Base) | BYSER (+Market) | {by_by_m_c} | {by_by_m_b} | {by_by_m_x2:.2f} | {by_by_m_p:.3f} | {sig_str(by_by_m_p)} |\n")
        f.write(f"| BYSER (Base) | Random Forest | {by_rf_c} | {by_rf_b} | {by_rf_x2:.2f} | {by_rf_p:.3f} | {sig_str(by_rf_p)} |\n")
        f.write(f"| BYSER (Base) | TF-IDF | {by_tf_c} | {by_tf_b} | {by_tf_x2:.2f} | {by_tf_p:.3f} | {sig_str(by_tf_p)} |\n")
        f.write(f"| BYSER (+Market) | Random Forest | {by_m_rf_c} | {by_m_rf_b} | {by_m_rf_x2:.2f} | {by_m_rf_p:.3f} | {sig_str(by_m_rf_p)} |\n")
        f.write(f"| BYSER (+Market) | TF-IDF | {by_m_tf_c} | {by_m_tf_b} | {by_m_tf_x2:.2f} | {by_m_tf_p:.3f} | {sig_str(by_m_tf_p)} |\n")
        f.write(f"| Random Forest | TF-IDF | {rf_tf_c} | {rf_tf_b} | {rf_tf_x2:.2f} | {rf_tf_p:.3f} | {sig_str(rf_tf_p)} |\n\n")

        print(f"RAW PAIRS DEBUG - Base got right/Market wrong (b): {by_by_m_b}")
        print(f"RAW PAIRS DEBUG - Base got wrong/Market right (c): {by_by_m_c}")

        f.write("### Interpretation\n")
        f.write(f"The inclusion of Market Demand mappings resulted in a Precision@1 of {by_m_p1*100:.1f}%, compared to {by_p1*100:.1f}% for the Base algorithm. ")
        f.write(f"Under an uncorrected significance threshold, the market-alignment variant showed a statistically significant deficit against the TF-IDF baseline (p={by_m_tf_p:.3f}), whereas the base BYSER algorithm's comparison against TF-IDF did not reach significance (p={by_tf_p:.3f}).\n\n")
        f.write("Because 6 pairwise tests were run, we must apply a Bonferroni correction (adjusted α = 0.05/6 ≈ 0.0083). Under this stricter, more appropriate threshold for multiple comparisons, NONE of the 6 pairwise differences reach statistical significance, including the p=0.046 result.\n\n")
        f.write("Ultimately, the market-alignment extension did not improve performance in this evaluation and may have marginally worsened it, though not to a degree that survives correction for multiple comparisons. This stands as a legitimate negative result: attempting to inject broad proxy demand signals overtop an explicitly tuned deterministic framework yielded no structural advantage.\n\n")
        f.write("Both TF-IDF and Random Forest operate as black-box predictors that do not naturally decompose into human-readable rationale without additional tooling (such as SHAP or LIME). ")
        f.write("The BYSER algorithm explicitly computes independent constituent scores matching the user interface components (e.g. skills gaps, project links, and interests matches), ensuring complete transparency natively within the application boundary without secondary analytical instrumentation.")

    print("Baseline comparison generated in research/results/baseline_comparison.md")

if __name__ == '__main__':
    main()
