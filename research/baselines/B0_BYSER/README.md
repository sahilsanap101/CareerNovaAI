# Baseline B0 (BYSER)

This folder contains the formal, frozen parameters and definition of the original PathForge Career Recommendation engine ("BYSER"). 

It exists as a **Baseline** solely for experimental comparison against novel ML-driven implementations.

## Preservation Guarantee
The implementation of B0 is strictly preserved. It deterministically runs the heuristic weighting function found in `apps/api/src/modules/recommendations/engine/byserEngine.ts`. No improvements, stochastic elements, external LLM calls, or optimizations are permitted within this wrapper.

## Outputs
To facilitate reproducible pipeline testing, this baseline is accessed via `wrapper.ts` which evaluates a profile and returns a standard JSON object containing:
- `career_id`
- `score` (0-100)
- `rank`
- `factor_scores`
- `missing_skills`
- `strengths`
