import json
import sys

def validate_dag(graph):
    """
    Validates that a graph represented as a dictionary {node: [prerequisites...]} is a Directed Acyclic Graph.
    Returns (True, None) if valid, (False, cycle_path) if a cycle is found.
    """
    # Graph is adj list mapping node -> prerequisites
    # To check for cycles, we'll use DFS.
    
    visited = set()
    rec_stack = set()
    path = []
    
    def dfs(node):
        visited.add(node)
        rec_stack.add(node)
        path.append(node)
        
        prereqs = graph.get(node, [])
        for p in prereqs:
            if p not in visited:
                has_cycle, cycle_path = dfs(p)
                if has_cycle:
                    return True, cycle_path
            elif p in rec_stack:
                path.append(p)
                # Extract the actual cycle
                idx = path.index(p)
                return True, path[idx:]
                
        rec_stack.remove(node)
        path.pop()
        return False, []

    for node in graph:
        if node not in visited:
            has_cycle, cycle_path = dfs(node)
            if has_cycle:
                return False, cycle_path
                
    return True, []

def main():
    try:
        with open("research/data/dependency_graph.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: research/data/dependency_graph.json not found.")
        sys.exit(1)
        
    # Convert list format to adjacency list
    # Format: [{"skill": "Target", "prerequisites": [{"skill": "Prereq", "source": "tag"}]}]
    graph = {}
    edges_by_source = {"esco_derived": 0, "standard_curriculum_ordering": 0}
    total_edges = 0
    total_nodes = len(data)
    
    for item in data:
        target = item["skill"]
        reqs = []
        for r in item["prerequisites"]:
            reqs.append(r["skill"])
            tag = r["source"]
            edges_by_source[tag] = edges_by_source.get(tag, 0) + 1
            total_edges += 1
            
        graph[target] = reqs
        
    is_valid, cycle = validate_dag(graph)
    
    if not is_valid:
        print("ERROR: Cyclic dependency detected in graph!")
        print("Cycle path: " + " -> ".join(cycle))
        sys.exit(1)
        
    print("SUCCESS: Graph validated as a valid Directed Acyclic Graph (DAG) - Zero Cycles Found.")
    print(f"\n--- Graph Statistics ---")
    print(f"Total Nodes (Skills): {total_nodes}")
    print(f"Total Edges: {total_edges}")
    print(f"Edges (ESCO Derived): {edges_by_source.get('esco_derived', 0)}")
    print(f"Edges (Standard Curriculum): {edges_by_source.get('standard_curriculum_ordering', 0)}")
    
    # Calculate average depth per node
    # Since it's a valid DAG, we can compute longest path for each node
    memo = {}
    def get_depth(node):
        if node in memo: return memo[node]
        if not graph.get(node):
            memo[node] = 0
            return 0
        depth = 1 + max([get_depth(p) for p in graph[node]])
        memo[node] = depth
        return depth
        
    depths = [get_depth(n) for n in graph]
    avg_depth = sum(depths) / len(depths) if depths else 0
    print(f"Global Mean Node Depth (All {len(graph)} nodes): {avg_depth:.2f}")

    domains = {
        "Frontend": {"HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue", "Angular"},
        "Backend": {"C", "Java", "Spring Boot", "Node.js", "Express", "Python", "Django", "Flask", "SQL", "Database Design", "PostgreSQL", "MySQL", "MongoDB"},
        "AI/Data Engineering": {"Pandas", "NumPy", "Machine Learning", "Scikit-learn", "TensorFlow", "PyTorch", "Deep Learning", "NLP", "Computer Vision"}
    }

    print("\n--- Average Deepest-Path Depth by Foundational Domain ---")
    for domain, skills in domains.items():
        domain_depths = [memo.get(s, 0) for s in skills if s in memo] # Use memo or default to 0 if not tracked natively
        if domain_depths:
            avg = sum(domain_depths) / len(domain_depths)
            print(f"{domain} (Subset of {len(domain_depths)} core nodes): {avg:.2f}")
        else:
            print(f"{domain}: N/A")

if __name__ == "__main__":
    main()
