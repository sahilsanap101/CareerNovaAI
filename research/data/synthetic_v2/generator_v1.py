import json
import numpy as np
import pandas as pd
import os

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
config_path = os.path.join(base_dir, "research/data/synthetic_v2/generator_config_v1.json")
out_dir = os.path.join(base_dir, "research/data/synthetic_v2")

with open(config_path, "r") as f:
    config = json.load(f)

master_seed = config["master_seed"]
np.random.seed(master_seed)

num_samples = config["num_samples"]
latent_dim = config["latent_dim"] if "latent_dim" in config else config["latent_dimension"]
num_careers = config["num_careers"]
num_assessment = config["num_assessment_questions"]
num_profile = 7 # 7 Profile dimensions

# Career weights W_c: shape (num_careers, latent_dim)
np.random.seed(101) # Fixed versioned seed for career mappings
W_c = np.random.randn(num_careers, latent_dim)
W_c /= np.linalg.norm(W_c, axis=1, keepdims=True)

# Generate transition matrix for student preference
np.random.seed(config["generation_rules"].get("bias_matrix_seed", 202))
T_SP = np.eye(num_careers) * 0.7 + np.random.rand(num_careers, num_careers) * 0.3
T_SP /= T_SP.sum(axis=1, keepdims=True)

def generate_condition(cond_name, cond_config):
    np.random.seed(master_seed + sum([ord(c) for c in cond_name]))
    
    LV = np.random.normal(0, 1, size=(num_samples, latent_dim))
    
    # Career Suitability
    S_c = LV @ W_c.T + np.random.normal(0, 0.5, size=(num_samples, num_careers))
    career_suitability = np.argmax(S_c, axis=1)
    
    # Student Preference
    student_preference = np.zeros(num_samples, dtype=int)
    for i in range(num_samples):
        student_preference[i] = np.random.choice(num_careers, p=T_SP[career_suitability[i]])
        
    # Mappings M_P and M_A
    M_P = np.random.randn(latent_dim, num_profile)
    M_A = np.random.randn(latent_dim, num_assessment)
    
    if cond_name == "B_balanced":
        # Force complementarity: Profile reads first half of latent, Assessment reads second half
        M_P[latent_dim//2:, :] *= 0.1
        M_A[:latent_dim//2, :] *= 0.1

    prof_signal = cond_config["profile_signal_ratio"]
    prof_noise = cond_config["profile_noise_std"]
    ass_signal = cond_config["assessment_signal_ratio"]
    ass_noise = cond_config["assessment_noise_std"]
    
    # Generate Profile
    P = (LV @ M_P) * prof_signal + np.random.normal(0, prof_noise, size=(num_samples, num_profile))
    
    # Generate Assessment
    A_raw = (LV @ M_A) * ass_signal + np.random.normal(0, ass_noise, size=(num_samples, num_assessment))
    # Normalize to 1-5 scale
    A = np.clip(np.round(((A_raw - A_raw.mean()) / (A_raw.std() + 1e-6)) * 1.0 + 3), 1, 5)
    
    # Assemble DataFrame
    df = pd.DataFrame()
    df["student_id"] = [f"STU_{i:04d}" for i in range(num_samples)]
    for i in range(num_profile):
        df[f"profile_dim_{i+1}"] = P[:, i]
    for i in range(num_assessment):
        df[f"assessment_q{i+1:02d}"] = A[:, i]
        
    df["career_suitability"] = career_suitability
    df["student_preference"] = student_preference
    
    # Internal Audit Data (Not for ML models, only for Structural Validation)
    df_audit = pd.DataFrame(S_c, columns=[f"latent_score_c{i}" for i in range(num_careers)])
    for i in range(num_assessment):
        df_audit[f"raw_assessment_{i+1:02d}"] = A_raw[:, i]
        
    df.to_csv(os.path.join(out_dir, f"synthetic_v2_{cond_name[0]}.csv"), index=False)
    df_audit.to_csv(os.path.join(out_dir, f"audit_{cond_name[0]}.csv"), index=False)
    print(f"Generated condition {cond_name}")

for cname, cconf in config["conditions"].items():
    generate_condition(cname, cconf)

print("Generation complete.")
