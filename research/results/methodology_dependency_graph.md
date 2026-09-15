# Pedagogical Dependency Graph Generation Methodology

## 1. Overview
Hardcoded, static prerequisite graphs fail to scale to the growing diversity of tech skills. To resolve this, PATHFORGE adopts a dynamic, topologically validated Directed Acyclic Graph (DAG) for its roadmap generation engine.

## 2. Dual-Source Prerequisite Derivation
The dependency graph is constructed utilizing two discrete sources to guarantee both broad coverage and specific pedagogical rigor:

1. **`standard_curriculum_ordering`**: Expert-encoded prerequisite dependencies for foundational skills, ensuring logical progression paths in well-established domains (Frontend, Backend, AI/Data, Core DevOps, Security).
2. **`esco_derived`**: Systematically extracted edges from the European Skills, Competences, Qualifications and Occupations (ESCO) dataset. By translating raw URIs, the graph discovers latent, essential prerequisite edges between discrete, specific skills not explicitly tracked by the standard curriculum.

## 3. Topological Constraint: Directed Acyclic Graph (DAG) Validity
For roadmap generation to function mathematically, there must exist zero cycles (e.g., A -> B -> C -> A) within the final prerequisite graph. 
The generated dataset is enforced to map specifically to DAG constraints via Depth-First Search (DFS) traversal validation script `validate_dag.py`. 

**Validation Results:**
- **Zero Cycles found.**
- **DAG Property Maintained Mathematically.**

## 4. Methodological Incident: ISCO-08 Graph Scoping

**Incident Report (Identified Scope Breach):** 
During the initial Stage 6 generation, the ESCO relationships extraction algorithm ingested the raw `esco_skill_skills.csv` entirely verbatim without enforcing ISCO-08 demographic occupation constraints. This resulted in severe cross-domain contamination, embedding 126 disconnected, non-ICT skills (e.g., *animal care*, *forestry*, *dance*) into the system's topological mapping constraints.

**Corrective Action:** 
To explicitly enforce ICT/Tech rigor, a secondary rebuilt dependency grap pipeline was deployed to apply deterministic RegEx filters enforcing strictly Information and Communications Technology boundaries (`software`, `web`, `database`, `data engineer`, `machine learning`, `cloud`, etc.). Any ESCO occupations not intrinsically mapping explicitly to software boundaries were purged. A secondary blacklist explicitly banned irrelevant sectors across skill naming vectors.

## 5. Graph Architecture Statistics (Validated Subset)
The resulting rigidly scoped semantic knowledge tree yields the following statistics:
- **Total Nodes (Skills):** 61
- **Total Semantic Edges:** 85
  - *ESCO Derived:* 37
  - *Standard Curriculum:* 48
- **Global Mean Node Depth (All 61 nodes):** 2.13
- **Average Deepest-Path Depth by Foundational Domain:**
  - *Frontend (Subset of 7 core nodes):* 2.29
  - *Backend (Subset of 13 core nodes):* 1.85
  - *AI/Data Engineering (Subset of 9 core nodes):* 3.56

## 6. System Impact
By dynamically fetching `dependency_graph.json` at runtime within `skillDependencyEngine.ts` and normalizing skills contextually against `@pathforge/shared-constants`, we successfully separate architectural data structures from standard implementation layers, paving the road for continuous AI-driven expansion of the JSON file securely isolated within rigorous ICT limits.
