# Production Readiness Decision

## Final Decision
**B. Promising research candidate, but further synthetic-data or evaluation corrections are needed.**

## Justification
The Random Forest ensemble on top of manual heuristic scores is technically sound. The audit confirms that the out-of-fold metrics are legitimate (Top-1: 37.40%, MRR: 57.60%), mathematically outperforming the naive 70:30 fusion heuristic (Top-1: 7.60%). 

However, because the current labels are generated synthetically—meaning the input features were probabilistically constructed from the ground-truth target—the model is effectively learning to reverse-engineer the data-generation pipeline. 

### Conclusion
The reported performance is reproducible and the cross-validation methodology is valid. Nevertheless, **real-world predictive validity remains completely unknown.** You cannot infer production readiness from this accuracy alone. 

Before rolling this out to real students, you must collect a human-validated dataset (with real students providing independent career preferences) to verify that this model continues to outperform the heuristic engine on non-synthetic data. Do not change production code until human-validated evaluation confirms these performance gains.
