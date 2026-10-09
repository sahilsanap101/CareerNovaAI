import json

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, bool) or isinstance(obj, np.bool_):
            return bool(obj)
        return super(NpEncoder, self).default(obj)

import numpy as np
import pandas as pd
import os
import re

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"

# Load config
with open(os.path.join(base_dir, "research/data/synthetic_v3/generator_config_v1.json"), "r") as f:
    config = json.load(f)

# Load careers
with open(os.path.join(base_dir, "research/data/synthetic_v3/synthetic_v3_career_subset_v1.json"), "r") as f:
    careers = json.load(f)
num_careers = len(careers)
career_names = [c["career_name"] for c in careers]
career_domains = [c["canonical_category"] for c in careers]

# Load skills
skills_df = pd.read_csv(os.path.join(base_dir, "research/data/production/skill_catalog_pathforge_2026.csv"))
canonical_skills = skills_df["skill_id"].tolist()
num_skills = len(canonical_skills)

master_seed = config["master_seed"]
np.random.seed(master_seed)

latent_dim = config["latent_dimension"]
num_samples = config["num_samples"]

# Career weights W_c (for Suitability)
np.random.seed(101)
W_c = np.random.randn(num_careers, latent_dim)
W_c /= np.linalg.norm(W_c, axis=1, keepdims=True)

# Assess weights (Theoretical v1 for mapping likelihood)
np.random.seed(102)
# True Assessment mapping from Latent (Random, but fixed)
W_A = np.random.randn(20, latent_dim)

# Vocabulary for Career Goals (Job-function / domain / abstract, to avoid target string leakage)
goal_roles = ["builder", "architect", "developer", "researcher", "analyst", "lead", "engineer", "designer", "manager", "specialist"]
goal_domains = ["systems", "data", "web", "ml", "security", "infrastructure", "hardware", "finance", "healthcare", "education"]

def generate_condition(cond_name, cconf):
    np.random.seed(master_seed + sum([ord(c) for c in cond_name]))
    
    LV = np.random.normal(0, 1, size=(num_samples, latent_dim))
    
    # Career Suitability
    S_c = LV @ W_c.T + np.random.normal(0, 0.5, size=(num_samples, num_careers))
    suitability_indices = np.argmax(S_c, axis=1)
    
    # Determine mappings
    M_Skill = np.random.randn(num_skills, latent_dim)
    
    if cond_name == "B_complementary":
        # Force complementarity
        # Skills load on first half, Assess on second half
        M_Skill[:, latent_dim//2:] *= 0.0
        W_A_cond = W_A.copy()
        W_A_cond[:, :latent_dim//2] *= 0.0
    elif cond_name == "C_assessment_dominant":
        # Skills are random noise, Assess captures W_c
        M_Skill = np.random.randn(num_skills, latent_dim) * 0.1
        W_A_cond = W_A.copy()
    else:
        # A_profile_dominant
        W_A_cond = np.random.randn(20, latent_dim) * 0.1
    
    # Generate student preferences
    student_preference = []
    T_SP = np.eye(num_careers) * 0.8 + 0.2/num_careers
    for i in range(num_samples):
        student_preference.append(career_names[np.random.choice(num_careers, p=T_SP[suitability_indices[i]])])

    # Generate Profile components mapping directly from LV
    # Skills probabilities: logistic(LV @ M_Skill^T)
    skill_logits = LV @ M_Skill.T
    
    # Academics
    M_cgpa = np.random.randn(latent_dim)
    cgpa_raw = LV @ M_cgpa
    
    # Coding
    M_coding = np.random.randn(latent_dim)
    coding_raw = LV @ M_coding
    
    # Projects
    M_proj = np.random.randn(latent_dim)
    proj_raw = LV @ M_proj
    
    # Assess
    A_raw = LV @ W_A_cond.T + np.random.normal(0, cconf["assessment_noise_std"], size=(num_samples, 20))
    A = np.clip(np.round(((A_raw - A_raw.mean()) / (A_raw.std() + 1e-6)) * 1.0 + 3), 1, 5).astype(int)

    records = []
    
    for i in range(num_samples):
        # 1. Skills
        student_skills = {}
        for s_idx in range(num_skills):
            logit = skill_logits[i, s_idx] + np.random.normal(0, cconf["profile_noise_std"])
            prob = 1 / (1 + np.exp(-logit))
            if prob > cconf["semantic_threshold"]:
                prof = int(np.clip(np.round(prob * 5), 1, 5))
                student_skills[canonical_skills[s_idx]] = {"proficiency": prof, "confidence": prof * 20}
                
        # 2. Interests
        interests = {}
        # assign some arbitrary system interests based on LV max index
        top_lv = np.argsort(LV[i])[-3:]
        for lv_idx in top_lv:
            interests[f"INT_LATENT_{lv_idx}"] = {"priority": 1}
            
        # 3. Projects
        projects = []
        num_proj = int(np.clip(np.round(proj_raw[i] + 2), 0, 5))
        for p_idx in range(num_proj):
            # pick random skills from the student's skill bag
            bag = list(student_skills.keys())
            if len(bag) > 0:
                techs = np.random.choice(bag, min(3, len(bag)), replace=False).tolist()
                projects.append({
                    "title": f"Project {p_idx}",
                    "description": "Auto generated",
                    "technologies": techs
                })
                
        # 4. Academics
        cgpa_val = float(np.clip(np.round(cgpa_raw[i] * 1.5 + 7.5, 2), 4.0, 10.0))
        branch = "Computer Science" if LV[i, 0] > 0 else "Information Technology"
        academic = {
            "degree": "B.Tech",
            "branch": branch,
            "specialization": None,
            "cgpa": cgpa_val
        }
        
        # 5. Certifications
        certifications = []
        if LV[i, 1] > 1.0:
            certifications.append({"title": "Certified Developer", "issuer": "Tech Org"})
            
        # 6. Coding
        problems = int(np.clip(coding_raw[i] * 100 + 150, 0, 1000))
        codingEvidence = {
            "totalProblemsSolved": problems,
            "activePlatforms": ["LeetCode"] if problems > 50 else []
        }
        
        # 7. Goals
        role = f"{np.random.choice(goal_domains)} {np.random.choice(goal_roles)}"
        careerGoals = {
            "targetRole": role,
            "targetIndustry": np.random.choice(goal_domains),
            "preferredCountries": "US",
            "preferredWorkMode": "Remote",
            "aspirations": {
                "higherStudies": bool(LV[i, 2] > 1),
                "entrepreneurship": bool(LV[i, 3] > 1),
                "governmentJobs": False,
                "startup": bool(LV[i, 4] > 1),
                "research": bool(LV[i, 5] > 1)
            }
        }
        
        # Year Stage
        year = int(np.random.choice([1, 2, 3, 4]))
        yearStage = {
            "year": year,
            "semester": (year-1)*2 + np.random.choice([1, 2]),
            "isExploratory": year <= 2,
            "isPlacementReady": year >= 3
        }

        profile = {
            "studentId": f"STU_{cond_name[0]}_{i:04d}",
            "yearStage": yearStage,
            "academic": academic,
            "skills": student_skills,
            "interests": interests,
            "projects": projects,
            "certifications": certifications,
            "codingEvidence": codingEvidence,
            "careerGoals": careerGoals
        }
        
        row = {
            "student_id": profile["studentId"],
            "career_suitability": career_names[suitability_indices[i]],
            "student_preference": student_preference[i],
            "profile_json": json.dumps(profile, cls=NpEncoder)
        }
        for q_idx in range(20):
            row[f"assessment_q{q_idx+1:02d}"] = A[i, q_idx]
            
        records.append(row)
        
    df = pd.DataFrame(records)
    out_path = os.path.join(base_dir, f"research/data/synthetic_v3/synthetic_v3_{cond_name[0]}.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {out_path}")

for cond_name, cconf in config["conditions"].items():
    generate_condition(cond_name, cconf)
