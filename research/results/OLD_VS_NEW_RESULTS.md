# Old vs New Leakage-Free Results
| Metric | Old (Leakage Present) | New (Leakage-Free) | Difference | Interpretation |
|--------|---------------|-------------------|------------|----------------|
| Hit@1 | 0.650 | 0.650 | 0.000 | Masking the target role removed the GoalScore leakage, but accuracy remained identical. The deterministic heuristic is dominated purely by the procedurally generated skills. |
| Hit@5 | 0.854 | 0.854 | 0.000 | Same as above. |
| MRR | 0.739 | 0.724 | -0.015 | Minor ranking shifts occurred when the guaranteed +100 Goal Score was removed, but skills alone maintain the rank. |
