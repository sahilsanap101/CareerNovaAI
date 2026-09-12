# Counterfactual Simulation Operators

Evaluating "What-If" scenarios computationally ensures PathForge escapes localized heuristics limits (the downfall of R0 models). The simulation injects the following rigid perturbations mid-computation against an actively executing Roadmap sequence generating strict deviations:

```typescript
type PerturbationMatrix = 
  | 'PROFICIENCY_INC' | 'PROFICIENCY_DEC' 
  | 'SKILL_ADD' | 'SKILL_REMOVE'
  | 'MARKET_DEMAND_INC' | 'MARKET_DEMAND_DEC' | 'MARKET_EMERGING'
  | 'PREREQUISITE_EDGE_ADD' | 'PREREQUISITE_EDGE_REMOVE'
  | 'GLOBAL_BUDGET_VACILLATION';
```

## The Experimental Pipeline
1. Isolate the target synthetic Student state vector ($S_0$) mapping variables explicitly to a control trajectory ($R_{control}$).
2. Select a singular `PerturbationMatrix` variable and mutate exactly ONE corresponding field inside the matrix ($S_A$).
3. Generate the perturbed trajectory outputs ($R_{perturbed}$).
4. Compute delta variance against expected Monotonic Logic defined strictly via established algorithms properties. 

Algorithms failing the Monotonicity logic constraints expose intrinsic volatility inside sequence definitions. Formal evaluation outputs tabulate exactly how many simulated perturbations triggered violations.
