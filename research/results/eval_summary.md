# BYSER Evaluation Results (Synthetic)

> **METHODOLOGY WARNING**: The dataset evaluated here was self-generated synthetically using domain correlation boundaries. It is NOT independently sourced empirical ground truth. It acts as a sanity-check for script algorithm wiring.

- **Precision@1**: 78.0%
- **Macro-F1 Score**: 77.9%

### Per-Class Metrics
| Class | Precision | Recall | F1 Score |
|---|---|---|---|
| **Frontend Developer** | 79.5% | 89.2% | 84.1% |
| **Backend Developer** | 84.9% | 67.2% | 75.0% |
| **AI Engineer** | 71.6% | 77.9% | 74.6% |

### Confusion Matrix (Rows=Truth, Cols=Predicted Top1)
| Truth \ Predicted | Frontend Developer | Backend Developer | AI Engineer |
|---|---|---|---|
| **Frontend Developer** | 58 | 1 | 6 |
| **Backend Developer** | 7 | 45 | 15 |
| **AI Engineer** | 8 | 7 | 53 |
