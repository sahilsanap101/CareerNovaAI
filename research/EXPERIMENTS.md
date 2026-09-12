# Structured Experiments Documentation

Each parameter set isolates a specific algorithmic feature for IEEE validation.

## Defined Benchmarks
1. **Experiment E1 (Ablation Constraints)**: Iterating models A0 (Pure Gap) through A6 (Full Graph Constraint). Validates utility maximization vs DAG boundary crashes.
2. **Experiment E2 (Parameter Sensitivity)**: Evaluates roadmap churn scaling exactly as explicit variables (e.g., $MarketVolatility, BudgetLimits$) fluctuate.
3. **Experiment E3 (Counterfactual Safety)**: Executes bounds limits asserting deterministic logic overrides preventing $Proficiency \rightarrow Priority$ inversion errors (Monotonicity Check). 

Any manual adjustments to the `./configs/` directory requires an explicit flag tagging `MODEL_VERSION=custom` to prevent corrupting baseline proofs.
