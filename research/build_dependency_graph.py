import json
import os
import pandas as pd
import re

# Standard Curriculum (Fallback Domain Expert Paths - Guaranteed Safe)
STANDARD_CURRICULUM = [
    # Frontend
    ("HTML", "CSS"), ("HTML", "JavaScript"), ("CSS", "JavaScript"),
    ("JavaScript", "TypeScript"), ("JavaScript", "React"), ("HTML", "React"),
    ("CSS", "React"), ("JavaScript", "Vue"), ("JavaScript", "Angular"),
    ("TypeScript", "Angular"),
    
    # Backend
    ("C", "Java"), ("Java", "Spring Boot"), ("JavaScript", "Node.js"),
    ("Node.js", "Express"), ("C", "Python"), ("Python", "Django"),
    ("Python", "Flask"), ("SQL", "Database Design"), ("Database Design", "PostgreSQL"),
    ("Database Design", "MySQL"), ("Database Design", "MongoDB"), 
    ("JavaScript", "MongoDB"), ("Node.js", "MongoDB"),
    
    # AI/Data
    ("Python", "Pandas"), ("Python", "NumPy"), ("Pandas", "Machine Learning"),
    ("NumPy", "Machine Learning"), ("Machine Learning", "Scikit-learn"),
    ("Machine Learning", "TensorFlow"), ("Machine Learning", "PyTorch"),
    ("TensorFlow", "Deep Learning"), ("PyTorch", "Deep Learning"),
    ("Machine Learning", "NLP"), ("Machine Learning", "Computer Vision"),
    
    # DevOps / Core
    ("C", "Linux"), ("Linux", "Bash"), ("Linux", "Networking"),
    ("Networking", "AWS"), ("Networking", "Azure"), ("Networking", "GCP"),
    ("Linux", "Docker"), ("Docker", "Kubernetes"), ("Docker", "CI/CD"),
    ("Git", "CI/CD"),
    
    # Security
    ("Networking", "Cyber Security"), ("Linux", "Cyber Security"),
    ("Cyber Security", "Penetration Testing"), ("Cyber Security", "Cryptography"),
]

# Robust regex to isolate ONLY Software, Backend, Frontend, AI, Data occupations
OCC_REGEX = re.compile(r'\b(software|web|database|data engineer|data scientist|systems analyst|network administrator|computer games developer|machine learning|artificial intelligence|ict|frontend|backend|cloud)\b', re.IGNORECASE)

# Words that disqualify an occupation or a skill (aggressively strict filtering to strip generic marketing/business/management fluff)
EXCLUDE_REGEX = re.compile(r'\b(copywriting|marketing|supplier|environmental|procurement|publishing|account|purchasing|contracting|business|scholarly|research process|project activities|training|multimedia|written content|structure information|content|quality audits|forecast|footwear|video|motion picture|seller|teacher|hardware|telecommunications|cabling|repair|dance|music|art|conservation|agriculture|animal|mechanic|chemistry|biology|electronics|nursing|recycling|machinery)\b', re.IGNORECASE)

def normalize(key):
    return key.strip().lower()

def main():
    try:
        df_occ = pd.read_csv('research/data/processed/esco/esco_occupations.csv')
        df_occ_skills = pd.read_csv('research/data/processed/esco/esco_occ_skills.csv')
        df_skill_skills = pd.read_csv('research/data/processed/esco/esco_skill_skills.csv')
        df_skills = pd.read_csv('research/data/processed/esco/esco_skills.csv')
        
    except FileNotFoundError:
        print("ESCO files missing, outputting empty.")
        return

    # 1. Filter Occupations
    valid_occs = df_occ[
        df_occ['label'].str.contains(OCC_REGEX, na=False) &
        ~df_occ['label'].str.contains(EXCLUDE_REGEX, na=False)
    ]
    valid_occ_ids = set(valid_occs['esco_occ_id'].tolist())
    print(f"Filtered Occupations down to {len(valid_occ_ids)} valid ICT roles.")

    # 2. Extract Valid Skills Linked to these Occupations
    linked_skills_df = df_occ_skills[df_occ_skills['esco_occ_id'].isin(valid_occ_ids)]
    valid_skill_uris = set(linked_skills_df['esco_skill_id'].tolist())
    print(f"Extracted {len(valid_skill_uris)} candidate skills linked to ICT occupations.")
    
    # 3. Apply Domain Cleanliness to the Skills themselves
    # Even in ICT, we discard unwanted subsets (e.g. telecom infrastructure, hardware mechanics)
    skill_uri_to_label = dict(zip(df_skills['esco_skill_id'], df_skills['label']))
    
    clean_skill_uris = set()
    for uri in valid_skill_uris:
        label = str(skill_uri_to_label.get(uri, ""))
        if label and not EXCLUDE_REGEX.search(label):
            clean_skill_uris.add(uri)
            
    print(f"Refined down to {len(clean_skill_uris)} clean software/ICT skills.")
    
    # 4. Map Valid Edges from ESCO Skill-Skill dependencies
    edges = []
    
    for _, row in df_skill_skills.iterrows():
        source_uri = row['relatedSkillUri']
        target_uri = row['originalSkillUri']
        
        # BOTH MUST BE IN OUR CLEAN ICT POOL
        if source_uri in clean_skill_uris and target_uri in clean_skill_uris:
            if row.get('relation_type', row.get('relationType', 'essential')) == 'essential':
                edges.append({
                    "source": skill_uri_to_label[source_uri],
                    "target": skill_uri_to_label[target_uri],
                    "type": "esco_derived"
                })

    print(f"Captured {len(edges)} ESCO edges strictly isolated to Software/Data/Frontend/Backend domains.")
    
    # 5. Bring in STANDARD CURRICULUM unconditionally
    for source, target in STANDARD_CURRICULUM:
        edges.append({
            "source": source,
            "target": target,
            "type": "standard_curriculum_ordering"
        })
        
    # Map to canonical names based on first observed casing to merge duplicates natively
    canonical_map = {}
    def get_canonical(name):
        norm = normalize(name)
        if norm not in canonical_map:
            canonical_map[norm] = name
            # Prefer Standard Curriculum explicit capitalization overrides
            for (st, tt) in STANDARD_CURRICULUM:
                if normalize(st) == norm:
                    canonical_map[norm] = st
                if normalize(tt) == norm:
                    canonical_map[norm] = tt
        return canonical_map[norm]

    # Aggregate into { skill: target, prerequisites: [ { skill: source, source: type } ] }
    graph_dict = {}
    for edge in edges:
        t = get_canonical(edge["target"])
        s = get_canonical(edge["source"])
        if t not in graph_dict:
            graph_dict[t] = []
        graph_dict[t].append({ "skill": s, "tag": edge["type"] })
        
    final_output = []
    for skill, reqs in graph_dict.items():
        unique_reqs = {}
        for r in reqs:
            if r["skill"] not in unique_reqs or r["tag"] == "esco_derived":
                unique_reqs[r["skill"]] = r["tag"]
                
        final_output.append({
            "skill": skill,
            "prerequisites": [{"skill": k, "source": v} for k, v in unique_reqs.items()]
        })
        
    os.makedirs("research/data", exist_ok=True)
    with open("research/data/dependency_graph.json", "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2)
        
    print(f"Generated {len(final_output)} clean nodes in dependency_graph.json")

    # Double check cyber security edge bleed
    for item in final_output:
        if item["skill"].lower() == "cyber security":
            print("Verified Cyber Security Node Prerequisites:")
            for p in item["prerequisites"]:
                print(f" - {p['skill']} ({p['source']})")

if __name__ == "__main__":
    main()
