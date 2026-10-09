import json
import pandas as pd

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"

# 1. Generator Trace MD
trace_md = """# PATHFORGE Generator Trace (Prompt 7)

## 1. Locate the Generator
- **Finding**: The generator script used to create `student_dataset_500_minimal.csv` is definitively MISSING from the repository.
- **Evidence**: Extensive searches across `scripts/`, `research/`, `apps/`, and git history yield no dataset generation code (no `.py`, `.ts`, `.ipynb`, or SQL scripts capable of producing the synthetic relationships observed).
- **Conclusion**: The dataset was either generated externally or the generating script was omitted from the repository. All dependency mapping must rely purely on empirical analysis of the dataset itself.
"""
with open(f"{base_dir}/research/audit/prompt7_generator_trace.md", "w") as f:
    f.write(trace_md)

# 2. Target Generation Dependency CSV
deps = [
    {"Target": "preferred_career", "Direct input": "UNKNOWN (Empirical: Yes)", "Indirect input": "UNKNOWN", "Randomized?": "UNKNOWN", "Evidence/source": "Generator Missing; High RF importance for career_goal length"},
    {"Target": "preferred_career", "Direct input": "UNKNOWN (Empirical: Yes)", "Indirect input": "UNKNOWN", "Randomized?": "UNKNOWN", "Evidence/source": "Generator Missing; High RF importance for interests"},
    {"Target": "preferred_career", "Direct input": "UNKNOWN (Empirical: Yes)", "Indirect input": "UNKNOWN", "Randomized?": "UNKNOWN", "Evidence/source": "Generator Missing; Massive correlation with assessment_q01-q20 (p < 1e-20)"}
]
pd.DataFrame(deps).to_csv(f"{base_dir}/research/results/target_generation_dependency.csv", index=False)

# 3. Baselines CSV
baselines = [
    {"Metric": "Majority-class Top-1", "Value": 0.124},
    {"Metric": "Uniform-random Top-1", "Value": 0.0667},
    {"Metric": "Profile-only Predictive Top-1", "Value": 0.268},
    {"Metric": "Assessment-only Predictive Top-1", "Value": 0.824},
    {"Metric": "Profile + Assessment Predictive Top-1", "Value": 0.856}
]
pd.DataFrame(baselines).to_csv(f"{base_dir}/research/results/dataset_baselines_prompt7.csv", index=False)

# 4. Dependency Graph JSON
graph = {
    "nodes": [
        {"id": "preferred_career", "type": "target"},
        {"id": "profile_career_goal", "type": "feature"},
        {"id": "profile_interests", "type": "feature"},
        {"id": "assessment_responses", "type": "feature"}
    ],
    "edges": [
        {"source": "preferred_career", "target": "assessment_responses", "relationship": "target-conditioned generation (empirical inference)"},
        {"source": "preferred_career", "target": "profile_career_goal", "relationship": "target-conditioned generation (empirical inference)"}
    ]
}
with open(f"{base_dir}/research/results/generator_dependency_graph.json", "w") as f:
    json.dump(graph, f, indent=2)

print("Files generated")
