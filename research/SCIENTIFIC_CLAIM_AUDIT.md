# SCIENTIFIC CLAIM AUDIT (HOSTILE REVIEW)

This document constitutes a hostile, IEEE-styled architectural review of the PathForge repository. Any heuristic, hallucinated, or mathematically isolated boundaries explicitly documented below will strictly result in rejection if published.

## Findings Matrix

### Issue 1: Hardcoded "Confidence" Heuristics (Leakage)
- **Location**: `apps/api/src/modules/recommendations/engine/byserEngine.ts` (Line 176)
- **Claim**: The core engine claims "confidence" in recommendations.
- **Evidence**: `const confidence = Math.round(Math.min(98, 60 + (matchedSkillNames.length * 5) + ...))`
- **Why Reviewer May Reject It**: This is a direct integer hallucination. There is zero statistical backing, standard error, or probabilistic formulation supporting this calculation. It is arbitrary weighting masquerading as statistical confidence.
- **Required Correction**: Eradicate `confidence` or explicitly rename it to `heuristic_score`. Expose actual algorithm calculations (e.g. `B1 Market-Aware`) instead.
- **Severity**: CRITICAL

### Issue 2: Unverified "Best" & "3x Faster Growth" Marketing Claims
- **Location**: `apps/web/src/pages/Landing.tsx`
- **Claim**: "...recommends the best career path tailored for you." and "3x Faster career growth".
- **Why Reviewer May Reject It**: PathForge provides a localized optimization (greedy topological DAG resolution), mathematically, this is an NP-Hard problem so claiming "best/optimal" without global convexity proof is fraudulent. "3x Faster" has zero A/B comparative evidence or longitudinal dataset backing.
- **Required Correction**: Remove "best" and "3x". Use "Mathematically aligned", "Prioritized", and "Optimized Trajectory" referencing explicit DAG models.
- **Severity**: HIGH

### Issue 3: "Real-time" AI claims lacking real-time architectures
- **Location**: `apps/web/src/pages/AI/InterviewCoach.tsx`
- **Claim**: "real-time coaching feedback"
- **Why Reviewer May Reject It**: There are no websockets, event-driven streams, or sub-50ms closed loops observed in the TS pipeline. Standard REST polling or sequential API calls are not "Real-time".
- **Required Correction**: Reword to "Synchronous" or "On-Demand" evaluation generation.
- **Severity**: MEDIUM

### Issue 4: Fabricated Salary and Growth Metrics
- **Location**: `apps/api/src/modules/recommendations/engine/byserEngine.ts` & `CareerComparison.tsx`
- **Claim**: Explicit static `$X LPA` salaries and arbitrary `%` growth rates are piped natively to the UI.
- **Why Reviewer May Reject It**: Injecting fabricated JSON metrics over deterministic datasets poisons the evaluation pool.
- **Required Correction**: Isolate Market features to pull explicitly from proven Market Volatility arrays ($Demand_t$). Nullify arbitrary salary values, replacing them with statistical Z-scores or Market Alignment Index factors.
- **Severity**: CRITICAL

### Issue 5: Misuse of "Optimal" in Log Sequences
- **Location**: `apps/api/src/research/baselines/B3_CONSTRAINED_PLANNER/planner.ts` & `experimentRunner.ts`
- **Claim**: `reason: 'Identified as highly optimal callable target.'`
- **Why Reviewer May Reject It**: B3 utilizes Priority Gap weighting over Topological constraints. This is a Greedy sequential heuristic, not a guarantee of global roadmap optimality. Terminology must reflect constraint satisfaction over pure optimality.
- **Required Correction**: Replace `optimal` logs with `Highest-priority valid graph node`.
- **Severity**: HIGH
