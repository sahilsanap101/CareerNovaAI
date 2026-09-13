# PathForge IEEE Research Traceability Matrix
**Code to Mathematical Formulation Mapping**

This manifest maps the IEEE equations defined in the PathForge paper to their exact software lifecycle implementations built over real-world Market Demand and Prerequisite Graph topology. 

---

### 1. Market Demand Feature Engine ($M_t$)
**Definition:** Tracks the frequency and demand density of a specific skill required for a specific career over temporal snapshots.
- **Source Dataset:** `archive/linkedin_job_postings.csv`
- **Output Artifact:** `research/data/processed/engines/market_demand.csv`
- **Code Generator:** `apps/api/src/research/data/engines/market_demand_engine.py` (Line 75: Normalizes frequencies via Min-Max scaling per career context).

### 2. Career-Skill Importance Matrix ($W_c$)
**Definition:** Captures the required skill set taxonomy $S$ and weight $W$ necessary for achieving proficiency in career $C$.
- **Source Dataset:** `ESCO_occupations.csv` & `O*NET_Occupation_Data.xlsx`
- **Output Artifact:** `research/data/processed/engines/career_skill_weights.csv`
- **Code Generator:** `apps/api/src/research/data/ontology/linkedin_mapper.py` & `market_demand_engine.py`.

### 3. Acyclic Prerequisite Topology ($P$)
**Definition:** Directed Acyclic Graph where an edge $E(u, v)$ means skill $u$ is a prerequisite for skill $v$. Cycles are actively tracked and pruned mathematically.
- **Source Dataset:** `ESCO_skill_skills.csv`
- **Output Artifact:** `research/data/processed/engines/prerequisite_edges.csv`
- **Code Generator:** `apps/api/src/research/data/engines/graph_engine.py` (Cycle resolution via NetworkX breaking strategies targeting lowest out-degree paths).

### 4. Learning Cost Model ($Cost(s)$)
**Definition:** An assignment of a cognitive hour-cost bound required to traverse from proficiency 0 to 1 for skill $s$.
- **Source Dataset:** Modeled heuristically by Out-degree centrality within the Canonical Graph Engine.
- **Output Artifact:** `research/data/processed/engines/learning_costs.csv`
- **Code Generator:** `apps/api/src/research/data/engines/graph_engine.py`

---

### 5. Evaluation Pipelines (Baselines B0-B4)
- **B0_Heuristic (BYSER Engine):** Executed in `apps/api/src/modules/recommendations/engine/byserEngine.ts`. Uses hardcoded linear scalar weights without graph constraints.
- **B1_MarketAware:** Executed in `apps/api/src/research/baselines/B1_MARKET_AWARE/ranker.ts`. Combines Student Proficiency mapping with the Market Demand ($M_t$) Engine.
- **Proposed DAG / Constrained Planner:** Executed in `apps/api/src/research/baselines/B3_CONSTRAINED_PLANNER/planner.ts`. Generates pathways topologically adhering to structural prerequisite logic ensuring zero Constraint Violation Exceptions.

### 6. Results Harness / Metrics Computations
**Definition:** The final evaluation computing quantitative Recall, MRR, and NDCG over dynamic data structures to simulate performance realistically without synthetic collisions.
- **Runner Instance:** `apps/api/src/research/experiments/run_final_evaluation.ts`
- **Results Folder:** `/research/final_results/FINAL_RESULTS.md` & `metrics.csv`

---
> Verified against exact canonical implementations on generated data processing endpoints. Fake metric generators have been structurally wiped from output paths.
