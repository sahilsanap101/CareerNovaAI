"""
Run BYSER Evaluation
--------------------
Loads eval_dataset.csv, runs the exact BYSER scoring logic ported from TS,
and computes P@1, P@3, R@3, and the confusion matrix.

METHODOLOGY NOTE:
The "ground truth" labels in this dataset are self-generated synthetically 
and explicitly correlated with the scoring weights of the same domains. 
This means this is a SANITY-CHECK structural validation of the algorithm mapping, 
NOT an independently sourced empirical ground truth. High accuracy here validates code wiring, 
but does not replace real-world human-labeled dataset validation.
"""

import csv
import json
import math
import os

# Ported Canonical Rules
SKILL_ALIASES = {
  'C': ['c language'],
  'C++': ['cpp', 'c plus plus'],
  'Java': ['java 8', 'core java'],
  'Python': ['python 3', 'py', 'python3'],
  'JavaScript': ['js', 'javascript', 'vanilla js', 'ecmascript', 'es6'],
  'TypeScript': ['ts', 'typescript'],
  'Go': ['golang', 'go language'],
  'Rust': ['rustlang'],
  'HTML': ['html5'],
  'CSS': ['css3', 'cascading style sheets'],
  'React': ['reactjs', 'react.js'],
  'Angular': ['angularjs', 'angular.js', 'angular 2+'],
  'Vue': ['vuejs', 'vue.js'],
  'Node.js': ['nodejs', 'node', 'node js'],
  'Express': ['expressjs', 'express.js'],
  'Spring Boot': ['springboot', 'spring'],
  'Django': ['django framework'],
  'MySQL': ['my sql'],
  'PostgreSQL': ['postgres', 'postgre sql'],
  'MongoDB': ['mongo', 'mongo db'],
  'Redis': [],
  'AWS': ['amazon web services'],
  'Azure': ['microsoft azure'],
  'GCP': ['google cloud platform', 'google cloud'],
  'Docker': ['docker containers'],
  'Kubernetes': ['k8s'],
  'GitHub Actions': ['github actions', 'gh actions'],
  'Linux': ['linux os', 'ubuntu', 'kali linux'],
  'Networking': ['computer networks', 'network fundamentals'],
  'Burp Suite': ['burpsuite', 'burp'],
  'Wireshark': [],
  'Metasploit': [],
  'Machine Learning': ['ml'],
  'TensorFlow': ['tf'],
  'PyTorch': ['pytorch'],
  'SQL': ['sql query', 'structured query language']
}

def normalize(name):
    if not name: return ""
    cleaned = str(name).strip().lower()
    for k in SKILL_ALIASES:
        if k.lower() == cleaned: return k
    for k, aliases in SKILL_ALIASES.items():
        if any(a.lower() == cleaned for a in aliases): return k
    return cleaned

CAREERS = [
    {
        'name': 'Frontend Developer',
        'category': 'Web Development',
        'reqs': [
            {'name': 'React', 'weight': 10},
            {'name': 'TypeScript', 'weight': 9},
            {'name': 'JavaScript', 'weight': 9},
            {'name': 'HTML', 'weight': 8},
            {'name': 'CSS', 'weight': 8},
        ]
    },
    {
        'name': 'Backend Developer',
        'category': 'Software Engineering',
        'reqs': [
            {'name': 'Node.js', 'weight': 10},
            {'name': 'Express', 'weight': 9},
            {'name': 'PostgreSQL', 'weight': 9},
            {'name': 'Redis', 'weight': 8},
            {'name': 'Docker', 'weight': 8},
            {'name': 'Go', 'weight': 7},
        ]
    },
    {
        'name': 'AI Engineer',
        'category': 'AI & Data',
        'reqs': [
            {'name': 'Python', 'weight': 10},
            {'name': 'Machine Learning', 'weight': 10},
            {'name': 'PyTorch', 'weight': 9},
            {'name': 'TensorFlow', 'weight': 9},
        ]
    }
]

BYSER_WEIGHTS = {
    'SKILLS': 0.35,
    'INTERESTS': 0.20,
    'PROJECTS': 0.15,
    'ACADEMIC': 0.10,
    'CERTIFICATIONS': 0.10,
    'CODING': 0.05,
    'GOALS': 0.05,
    'MARKET_ALIGNMENT': 0.15
}

def evaluate(student, career, enable_market=False):
    # 1. Skills
    total_req = sum(r['weight'] for r in career['reqs'])
    earned = 0
    for req in career['reqs']:
        rn = normalize(req['name'])
        for s in student['skills']:
            if normalize(s['name']) == rn:
                earned += req['weight'] * (s['proficiency']/5)
                break
    skill_score = (earned/total_req)*100 if total_req > 0 else 50
    sgi = max(0, min(100, round(100 - skill_score)))

    # 2. Interests
    has_interest = False
    for i in student['interests']:
        if career['category'].lower() in i.lower() or career['name'].lower() in i.lower() or i.lower() in career['name'].lower() or i.lower() in career['category'].lower():
            has_interest = True
    interest_score = 90 if has_interest else (50 if student['interests'] else 30)

    # 3. Projects
    matching_projects = 0
    for p in student['projects']:
        for req in career['reqs']:
            if normalize(req['name']).lower() in p.lower():
                matching_projects += 1
                break
    project_score = min(100, matching_projects * 40)

    # 4. Academic
    cgpa = student['cgpa'] if student['cgpa'] else 7.0
    academic = min(100, (cgpa/10)*100)

    # 5. Certs
    certs = min(100, student['certifications_count'] * 35)

    # 6. Coding
    coding = min(100, (student['coding_solved']/200)*100) if student['coding_solved'] > 0 else 30

    # 7. Goals
    pref = student['preferred_role'].lower()
    is_goal = False
    if pref:
        if career['name'].lower() in pref or pref in career['name'].lower():
            is_goal = True
    goal_score = 100 if is_goal else (60 if pref else 40)
    
    market_bonus = 0
    if enable_market:
        try:
            with open('research/results/market_demand.json', 'r', encoding='utf-8') as f:
                market_dict = json.load(f)
            total_s = 0
            counted = 0
            for req in career['reqs']:
                rn = normalize(req['name'])
                if rn in market_dict:
                    total_s += market_dict[rn]
                    counted += 1
            avg_m = (total_s / counted) if counted > 0 else 0
            market_bonus = avg_m * BYSER_WEIGHTS['MARKET_ALIGNMENT'] * 100
        except Exception:
            pass
            
    total = (skill_score * BYSER_WEIGHTS['SKILLS'] +
             interest_score * BYSER_WEIGHTS['INTERESTS'] +
             project_score * BYSER_WEIGHTS['PROJECTS'] +
             academic * BYSER_WEIGHTS['ACADEMIC'] +
             certs * BYSER_WEIGHTS['CERTIFICATIONS'] +
             coding * BYSER_WEIGHTS['CODING'] +
             goal_score * BYSER_WEIGHTS['GOALS']) + market_bonus
             
    if total > 100:
        total = 100
    
    match_score = max(0, min(100, round(total * (1 - (sgi/200)))))
    return match_score

def main():
    rows = []
    with open('research/eval_dataset.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                'id': row['student_id'],
                'truth': row['ground_truth'],
                'skills': json.loads(row['skills']),
                'interests': json.loads(row['interests']),
                'projects': json.loads(row['projects']), # just tech string list
                'cgpa': float(row['cgpa']) if row['cgpa'] else None,
                'certifications_count': int(row['certifications_count']),
                'coding_solved': int(row['coding_solved']),
                'preferred_role': row['preferred_role']
            })

    hits_at_1 = 0
    hits_at_3 = 0
    
    # confusion matrix
    cm = {c['name']: {c2['name']: 0 for c2 in CAREERS} for c in CAREERS}
    
    all_res = []

    for r in rows:
        scores = []
        for c in CAREERS:
            s = evaluate(r, c)
            scores.append((c['name'], s))
        scores.sort(key=lambda x: x[1], reverse=True)
        
        truth = r['truth']
        top1 = scores[0][0]
        top3 = [x[0] for x in scores[:3]]
        
        if truth == top1:
            hits_at_1 += 1
        if truth in top3:
            hits_at_3 += 1
            
        cm[truth][top1] += 1
        
        all_res.append({
            'id': r['id'],
            'truth': truth,
            'scores': scores
        })

    n = len(rows)
    p1 = hits_at_1 / n

    # Compute metrics
    metrics = {}
    macro_f1 = 0
    for c in CAREERS:
        tname = c['name']
        TP = cm[tname][tname]
        FP = sum(cm[other['name']][tname] for other in CAREERS if other['name'] != tname)
        FN = sum(cm[tname][other['name']] for other in CAREERS if other['name'] != tname)
        
        precision = TP / (TP + FP) if (TP + FP) > 0 else 0
        recall = TP / (TP + FN) if (TP + FN) > 0 else 0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        metrics[tname] = {'P': precision, 'R': recall, 'F1': f1}
        macro_f1 += f1
        
    macro_f1 /= len(CAREERS)

    os.makedirs('research/results', exist_ok=True)
    with open('research/results/eval_results.json', 'w') as f:
        json.dump({'p1': p1, 'macro_f1': macro_f1, 'metrics': metrics, 'samples': n, 'cm': cm}, f, indent=2)

    with open('research/results/eval_summary.md', 'w') as f:
        f.write("# BYSER Evaluation Results (Synthetic)\n\n")
        f.write("> **METHODOLOGY WARNING**: The dataset evaluated here was self-generated synthetically using domain correlation boundaries. It is NOT independently sourced empirical ground truth. It acts as a sanity-check for script algorithm wiring.\n\n")
        
        if p1 > 0.95:
            f.write("> ⚠️ **WARNING**: Precision@1 exceeds 95%. This flags extreme circular validation due to synthetic labels matching the feature distributions almost perfectly. Manual review of noise parameters is required for research claims.\n\n")
            
        f.write(f"- **Precision@1**: {p1*100:.1f}%\n")
        f.write(f"- **Macro-F1 Score**: {macro_f1*100:.1f}%\n\n")
        
        f.write("### Per-Class Metrics\n")
        f.write("| Class | Precision | Recall | F1 Score |\n")
        f.write("|---|---|---|---|\n")
        for tname, m in metrics.items():
            f.write(f"| **{tname}** | {m['P']*100:.1f}% | {m['R']*100:.1f}% | {m['F1']*100:.1f}% |\n")
        f.write("\n")
        
        f.write("### Confusion Matrix (Rows=Truth, Cols=Predicted Top1)\n")
        f.write("| Truth \\ Predicted | " + " | ".join([c['name'] for c in CAREERS]) + " |\n")
        f.write("|" + "---|" * (len(CAREERS)+1) + "\n")
        for truth in CAREERS:
            tname = truth['name']
            row_str = f"| **{tname}** |"
            for pred in CAREERS:
                pname = pred['name']
                row_str += f" {cm[tname][pname]} |"
            f.write(row_str + "\n")

    print(f"Done. p1={p1:.3f} macro_f1={macro_f1:.3f}")

if __name__ == '__main__':
    main()
