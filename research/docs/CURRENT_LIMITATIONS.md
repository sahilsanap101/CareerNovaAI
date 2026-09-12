# CURRENT LIMITATIONS

1. **Deterministic and Hardcoded AI**: LLM outputs do not dictate any backend algorithms; they act strictly as a UI translation layer parsing preset system prompts.
2. **Artificial Adaptability**: The Roadmap pacing modifier simply scales predefined timelines by fixed multipliers (e.g. `FAST=0.75`). It does not adapt to contextual micro-level knowledge graph traversal.
3. **No Real Graph Traversal**: The skill dependency network is a static array lacking mathematical validation algorithms for detecting loops or inferring granular ESCO node connectivity.
4. **Data Deserts**: Missing integration pipelines means large archives of raw O*NET and ESCO data sit functionally useless while the engine relies on seeded DB metadata.
5. **No ML Baselines**: The BYSER score cannot currently be compared to Collaborative Filtering (CF) or Content-Based Rec-Sys engines, preventing standard IEEE analysis.
6. **No Feedback Loops**: A user tracking task completion does not recursively recalculate the BYSER score live; the architecture demands distinct user-triggered reruns.
