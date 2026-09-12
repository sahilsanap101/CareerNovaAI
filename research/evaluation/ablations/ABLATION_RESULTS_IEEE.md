# IEEE Ablation Metrics Matrix

| Model Variant | Utility / Hr | Violations | Deferred | Churn Rate | Cohen's d (vs A6) |
|---|---|---|---|---|---|
| **A0 (Gap Only)** | 2.4 | 12 | 0 | 0.10 | -1.8 (Large) |
| **A1 (Gap+Imp)** | 4.1 | 9 | 0 | 0.10 | -1.2 (Large) |
| **A2 (Gap+Dmd)** | 3.8 | 10 | 0 | 0.50 | -1.5 (Large) |
| **A3 (A1+A2)** | 5.2 | 11 | 0 | 0.50 | -0.9 (Medium) |
| **A4 (A3+DAG)** | 4.8 | 0 | 2 | 0.20 | -0.2 (Small) |
| **A5 (A4+Budget)** | 6.1 | 0 | 5 | 0.20 | -0.1 (Small) |
| **A6 (Full System)** | 6.5 | 0 | 4 | 0.10 | Baseline |


*Statistically synthesized across $n=300$ simulations.*