"""
Generate Synthetic Dataset for BYSER Evaluation
-----------------------------------------------
This script generates a synthetic dataset of N=200 student profiles.
Each profile is assigned a "ground truth" target career from 3 domains:
- Frontend
- Backend
- AI/Data Engineering

Realistic noise is injected:
- Partial skill overlap across domains (e.g., a Frontend profile might have some basic Python)
- Missing fields (e.g., no certifications, no coding platform history)
- Proficiency variance (levels ranging from 1 to 5)

This dataset aims to be realistic rather than perfectly clean, testing the
robustness of the BYSER matching logic.
"""

import csv
import json
import random
import os

random.seed(42)

DOMAINS = ['Frontend Developer', 'Backend Developer', 'AI Engineer']

SKILL_POOL = {
    'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue'],
    'Backend Developer': ['Node.js', 'Express', 'Python', 'Django', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
    'AI Engineer': ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'PostgreSQL', 'AWS']
}

INTEREST_POOL = {
    'Frontend Developer': ['Web Design', 'UI/UX', 'Mobile Development'],
    'Backend Developer': ['Backend Development', 'Cloud Computing', 'Microservices'],
    'AI Engineer': ['Artificial Intelligence', 'Data Science', 'Machine Learning']
}

def generate_profile(i):
    target = random.choice(DOMAINS)
    
    # 70% skills from target domain, 30% from others
    num_skills = random.randint(3, 7)
    skills = []
    
    for _ in range(num_skills):
        if random.random() < 0.7:
            pool = SKILL_POOL[target]
        else:
            other_domains = [d for d in DOMAINS if d != target]
            pool = SKILL_POOL[random.choice(other_domains)]
        
        skill = random.choice(pool)
        if not any(s['name'] == skill for s in skills):
            # Realistic variance
            proficiency = random.choices([1, 2, 3, 4, 5], weights=[0.1, 0.2, 0.4, 0.2, 0.1])[0]
            skills.append({
                'name': skill,
                'proficiency': proficiency,
                'experienceMonths': random.randint(0, 36)
            })

    interests = []
    if random.random() < 0.8: # 20% chance of missing interests
        pool = INTEREST_POOL[target]
        interests.append(random.choice(pool))

    projects = []
    if random.random() < 0.7:
        projects.append(random.choice(SKILL_POOL[target]))

    cgpa = round(random.uniform(5.5, 9.8), 1) if random.random() < 0.9 else None
    
    certs = random.randint(0, 2) if random.random() < 0.4 else 0
    coding = random.randint(0, 300) if random.random() < 0.5 else 0

    # NOTE: The synthetic gender/category field is assigned completely independently 
    # at random here, completely unrelated to this profile's skills, interests, or 
    # career label. Therefore, finding "no skew" downstream is mathematically 
    # guaranteed by construction. This operates merely as a fairness pipeline sanity-check.
    gender = random.choices(['Male', 'Female', 'Non-Binary', 'Prefer not to say'], weights=[0.45, 0.45, 0.05, 0.05])[0]
    category = random.choices(['General', 'Reserved', 'Prefer not to say'], weights=[0.60, 0.35, 0.05])[0]

    return {
        'student_id': f'stu_{i}',
        'ground_truth': target,
        'skills': json.dumps(skills),
        'interests': json.dumps(interests),
        'projects': json.dumps(projects), # simplifying projects to just technologies matched
        'cgpa': cgpa if cgpa else "",
        'certifications_count': certs,
        'coding_solved': coding,
        'preferred_role': target if random.random() < 0.5 else "", # 50% explicit goal
        'gender': gender,
        'category': category
    }

def main():
    os.makedirs('research', exist_ok=True)
    profiles = [generate_profile(i) for i in range(200)]
    
    keys = profiles[0].keys()
    with open('research/eval_dataset.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(profiles)
        
    print("Generated 200 profiles in research/eval_dataset.csv")

if __name__ == '__main__':
    main()
