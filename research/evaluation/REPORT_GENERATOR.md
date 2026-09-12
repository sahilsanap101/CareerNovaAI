# System Report Generators

The experiment architecture outputs data structures designed for universal plotting and tabulation integrations.

## 1. Machine-Readable Outputs (JSON)
The raw output preserves precise experimental variables, parameters, and generated object states to allow exact programmatic reconstruction. 
*(E.g., `experiment_results_123.json`)*

## 2. Quantitative Matrix (CSV)
To feed R or Python pandas quickly, the engine dumps flattened matrix tables bounding aggregated metrics per algorithm permutation, optimized strictly around:
- Algorithm Version
- Metric Index
- Result Score
- CI Upper/Lower

## 3. Visualization Stubs
Metrics enable out-of-the-box plot mapping for:
- Path Length distribution (Violin Plots).
- Career MRR mapping across weights (Heatmaps).
- Dependency Depth constraints (Network Topologies).
