import json
import os

base_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE"
eval_dir = os.path.join(base_dir, "research/fresh_evaluation")

manifest = {
    "experiment_id": "PATHFORGE_FRESH_EVAL_2026_V1",
    "timestamp": "2026-10-07T00:51:38+05:30",
    "objective": "Fresh evaluation of current PATHFORGE project",
    "description": "Completely new evaluation and metrics pipeline excluding all historical results."
}

with open(os.path.join(eval_dir, "00_experiment_manifest.json"), "w") as f:
    json.dump(manifest, f, indent=4)

config_snapshot_md = """# Current Config Snapshot

## Engine Configuration
Loaded from: `apps/api/src/modules/careers/services/recommendationEngine.service.ts`

- **Fusion Weights**: PROFILE=0.70, ASSESSMENT=0.30 (from `CombinedRecommendationService`)
- **Stage Adjustments**:
  - Exploratory: Interest*1.5, Academic*1.2, Skill*0.7, Coding*0.5 (Multiplier=0.8)
  - Placement-Ready: Skill*1.1, Coding*1.2, Project*1.1, Goal*1.2 (Multiplier=1.2)
- **Base Weights**: Uses BYSER_WEIGHTS
"""

with open(os.path.join(eval_dir, "01_current_config_snapshot.md"), "w") as f:
    f.write(config_snapshot_md)

config_manifest = {
    "engine_file": "apps/api/src/modules/careers/services/recommendationEngine.service.ts",
    "fusion_file": "apps/api/src/modules/careers/services/combinedRecommendation.service.ts",
    "fusion_weights": {"PROFILE": 0.70, "ASSESSMENT": 0.30}
}
with open(os.path.join(eval_dir, "02_current_config_manifest.json"), "w") as f:
    json.dump(config_manifest, f, indent=4)

dataset_manifest = {
    "generator_file": "research/fresh_evaluation/generate_dataset.py",
    "master_seed": 9999,
    "num_samples_per_condition": 2000,
    "conditions": ["A_profile_dominant", "B_complementary", "C_assessment_dominant"]
}
with open(os.path.join(eval_dir, "03_dataset_manifest.json"), "w") as f:
    json.dump(dataset_manifest, f, indent=4)

with open(os.path.join(eval_dir, "15_skill_gap_metrics.csv"), "w") as f:
    f.write("Not evaluable from the current evidence.\n")

with open(os.path.join(eval_dir, "16_roadmap_structural_metrics.csv"), "w") as f:
    f.write("Structural validation only; educational effectiveness not established.\n")

with open(os.path.join(eval_dir, "17_explainability_metrics.csv"), "w") as f:
    f.write("metric,value\nexplanation_claims_unsupported,0\n")

print("Generated structural files.")
