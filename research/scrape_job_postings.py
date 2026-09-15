import os
import pandas as pd
import json

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

def normalize_skill(name):
    """Normalize ESCO raw names into the internal framework canonical names"""
    cleaned = str(name).strip().lower()
    for k in SKILL_ALIASES:
        if k.lower() == cleaned: return k
    for k, aliases in SKILL_ALIASES.items():
        if any(a.lower() == cleaned for a in aliases): return k
        if cleaned == f"{k.lower()} (computer programming)": return k
    return cleaned

def main():
    base_dir = os.path.dirname(__file__)
    data_dir = os.path.join(base_dir, 'data', 'processed', 'esco')
    
    skills_path = os.path.join(data_dir, 'esco_skills.csv')
    occ_skills_path = os.path.join(data_dir, 'esco_occ_skills.csv')
    occupations_path = os.path.join(data_dir, 'esco_occupations.csv')
    
    # We are explicitly using the existing ESCO occupation-skill relation tables as a proxy
    # for real job postings. No real job postings are scraped from external live internet sites.
    
    print("Loading ESCO datasets as a proxy for job posting data...")
    skills_df = pd.read_csv(skills_path)
    occ_skills_df = pd.read_csv(occ_skills_path)
    occ_df = pd.read_csv(occupations_path)
    
    # Filter for target domains: Frontend, Backend, AI/Data Eng
    # We filter ESCO descriptions against these proxy targeting keywords
    keywords = ['software', 'developer', 'programmer', 'frontend', 'back end', 'backend', 'data sci', 'data engineer', 'artificial intelligence', 'machine learning', 'web']
    
    def matches_domain(row):
        text = str(row['label']).lower() + " " + str(row['alt_labels']).lower() + " " + str(row['description']).lower()
        return any(kw in text for kw in keywords)

    occ_df['target_domain'] = occ_df.apply(matches_domain, axis=1)
    target_occs = occ_df[occ_df['target_domain']]['esco_occ_id'].tolist()
    
    print(f"Isolated {len(target_occs)} tech-sector occupations from ESCO as proxy framework.")
    
    # Filter occ_skills (so we only look at skill counts within these specific target occupations)
    target_relations = occ_skills_df[occ_skills_df['esco_occ_id'].isin(target_occs)]
    
    # Count frequency of each skill
    freq = target_relations['esco_skill_id'].value_counts().to_dict()
    
    max_freq = max(freq.values()) if freq else 1
    
    # Map back to string labels
    id_to_label = dict(zip(skills_df['esco_skill_id'], skills_df['label']))
    
    market_demand = {}
    for skill_id, count in freq.items():
        if skill_id in id_to_label:
            name = normalize_skill(id_to_label[skill_id])
            score = count / max_freq  # Normalized 0 to 1
            market_demand[name] = score
            
    out_dir = os.path.join(base_dir, 'results')
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'market_demand.json')
    
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(market_demand, f, indent=2)
        
    print(f"Computed market demand proxies for {len(market_demand)} skills based strictly on ESCO mapping frequency.")
    print(f"Saved to {out_file}")

if __name__ == '__main__':
    main()
