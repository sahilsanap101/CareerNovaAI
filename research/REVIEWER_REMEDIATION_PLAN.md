# PathForge REVIEWER REMEDIATION PLAN

Based on the highly critical mock reviews spanning ML Rigor, Educational Validity, and Methodological Flaws, the following prioritized architecture improvements must be installed prior to IEEE submission.

## PRIORITY 1: The Dataset Crisis (Reviewer 2 & 3)
**Issue**: Using synthetic data invalidates the entire rigorous logging apparatus. No matter how perfectly we measure B3 against B1, running it on fictional profiles yields zero practical proof.
- **Action Required**: Cease using purely localized `synthetic/` mocks. Ingest public historical data, such as mapping anonymized Resume data, StackOverflow Developer histories, or generating a hybrid dataset modeled strictly on real Bayesian distributions of the job market.
- **Effort**: High

## PRIORITY 2: The Baseline Crisis (Reviewer 1)
**Issue**: Comparing internal rule-bases ($B0 \rightarrow B4$) proves structural competency but not academic novelty.
- **Action Required**: Implement at least one "External" algorithmic baseline. E.g., importing a collaborative-filtering recommender or a standard heuristic planner as an `External Baseline (E1)`. Demonstrating PathForge beats a standard matrix factorization guarantees theoretical viability.
- **Effort**: Medium

## PRIORITY 3: The Parameters Crisis (Reviewer 1 & 2)
**Issue**: Hardcoding values such as "confidence 98" or "Python costs 25 hours".
- **Action Required**:
  1. Remove `confidence` entirely as scoped in the `SCIENTIFIC_CLAIM_AUDIT.md`.
  2. Implement an Elo-based or decay-based tracking parameter for `LearningCost` instead of flat hardcodes, shifting to a parameterized dynamic curve.
- **Effort**: Medium

## PRIORITY 4: The Optimality Claims (Reviewer 1)
**Issue**: Using "Optimal", "Best", and "Real-time" inappropriately.
- **Action Required**: Refactor all logs. DAG algorithms prioritizing gap closure are greedy constraint-satisfaction paths, not globally optimal solutions. Replace UI and CLI logs with appropriate terminology: "Constraint-Satisfied Path" and "Highest Utility Node".
- **Effort**: Low
