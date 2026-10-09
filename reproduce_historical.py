import csv
import json
import math
import os

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

def evaluate(student, career):
    # 1. Skills
    total_req = sum(r['weight'] for r in career['reqs'])
    earned = 0
    for req in career['reqs']:
        rn = normalize(req['name'])
        for s in student['skills']:
            if normalize(s['name']) == rn:
                earned += req['weight'] * (s['proficiency']/5.0)
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
    academic = min(100, (cgpa/10.0)*100)

    # 5. Certs
    certs = min(100, student['certifications_count'] * 35)

    # 6. Coding
    coding = min(100, (student['coding_solved']/200.0)*100) if student['coding_solved'] > 0 else 30

    # 7. Goals
    pref = student['preferred_role'].lower()
    is_goal = False
    if pref:
        if career['name'].lower() in pref or pref in career['name'].lower():
            is_goal = True
    goal_score = 100 if is_goal else (60 if pref else 40)
    
    total = (skill_score * BYSER_WEIGHTS['SKILLS'] +
             interest_score * BYSER_WEIGHTS['INTERESTS'] +
             project_score * BYSER_WEIGHTS['PROJECTS'] +
             academic * BYSER_WEIGHTS['ACADEMIC'] +
             certs * BYSER_WEIGHTS['CERTIFICATIONS'] +
             coding * BYSER_WEIGHTS['CODING'] +
             goal_score * BYSER_WEIGHTS['GOALS'])
             
    if total > 100:
        total = 100
    
    match_score = max(0, min(100, round(total * (1 - (sgi/200.0)))))
    return match_score

def main():
    # Load Careers from 15-career corrected file
    careers = {}
    with open('research/data/evaluation/career_evaluation_15.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            careers[row['career_name']] = {
                'name': row['career_name'],
                'category': row['domain'],
                'reqs': []
            }
            
    with open('research/data/evaluation/career_skill_evaluation_15_corrected.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cname = row['career_name']
            if cname in careers:
                careers[cname]['reqs'].append({
                    'name': row['skill'],
                    'weight': float(row.get('importance_weight', 5))
                })

    careers_list = list(careers.values())
    print(f"Loaded {len(careers_list)} careers")

    rows = []
    with open('research/data/evaluation/student_dataset_500_development.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            student = {
                'id': row['student_id'],
                'truth': row['career_preference'],
                'skills': [],
                'interests': [],
                'projects': [],
                'cgpa': float(row['cgpa']) if row['cgpa'] else 7.0,
                'certifications_count': int(row['certifications_count']) if row['certifications_count'] else 0,
                'coding_solved': 0, # not in this dataset
                'preferred_role': '' # BLIND EVALUATION
            }
            
            # Map skills
            for k, v in row.items():
                if k not in ['student_id', 'year', 'branch', 'semester', 'cgpa', 'projects_count', 'certifications_count', 'internship_experience', 'career_preference', 'interest_ai_ml', 'interest_data', 'interest_web', 'interest_software', 'interest_cloud', 'interest_cybersecurity']:
                    if v and int(v) > 0:
                        student['skills'].append({'name': k, 'proficiency': int(v)})
                        
            # Map interests
            if int(row.get('interest_ai_ml', 0)) > 0: student['interests'].append('Artificial Intelligence')
            if int(row.get('interest_data', 0)) > 0: student['interests'].append('Data')
            if int(row.get('interest_web', 0)) > 0: student['interests'].append('Web')
            if int(row.get('interest_software', 0)) > 0: student['interests'].append('Software Engineering')
            if int(row.get('interest_cloud', 0)) > 0: student['interests'].append('Cloud')
            if int(row.get('interest_cybersecurity', 0)) > 0: student['interests'].append('Cybersecurity')
            
            rows.append(student)

    hits_at_1 = 0
    hits_at_3 = 0
    hits_at_5 = 0
    mrr_sum = 0
    ndcg5_sum = 0
    
    for r in rows:
        scores = []
        for c in careers_list:
            s = evaluate(r, c)
            scores.append((c['name'], s))
        scores.sort(key=lambda x: x[1], reverse=True)
        
        truth = r['truth']
        rank = -1
        for i, (cname, score) in enumerate(scores):
            if cname.lower() == truth.lower():
                rank = i + 1
                break
                
        if rank == 1: hits_at_1 += 1
        if 1 <= rank <= 3: hits_at_3 += 1
        if 1 <= rank <= 5: hits_at_5 += 1
        
        if rank > 0:
            mrr_sum += 1.0 / rank
            if rank <= 5:
                ndcg5_sum += 1.0 / math.log2(rank + 1)
                
    n = len(rows)
    print(f"Top-1: {(hits_at_1/n)*100:.2f}%")
    print(f"Top-3: {(hits_at_3/n)*100:.2f}%")
    print(f"Top-5: {(hits_at_5/n)*100:.2f}%")
    print(f"MRR: {(mrr_sum/n)*100:.2f}%")
    print(f"NDCG@5: {(ndcg5_sum/n)*100:.2f}%")

if __name__ == '__main__':
    main()
