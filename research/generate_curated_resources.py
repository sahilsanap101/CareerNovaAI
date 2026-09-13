import json
import os
import re

# Verified list from user prompt mapping Canonical Skill -> Resource list
VERIFIED_INPUT = {
    # Web Technologies
    "JavaScript": [
        {"title": "JavaScript Guide - MDN", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "type": "official_documentation", "source": "MDN", "priority": 1},
        {"title": "The Modern JavaScript Tutorial", "url": "https://javascript.info/", "type": "tutorial", "source": "JavaScript.info", "priority": 2}
    ],
    "TypeScript": [{"title": "TypeScript Documentation", "url": "https://www.typescriptlang.org/docs/", "type": "official_documentation", "source": "TypeScript", "priority": 1}],
    "HTML": [{"title": "HTML - MDN", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "type": "official_documentation", "source": "MDN", "priority": 1}],
    "CSS": [{"title": "CSS - MDN", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS", "type": "official_documentation", "source": "MDN", "priority": 1}],
    "React": [{"title": "Learn React", "url": "https://react.dev/learn", "type": "official_documentation", "source": "React", "priority": 1}],
    "Node.js": [{"title": "Learn Node.js", "url": "https://nodejs.org/en/learn", "type": "official_documentation", "source": "Node.js", "priority": 1}],
    "Express": [{"title": "Express Documentation", "url": "https://expressjs.com/", "type": "official_documentation", "source": "Express", "priority": 1}],
    "Angular": [{"title": "Angular Documentation", "url": "https://angular.dev/", "type": "official_documentation", "source": "Angular", "priority": 1}],
    "Vue": [{"title": "Vue Guide", "url": "https://vuejs.org/guide/introduction.html", "type": "official_documentation", "source": "Vue", "priority": 1}],
    "Next.js": [{"title": "Next.js Documentation", "url": "https://nextjs.org/docs", "type": "official_documentation", "source": "Next.js", "priority": 1}],
    "Tailwind CSS": [{"title": "Tailwind CSS Docs", "url": "https://tailwindcss.com/docs", "type": "official_documentation", "source": "Tailwind CSS", "priority": 1}],

    # Python / Data Science
    "Python": [{"title": "Python Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "official_documentation", "source": "Python", "priority": 1}],
    "NumPy": [{"title": "NumPy Learn", "url": "https://numpy.org/learn/", "type": "official_documentation", "source": "NumPy", "priority": 1}],
    "Pandas": [{"title": "Pandas Getting Started", "url": "https://pandas.pydata.org/docs/getting_started/intro_tutorials/", "type": "official_documentation", "source": "Pandas", "priority": 1}],
    "Scikit-learn": [{"title": "Scikit-learn Getting Started", "url": "https://scikit-learn.org/stable/getting_started.html", "type": "official_documentation", "source": "Scikit-learn", "priority": 1}],
    "PyTorch": [{"title": "PyTorch Tutorials", "url": "https://docs.pytorch.org/tutorials/", "type": "official_documentation", "source": "PyTorch", "priority": 1}],
    "TensorFlow": [{"title": "Learn TensorFlow", "url": "https://www.tensorflow.org/learn", "type": "official_documentation", "source": "TensorFlow", "priority": 1}],
    "Matplotlib": [{"title": "Matplotlib Tutorials", "url": "https://matplotlib.org/stable/tutorials/", "type": "official_documentation", "source": "Matplotlib", "priority": 1}],

    # Databases
    "SQL": [{"title": "PostgreSQL SQL Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial-sql.html", "type": "tutorial", "source": "PostgreSQL", "priority": 1}],
    "PostgreSQL": [{"title": "PostgreSQL Documentation", "url": "https://www.postgresql.org/docs/", "type": "official_documentation", "source": "PostgreSQL", "priority": 1}],
    "MySQL": [{"title": "MySQL Documentation", "url": "https://dev.mysql.com/doc/", "type": "official_documentation", "source": "MySQL", "priority": 1}],
    "MongoDB": [{"title": "MongoDB Documentation", "url": "https://www.mongodb.com/docs/", "type": "official_documentation", "source": "MongoDB", "priority": 1}],
    "Redis": [{"title": "Redis Documentation", "url": "https://redis.io/docs/", "type": "official_documentation", "source": "Redis", "priority": 1}],

    # Programming Languages
    "Java": [{"title": "Learn Java", "url": "https://dev.java/learn/", "type": "official_documentation", "source": "Oracle", "priority": 1}],
    "C": [{"title": "C Reference", "url": "https://en.cppreference.com/w/c", "type": "official_documentation", "source": "cppreference", "priority": 1}],
    "C++": [{"title": "C++ Reference", "url": "https://en.cppreference.com/w/cpp", "type": "official_documentation", "source": "cppreference", "priority": 1}],
    "Go": [{"title": "Learn Go", "url": "https://go.dev/learn/", "type": "official_documentation", "source": "Go", "priority": 1}],
    "Rust": [{"title": "Learn Rust", "url": "https://www.rust-lang.org/learn", "type": "official_documentation", "source": "Rust", "priority": 1}],

    # Backend / APIs
    "FastAPI": [{"title": "FastAPI Documentation", "url": "https://fastapi.tiangolo.com/", "type": "official_documentation", "source": "FastAPI", "priority": 1}],
    "Flask": [{"title": "Flask Documentation", "url": "https://flask.palletsprojects.com/", "type": "official_documentation", "source": "Flask", "priority": 1}],
    "Django": [{"title": "Django Documentation", "url": "https://docs.djangoproject.com/", "type": "official_documentation", "source": "Django", "priority": 1}],
    "REST APIs": [{"title": "REST API Glossary", "url": "https://developer.mozilla.org/en-US/docs/Glossary/REST", "type": "official_documentation", "source": "MDN", "priority": 1}],
    "GraphQL": [{"title": "Learn GraphQL", "url": "https://graphql.org/learn/", "type": "official_documentation", "source": "GraphQL", "priority": 1}],

    # Version Control / DevOps
    "Git": [{"title": "Git Documentation", "url": "https://git-scm.com/doc", "type": "official_documentation", "source": "Git", "priority": 1}],
    "GitHub": [{"title": "GitHub Documentation", "url": "https://docs.github.com/", "type": "official_documentation", "source": "GitHub", "priority": 1}],
    "Docker": [{"title": "Docker Get Started", "url": "https://docs.docker.com/get-started/", "type": "official_documentation", "source": "Docker", "priority": 1}],
    "Kubernetes": [{"title": "Kubernetes Tutorials", "url": "https://kubernetes.io/docs/tutorials/", "type": "official_documentation", "source": "Kubernetes", "priority": 1}],

    # Cloud
    "AWS": [{"title": "AWS Getting Started", "url": "https://aws.amazon.com/getting-started/", "type": "official_documentation", "source": "AWS", "priority": 1}],
    "Azure": [{"title": "Azure Training", "url": "https://learn.microsoft.com/en-us/training/azure/", "type": "official_documentation", "source": "Microsoft", "priority": 1}],
    "GCP": [{"title": "Google Cloud Documentation", "url": "https://cloud.google.com/docs", "type": "official_documentation", "source": "Google Cloud", "priority": 1}],

    # AI / ML / NLP
    "Machine Learning": [{"title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "official_documentation", "source": "Scikit-learn", "priority": 1}],
    "Deep Learning": [{"title": "PyTorch Tutorials", "url": "https://pytorch.org/tutorials/", "type": "official_documentation", "source": "PyTorch", "priority": 1}],
    "NLP": [{"title": "NLP Course", "url": "https://huggingface.co/learn/nlp-course/chapter1/1", "type": "tutorial", "source": "Hugging Face", "priority": 1}],
    "Transformers": [{"title": "Transformers Documentation", "url": "https://huggingface.co/docs/transformers/", "type": "official_documentation", "source": "Hugging Face", "priority": 1}],
    "LLMs": [{"title": "Hugging Face Learn", "url": "https://huggingface.co/learn", "type": "tutorial", "source": "Hugging Face", "priority": 1}],
    "Generative AI": [{"title": "Google AI for Developers", "url": "https://ai.google.dev/", "type": "official_documentation", "source": "Google", "priority": 1}],
}

def main():
    # 1. Discover all skills in dependency graph and aliases
    skill_set = set()
    
    # Check dependency_graph.json
    deps_path = "research/data/dependency_graph.json"
    if os.path.exists(deps_path):
        with open(deps_path, "r", encoding="utf-8") as f:
            dag = json.load(f)
            for item in dag:
                skill_set.add(item["skill"])
                for req in item["prerequisites"]:
                    skill_set.add(req["skill"])
                    
    # The actual canonical skill names from system
    # We will just iterate all unique items in skill_set
    
    output_dict = {}
    total_nodes = len(skill_set)
    mapped = 0
    
    for s in sorted(list(skill_set)):
        # Very simple normalization check to link aliases if they hit VERIFIED_INPUT
        # e.g., NLP -> Natural Language Processing if needed, but in VERIFIED_INPUT I mapped NLP.
        matches = VERIFIED_INPUT.get(s, [])
        if matches:
            mapped += 1
            output_dict[s] = {
                "canonical_name": s,
                "resources": matches
            }
        else:
            output_dict[s] = {
                "canonical_name": s,
                "resources": []
            }
            
    print(f"Total Nodes Processed: {total_nodes}")
    print(f"Nodes with Verified Resource: {mapped}")
    
    os.makedirs("apps/api/src/data", exist_ok=True)
    out_path = "apps/api/src/data/curated_resources.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output_dict, f, indent=2)
        
    print(f"Wrote securely curated mapped JSON to {out_path}")

    # Build the report
    report = []
    report.append("# Curated Resource Coverage Report\n")
    report.append(f"Total Skill Nodes: {total_nodes}")
    report.append(f"Mapped Skills: {mapped}")
    report.append(f"Unmapped Skills: {total_nodes - mapped}")
    report.append(f"Coverage: {(mapped / total_nodes * 100) if total_nodes > 0 else 0:.2f}%\n")
    
    report.append("## Mapped Configuration")
    report.append("| Skill | Canonical Name | Resource | Source | Verified | Status |")
    report.append("| --- | --- | --- | --- | --- | --- |")
    
    unmapped_lines = []
    for s in sorted(list(skill_set)):
        if output_dict[s]["resources"]:
            res = output_dict[s]["resources"][0]
            report.append(f"| {s} | {s} | {res['title']} | {res['source']} | Yes | Mapped |")
        else:
            unmapped_lines.append(f"| {s} | No sufficiently specific verified resource identified |")
            
    report.append("\n## Unmapped Skills")
    report.append("| Skill | Reason |")
    report.append("| --- | --- |")
    report.extend(unmapped_lines)
    
    with open("research/data/resource_coverage_report.md", "w", encoding="utf-8") as f:
        f.write("\\n".join(report))

if __name__ == "__main__":
    main()
