import json

def load_graph():
    with open('research/data/dependency_graph.json', 'r', encoding='utf-8') as f:
        return json.load(f)

# Define known core software skills that are part of the intended domain
# (These match STANDARD_CURRICULUM and tech skills)
SOFTWARE_DOMAIN = {
    "html", "css", "javascript", "typescript", "react", "vue", "angular",
    "c", "java", "spring boot", "node.js", "express", "python", "django", "flask",
    "sql", "database design", "postgresql", "mysql", "mongodb",
    "pandas", "numpy", "machine learning", "scikit-learn", "tensorflow", "pytorch", 
    "deep learning", "nlp", "computer vision",
    "linux", "bash", "networking", "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd",
    "cyber security", "penetration testing", "cryptography", "git"
}

def analyze():
    graph = load_graph()
    
    total_nodes = len(graph)
    
    # Extract structural edges from STANDARD_CURRICULUM nodes to see if ESCO polluted them
    software_nodes_in_graph = []
    contaminated_nodes_in_graph = []
    
    # Check for paths from contaminated to Software, or Software to contaminated
    edges_into_software = []
    
    for item in graph:
        skill = item["skill"].lower().strip()
        if skill in SOFTWARE_DOMAIN:
            software_nodes_in_graph.append(item)
            # Check prerequisites of this software node
            for req in item["prerequisites"]:
                req_skill = req["skill"].lower().strip()
                if req_skill not in SOFTWARE_DOMAIN:
                    edges_into_software.append(f"{req['skill']} -> {item['skill']}")
        else:
            contaminated_nodes_in_graph.append(item["skill"])

    print(f"--- CONTAMINATION AUDIT REPORT ---")
    print(f"Total Parent Nodes in JSON: {total_nodes}")
    print(f"Software Nodes count: {len(software_nodes_in_graph)}")
    print(f"Contaminated/Irrelevant Nodes count: {len(contaminated_nodes_in_graph)}")
    
    print(f"\n--- SAMPLE OF CONTAMINATED NODES (First 30) ---")
    for n in contaminated_nodes_in_graph[:30]:
        print(f" - {n}")
        
    print(f"\n--- EDGES CROSSING FROM CONTAMINATED TO SOFTWARE ---")
    if len(edges_into_software) == 0:
        print("GOOD NEWS: Zero edges connect off-domain skills into Software skills.")
        print("The ESCO graph exists as a disconnected floating structure parallel to the curriculum.")
    else:
        print("BAD NEWS: Software nodes rely on off-domain skills:")
        for e in edges_into_software:
            print(f" - {e}")

if __name__ == "__main__":
    analyze()
