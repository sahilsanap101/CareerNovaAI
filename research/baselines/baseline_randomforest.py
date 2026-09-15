import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold
import sys
import os

# Allow import from parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from run_evaluation import CAREERS, normalize

def extract_features(student_row):
    """
    Extract structured features mirroring BYSER independent logic 
    flattened into a numerical array mapping standard profile features.
    Length: 12 attributes mapping 3 features across 3 careers + 3 global stats
    """
    f_vec = []
    student_skills = json.loads(student_row['skills'])
    interests = json.loads(student_row['interests'])
    projects = json.loads(student_row['projects'])
    
    # Feature 1: Skills coverage per career
    for c in CAREERS:
        total_req = sum(r['weight'] for r in c['reqs'])
        earned = 0
        for req in c['reqs']:
            rn = normalize(req['name'])
            for s in student_skills:
                if normalize(s['name']) == rn:
                    earned += req['weight'] * (s['proficiency']/5.0)
                    break
        f_vec.append(earned/total_req if total_req > 0 else 0.0)
        
    # Feature 2: Interest coverage per career
    for c in CAREERS:
        has_int = 0
        for i in interests:
            if c['category'].lower() in i.lower() or c['name'].lower() in i.lower() or i.lower() in c['name'].lower():
                has_int = 1
        f_vec.append(has_int)
        
    # Feature 3: Project coverage per career
    for c in CAREERS:
        matching_proj = 0
        for p in projects:
            for req in c['reqs']:
                if normalize(req['name']).lower() in p.lower():
                    matching_proj += 1
                    break
        f_vec.append(matching_proj)
        
    # Global modifiers
    cgpa = float(student_row['cgpa']) if student_row['cgpa'] else 7.0
    f_vec.append(cgpa / 10.0)
    f_vec.append(int(student_row['certifications_count']))
    f_vec.append(int(student_row['coding_solved']) / 200.0)
    
    return np.array(f_vec)

def train_and_eval_rf(train_rows, test_rows):
    X_train = np.array([extract_features(r) for r in train_rows])
    y_train = np.array([r['ground_truth'] for r in train_rows])
    
    X_test = np.array([extract_features(r) for r in test_rows])
    y_test = np.array([r['ground_truth'] for r in test_rows])
    
    # Using default hyperparameters mostly, n_estimators=100
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    
    # 5-fold CV to judge training bounds
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(rf, X_train, y_train, cv=cv, scoring='accuracy')
    with open('research/results/cv_score.txt', 'w') as f:
        f.write(f"**Random Forest 5-Fold CV (Train set, N={len(X_train)}):** {scores.mean()*100:.1f}% ± {scores.std()*100:.1f}%\n")
    
    rf.fit(X_train, y_train)
    y_pred = rf.predict(X_test)
    
    return y_test, y_pred
