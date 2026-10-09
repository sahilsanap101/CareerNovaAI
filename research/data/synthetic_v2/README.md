# PATHFORGE Synthetic Dataset v2

This directory contains the Version 2 synthetic benchmark designed specifically to test the PATHFORGE Assessment-Fusion hypothesis without falling prey to circular generation or target leakage.

## Contents
- `generator_v1.py`: The Python script that algorithmically generates the data.
- `generator_config_v1.json`: The deterministic configuration file controlling seeds, noise, and latent mappings.
- `generator_specification_v1.md`: The detailed markdown specification of the causal graph.
- `synthetic_v2_A.csv`: Condition A (Profile-dominant).
- `synthetic_v2_B.csv`: Condition B (Balanced).
- `synthetic_v2_C.csv`: Condition C (Assessment-dominant).

## Generation Philosophy
Unlike v1, the observable profile dimensions and assessment responses in v2 are NEVER generated conditional on the target `career_suitability`. Instead, they are all downstream nodes of a shared `Latent Preference Vector`. This guarantees that ML models cannot simply reverse-engineer deterministic synthetic labeling rules.
