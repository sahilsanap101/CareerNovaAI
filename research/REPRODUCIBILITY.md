# Reproducibility Execution Protocol

All mathematical derivations defined under `/baselines/` require rigid constraint structures to echo identical metric boundaries when examined by secondary investigators. 

## The One-Command Pipeline
To isolate local dependency sprawl, a single-entry CLI typescript file runs all simulations passing synthetic student matrices against baseline variations. Execution enforces unique IDs preventing result overwriting.

```bash
# General Execution
npm run research:experiment -- --config configs/main.json
```

## Structure of the Data Artifacts
Executing the CLI auto-generates the directory architecture separating computational lifecycles:
*   `/results/raw/`: The 1:1 JSON outputs containing the explicit sequence parameters generated ($t_0 \rightarrow t_n$).
*   `/results/processed/`: Scrubbed matrix objects stripped of text-generators, housing pure $SkillFit, GoalFit$, and $Gap$ values.
*   `/results/tables/`: Natively formatted Markdown tables (e.g., Ablation matrices) strictly mirroring IEEE drafts.
*   `/results/figures/`: CSV bounds structured for Pandas/R `matplotlib` extraction.
*   `/results/statistics/`: Standard Deviation, Wilson Confidence Bounds, and Significance metrics computed from variance overlaps.
