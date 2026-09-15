import pandas as pd
import json
import os
from scipy.stats import chi2_contingency
from run_evaluation import evaluate, CAREERS

def to_md_table(ct):
    cols = ['Group'] + list(ct.columns)
    md = f"| {' | '.join(cols)} |\n"
    md += f"| {' | '.join(['---']*len(cols))} |\n"
    for i, row in ct.iterrows():
        r = [str(i)] + [str(x) for x in row.values]
        md += f"| {' | '.join(r)} |\n"
    return md

def main():
    # 1. Load profiles (currently using synthetic eval_dataset.csv as real data isn't collected yet)
    df = pd.read_csv('research/eval_dataset.csv')
    
    results = []
    for _, row in df.iterrows():
        packed_r = {
            'id': row['student_id'],
            'truth': row['ground_truth'],
            'skills': json.loads(row['skills']),
            'interests': json.loads(row['interests']),
            'projects': json.loads(row['projects']),
            'cgpa': float(row['cgpa']) if not pd.isna(row['cgpa']) else None,
            'certifications_count': int(row['certifications_count']),
            'coding_solved': int(row['coding_solved']),
            'preferred_role': str(row['preferred_role']) if not pd.isna(row['preferred_role']) else ""
        }
        
        # Run base BYSER engine
        scores = []
        for c in CAREERS:
            s_base = evaluate(packed_r, c, enable_market=False)
            scores.append((c['name'], s_base))
        scores.sort(key=lambda x: x[1], reverse=True)
        
        results.append({
            'gender': row['gender'],
            'category': row['category'],
            'recommended_domain': scores[0][0]
        })
        
    res_df = pd.DataFrame(results)
    
    # Pre-processing: Collapse sparse categories to satisfy Chi-Square validity rules (expected counts >= 5)
    res_df['gender_collapsed'] = res_df['gender'].apply(lambda x: 'Other/Undisclosed' if x in ['Non-Binary', 'Prefer not to say'] else x)
    res_df['category_collapsed'] = res_df['category'].apply(lambda x: 'Other/Undisclosed' if x == 'Prefer not to say' else x)
    
    os.makedirs('research/results', exist_ok=True)
    with open('research/results/fairness_audit.md', 'w', encoding='utf-8') as f:
        f.write("# Algorithmic Fairness Audit: Demographic Independence\n\n")
        f.write("> **Note on Synthetic Data & Target Independence**: The demographic fields (Gender, Category) generated within `eval_dataset.csv` were assigned uniformly at random, completely independently of the profile's skills, interests, or ground-truth career label (N=200). Therefore, finding 'no skew' is mathematically guaranteed by construction. This audit serves strictly as a sanity-check confirming the evaluation script pipeline functions correctly. It is **NOT** a meaningful validation of algorithmic fairness. A true fairness audit must be re-run manually once real student demographic inputs organically populate the feedback architecture (N=30+).\n\n")
        
        # Evaluate Gender Independence
        f.write("### 1. Gender Distribution Assessment\n")
        f.write("*Note: To satisfy Chi-Square approximation validity assumptions (requiring expected cell counts ≥ 5), sparse demographic categories ('Non-Binary', 'Prefer not to say') were merged into an 'Other/Undisclosed' group prior to calculation.*\n\n")
        ct_gender = pd.crosstab(res_df['gender_collapsed'], res_df['recommended_domain'])
        f.write("#### Contingency Table\n")
        f.write(to_md_table(ct_gender) + "\n\n")
        
        chi2_g, p_g, dof_g, ex_g = chi2_contingency(ct_gender)
        f.write(f"**Chi-Square Statistic**: {chi2_g:.2f}\n")
        f.write(f"**p-value**: {p_g:.3f}\n\n")
        
        f.write("**Interpretation**: ")
        if p_g < 0.05:
            f.write("The analysis detected a statistically significant association within this synthetic sample denoting correlation between categorical distributions and outputs.\n\n")
        else:
            f.write("No statistically significant association between gender subgroups and recommendation outputs was detected in this synthetic sample. Crucially, the absence of detected skew here is *not* proof of an unbiased algorithm. A definitive fairness evaluation cannot be claimed until real student populations with organic trait-clustering are evaluated.\n\n")

        # Evaluate Category/Reservation Independence
        f.write("---\n")
        f.write("### 2. Category Background Assessment\n")
        f.write("*Note: Similar to gender, the sparse 'Prefer not to say' category subgroup was collapsed into an 'Other/Undisclosed' group to prevent expected cell counts under 5 invalidating the Chi-Square approximation.*\n\n")
        ct_cat = pd.crosstab(res_df['category_collapsed'], res_df['recommended_domain'])
        f.write("#### Contingency Table\n")
        f.write(to_md_table(ct_cat) + "\n\n")
        
        chi2_c, p_c, dof_c, ex_c = chi2_contingency(ct_cat)
        f.write(f"**Chi-Square Statistic**: {chi2_c:.2f}\n")
        f.write(f"**p-value**: {p_c:.3f}\n\n")
        
        f.write("**Interpretation**: ")
        if p_c < 0.05:
            f.write("The analysis detected a statistically significant association denoting correlation between defined social categories and final model outputs within the random variables.\n")
        else:
            f.write("No statistically significant association was detected between social category parameters and the deterministic recommendations. Again, relying uniquely on randomly generated variables means this result absolutely does *not* assert or guarantee fairness in production logic.\n")
            
if __name__ == '__main__':
    main()
