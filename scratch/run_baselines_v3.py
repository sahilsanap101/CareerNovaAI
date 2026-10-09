import pandas as pd
import numpy as np
import json
import os
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import precision_recall_fscore_support
import scipy.sparse
import scipy.stats as stats
import warnings
warnings.filterwarnings('ignore')

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"

def get_ndcg(rank, k=5):
    return 1.0 / np.log2(rank + 1) if rank <= k else 0.0

def eval_preds(preds, y_true, classes, student_ids):
    metrics = []
    y_pred_top1 = np.argmax(preds, axis=1)
    
    for i in range(len(y_true)):
        true_class = y_true[i]
        sorted_indices = np.argsort(preds[i])[::-1]
        rank = np.where(sorted_indices == true_class)[0][0] + 1
        
        metrics.append({
            'student_id': student_ids[i],
            'top1': 1 if rank == 1 else 0,
            'top3': 1 if rank <= 3 else 0,
            'top5': 1 if rank <= 5 else 0,
            'rr': 1.0 / rank,
            'ndcg5': get_ndcg(rank),
            'pred_top1_class': classes[y_pred_top1[i]],
            'true_class': classes[true_class],
            'rank_of_ground_truth': rank
        })
    df = pd.DataFrame(metrics)
    
    labels = sorted(list(set(y_true).union(set(y_pred_top1))))
    p, r, f1, s = precision_recall_fscore_support(y_true, y_pred_top1, labels=labels, zero_division=0)
    
    return {
        'top1': df['top1'].mean(),
        'top3': df['top3'].mean(),
        'top5': df['top5'].mean(),
        'mrr': df['rr'].mean(),
        'ndcg5': df['ndcg5'].mean(),
        'macro_precision': p.mean(),
        'macro_recall': r.mean(),
        'macro_f1': f1.mean(),
        'per_career': [{'career': classes[lbl], 'precision': p[i], 'recall': r[i], 'f1': f1[i], 'support': s[i]} for i, lbl in enumerate(labels)],
        'raw': df
    }

def extract_features(df):
    parsed = []
    for _, row in df.iterrows():
        p = json.loads(row['profile_json'])
        feat = {
            'cgpa': p['academic']['cgpa'],
            'problems': p['codingEvidence']['totalProblemsSolved'],
            'year': p['yearStage']['year'],
        }
        feat['skills'] = " ".join([k for k in p['skills'].keys()])
        feat['interests'] = " ".join(p['interests'])
        feat['projects'] = " ".join([t for proj in p['projects'] for t in proj['technologies']])
        feat['certs'] = " ".join([c['title'].replace(" ", "") for c in p['certifications']])
        feat['goals'] = p['careerGoals']['targetRole']
        
        for i in range(1, 21):
            q_key = f'assessment_q{i:02d}'
            feat[q_key] = row[q_key]
            
        parsed.append(feat)
    return pd.DataFrame(parsed)

conditions = ["A", "B", "C"]
label_enc = LabelEncoder()

baseline_comparison = []
baseline_per_career = []
ablation_results = []
assessment_incremental = []
model_predictions = []
bootstrap_results = []

pathforge_preds = pd.read_csv(os.path.join(base_dir, 'research/results/fusion_predictions_v3.csv'))
pathforge_eval = pd.read_csv(os.path.join(base_dir, 'research/results/fusion_comparison_v3_test.csv'))

for c in conditions:
    print(f"Condition {c}...")
    df = pd.read_csv(os.path.join(base_dir, f'research/data/synthetic_v3/synthetic_v3_{c}_split.csv'))
    df['target'] = label_enc.fit_transform(df['career_suitability'])
    classes = label_enc.classes_
    
    train_df = df[df['split'] == 'TRAIN']
    val_df = df[df['split'] == 'VALIDATION']
    test_df = df[df['split'] == 'TEST']
    
    X_train = extract_features(train_df)
    X_val = extract_features(val_df)
    X_test = extract_features(test_df)
    
    y_train = train_df['target'].values
    y_val = val_df['target'].values
    y_test = test_df['target'].values
    student_ids_test = test_df['student_id'].values
    
    assessment_cols = [f'assessment_q{i:02d}' for i in range(1, 21)]
    scalar_cols = ['cgpa', 'problems', 'year']
    text_cols = ['skills', 'interests', 'projects', 'certs', 'goals']
    
    def build_pipeline(feature_set='all', drop_text_col=None):
        transformers = []
        if feature_set in ['all', 'profile']:
            transformers.append(('scalars', SimpleImputer(), scalar_cols))
            for tc in text_cols:
                if tc != drop_text_col:
                    transformers.append((tc, CountVectorizer(max_features=200), tc))
        if feature_set in ['all', 'assessment']:
            transformers.append(('assessment', SimpleImputer(), assessment_cols))
        return ColumnTransformer(transformers, remainder='drop')
    
    configs = [('Profile_Only', 'profile'), ('Assessment_Only', 'assessment'), ('Combined', 'all')]
    models = {
        'RF': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        'XGB': HistGradientBoostingClassifier(max_iter=100, random_state=42)
    }
    
    test_results = {}
    
    for m_name, model in models.items():
        for conf_name, feat_set in configs:
            preprocessor = build_pipeline(feat_set)
            X_tr_mat = preprocessor.fit_transform(X_train)
            X_ts_mat = preprocessor.transform(X_test)
            
            if scipy.sparse.issparse(X_tr_mat):
                X_tr_mat = X_tr_mat.toarray()
            if scipy.sparse.issparse(X_ts_mat):
                X_ts_mat = X_ts_mat.toarray()
            
            model.fit(X_tr_mat, y_train)
            preds = model.predict_proba(X_ts_mat)
            res = eval_preds(preds, y_test, classes, student_ids_test)
            test_results[f"{m_name}_{conf_name}"] = res
            
            baseline_comparison.append({
                'condition': c,
                'model': f"{m_name}_{conf_name}",
                'top1': res['top1'],
                'top3': res['top3'],
                'top5': res['top5'],
                'mrr': res['mrr'],
                'ndcg5': res['ndcg5'],
                'macro_precision': res['macro_precision'],
                'macro_recall': res['macro_recall'],
                'macro_f1': res['macro_f1']
            })
            
            for pc in res['per_career']:
                baseline_per_career.append({
                    'condition': c,
                    'model': f"{m_name}_{conf_name}",
                    **pc
                })
                
            raw_df = res['raw']
            for _, row in raw_df.iterrows():
                model_predictions.append({
                    'student_id': row['student_id'],
                    'condition': c,
                    'model': f"{m_name}_{conf_name}",
                    'ground_truth': row['true_class'],
                    'predicted_top1': row['pred_top1_class'],
                    'rank_of_ground_truth': row['rank_of_ground_truth']
                })
                
            if conf_name == 'Combined':
                prof_res = test_results[f"{m_name}_Profile_Only"]
                ass_res = test_results[f"{m_name}_Assessment_Only"]
                assessment_incremental.append({
                    'condition': c,
                    'model': m_name,
                    'delta_combined_minus_profile_top1': res['top1'] - prof_res['top1'],
                    'delta_combined_minus_assessment_top1': res['top1'] - ass_res['top1'],
                    'delta_combined_minus_profile_ndcg5': res['ndcg5'] - prof_res['ndcg5'],
                    'delta_combined_minus_assessment_ndcg5': res['ndcg5'] - ass_res['ndcg5'],
                    'delta_combined_minus_profile_mrr': res['mrr'] - prof_res['mrr'],
                    'delta_combined_minus_assessment_mrr': res['mrr'] - ass_res['mrr'],
                    'delta_combined_minus_profile_macro_f1': res['macro_f1'] - prof_res['macro_f1'],
                    'delta_combined_minus_assessment_macro_f1': res['macro_f1'] - ass_res['macro_f1']
                })

    # Statistical Comparison (Bootstrap CI)
    def do_bootstrap(name, df_a, df_b, metrics):
        n_boot = 1000
        for metric in metrics:
            diff = df_a[metric].values - df_b[metric].values
            mean_diff = diff.mean()
            median_diff = np.median(diff)
            boot_means = [np.mean(np.random.choice(diff, size=len(diff), replace=True)) for _ in range(n_boot)]
            
            p_val = 1.0
            if not np.all(diff == 0):
                _, p_val = stats.wilcoxon(diff)
                
            bootstrap_results.append({
                'condition': c,
                'comparison': name,
                'metric': metric,
                'mean_diff': mean_diff,
                'median_diff': median_diff,
                'ci_lower_95': np.percentile(boot_means, 2.5),
                'ci_upper_95': np.percentile(boot_means, 97.5),
                'p_value': p_val
            })

    pf_c = pathforge_preds[pathforge_preds['condition'] == c]
    pf_m0 = pf_c[pf_c['model'] == 'M0'].sort_values('student_id')
    pf_m4 = pf_c[pf_c['model'] == 'M4'].sort_values('student_id')
    
    # We must construct a DataFrame matching student_ids order with the RF results
    def align_pf(df):
        aligned = []
        for i, sid in enumerate(student_ids_test):
            row = df[df['student_id'] == sid].iloc[0]
            aligned.append({
                'rr': 1.0 / row['rank_of_ground_truth'],
                'ndcg5': get_ndcg(row['rank_of_ground_truth']),
                'top1': 1 if row['rank_of_ground_truth'] == 1 else 0,
                'top3': 1 if row['rank_of_ground_truth'] <= 3 else 0,
                'top5': 1 if row['rank_of_ground_truth'] <= 5 else 0,
            })
        return pd.DataFrame(aligned)
        
    df_pf_m0 = align_pf(pf_m0)
    df_pf_m4 = align_pf(pf_m4)
    df_rf_comb = test_results["RF_Combined"]['raw']
    df_xgb_comb = test_results["XGB_Combined"]['raw']
    
    metrics_list = ['rr', 'ndcg5', 'top1', 'top3', 'top5']
    do_bootstrap('PATHFORGE_M4_vs_M0', df_pf_m4, df_pf_m0, metrics_list)
    do_bootstrap('RF_Combined_vs_PATHFORGE_M4', df_rf_comb, df_pf_m4, metrics_list)
    do_bootstrap('XGB_Combined_vs_PATHFORGE_M4', df_xgb_comb, df_pf_m4, metrics_list)

    # Ablation (Profile dimensions)
    for dim in ['skills', 'interests', 'projects', 'certs', 'goals', 'academics', 'coding']:
        print(f"Ablating {dim}...")
        if dim == 'academics':
            preproc = ColumnTransformer([
                ('scalars', SimpleImputer(), ['problems', 'year']),
                ('skills', CountVectorizer(max_features=200), 'skills'),
                ('interests', CountVectorizer(max_features=200), 'interests'),
                ('projects', CountVectorizer(max_features=200), 'projects'),
                ('certs', CountVectorizer(max_features=200), 'certs'),
                ('goals', CountVectorizer(max_features=200), 'goals')
            ], remainder='drop')
        elif dim == 'coding':
            preproc = ColumnTransformer([
                ('scalars', SimpleImputer(), ['cgpa', 'year']),
                ('skills', CountVectorizer(max_features=200), 'skills'),
                ('interests', CountVectorizer(max_features=200), 'interests'),
                ('projects', CountVectorizer(max_features=200), 'projects'),
                ('certs', CountVectorizer(max_features=200), 'certs'),
                ('goals', CountVectorizer(max_features=200), 'goals')
            ], remainder='drop')
        else:
            preproc = build_pipeline('profile', drop_text_col=dim)
        
        X_tr_mat = preproc.fit_transform(X_train)
        X_ts_mat = preproc.transform(X_test)
        if scipy.sparse.issparse(X_tr_mat):
            X_tr_mat = X_tr_mat.toarray()
            X_ts_mat = X_ts_mat.toarray()
            
        rf_abl = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
        rf_abl.fit(X_tr_mat, y_train)
        preds = rf_abl.predict_proba(X_ts_mat)
        res = eval_preds(preds, y_test, classes, student_ids_test)
        
        ablation_results.append({
            'condition': c,
            'ablated_dimension': dim,
            'top1': res['top1'],
            'mrr': res['mrr'],
            'ndcg5': res['ndcg5'],
            'macro_f1': res['macro_f1']
        })

pd.DataFrame(baseline_comparison).to_csv(os.path.join(base_dir, 'research/results/baseline_comparison_v3.csv'), index=False)
pd.DataFrame(baseline_per_career).to_csv(os.path.join(base_dir, 'research/results/baseline_per_career_v3.csv'), index=False)
pd.DataFrame(assessment_incremental).to_csv(os.path.join(base_dir, 'research/results/assessment_incremental_information_v3.csv'), index=False)
pd.DataFrame(ablation_results).to_csv(os.path.join(base_dir, 'research/results/profile_dimension_ablation_v3.csv'), index=False)
pd.DataFrame(model_predictions).to_csv(os.path.join(base_dir, 'research/results/model_predictions_v3.csv'), index=False)
pd.DataFrame(bootstrap_results).to_csv(os.path.join(base_dir, 'research/results/model_comparison_bootstrap_v3.csv'), index=False)

print("Baseline training complete.")
