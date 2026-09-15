npm run build --workspace=apps/api
npx tsx apps/api/src/research/experiments/variant_runner.ts
npx tsx apps/api/src/research/experiments/longitudinal_runner.ts
npx tsx apps/api/src/research/experiments/counterfactual_runner.ts
npx tsx apps/api/src/research/experiments/milp_runner.ts
npx tsx apps/api/src/research/experiments/semantic_runner.ts
npx tsx apps/api/src/research/experiments/robustness_runner.ts
npx tsx apps/api/src/research/experiments/exact_scaling_runner.ts
npx tsx apps/api/src/research/experiments/dynamic_baseline_runner.ts
