import pandas as pd
import numpy as np
import json
import time
from sklearn.model_selection import StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import precision_recall_fscore_support

def run_ml_comparison():
    import os
    df = pd.read_csv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../research/data/student_dataset_500_development.csv')))
    df = df[df['career_preference'].notna()]
    df = df[df['career_preference'] != 'Unknown']

    # Filter classes with fewer than 5 samples to allow 5-fold CV
    class_counts = df['career_preference'].value_counts()
    valid_classes = class_counts[class_counts >= 5].index
    df = df[df['career_preference'].isin(valid_classes)]

    # Feature extraction (numerical columns)
    exclude_cols = ['student_id', 'branch', 'career_preference']
    feature_cols = [c for c in df.columns if c not in exclude_cols and pd.api.types.is_numeric_dtype(df[c])]
    
    X = df[feature_cols].fillna(0).values
    y = df['career_preference'].values
    
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=50, random_state=42)
    }
    
    results = {
        'class_distribution': class_counts.to_dict(),
        'models': {}
    }

    for name, model in models.items():
        print(f"Training {name}...")
        fold_metrics = []
        total_time = 0
        total_inf = 0

        for train_idx, test_idx in skf.split(X, y):
            X_train, X_test = X[train_idx], X[test_idx]
            y_train, y_test = y[train_idx], y[test_idx]
            
            model.fit(X_train, y_train)
            
            start = time.time()
            # Top 5 predictions
            probs = model.predict_proba(X_test)
            total_time += (time.time() - start)
            total_inf += len(X_test)
            
            top5_indices = np.argsort(probs, axis=1)[:, -5:][:, ::-1]
            classes = model.classes_
            
            t1=0; t3=0; t5=0
            preds_1 = []
            for i, target in enumerate(y_test):
                pred_classes = classes[top5_indices[i]]
                preds_1.append(pred_classes[0])
                if target in pred_classes[:1]: t1+=1
                if target in pred_classes[:3]: t3+=1
                if target in pred_classes[:5]: t5+=1
                
            p, r, f, _ = precision_recall_fscore_support(y_test, preds_1, average='macro', zero_division=0)
            
            fold_metrics.append({
                'top1': t1 / len(y_test),
                'top3': t3 / len(y_test),
                'top5': t5 / len(y_test),
                'macroP': p,
                'macroR': r,
                'macroF1': f
            })
            
        def get_stats(key):
            vals = [m[key] for m in fold_metrics]
            return {'mean': float(np.mean(vals)), 'std': float(np.std(vals))}
            
        results['models'][name] = {
            'top1': get_stats('top1'),
            'top3': get_stats('top3'),
            'top5': get_stats('top5'),
            'macroP': get_stats('macroP'),
            'macroR': get_stats('macroR'),
            'macroF1': get_stats('macroF1'),
            'runtime_ms': (total_time / total_inf) * 1000 if total_inf > 0 else 0
        }
        
    with open('ml_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("Done ML comparison!")

if __name__ == '__main__':
    run_ml_comparison()
