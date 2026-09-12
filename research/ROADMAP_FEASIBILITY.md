# Feasibility Validation Engine

Roadmap algorithms intrinsically possess vulnerabilities toward generating disconnected islands or circular learning loops in untested environments.

## Automated DAG Feasibility (The V-Zero Asserter)
To legally confirm generation stability, mathematical sequences are evaluated post-generation by a strict detached script: `validator.ts`.

It runs a simulated timeline iteration exactly mirroring the student's output roadmap phases ($1$ to $N$), injecting scheduled skills into a mock state matrix linearly. 
At every node injection, it evaluates the global standard graph:
- If `SkillGraph.evaluateEligibility(node, active_state) === 'BLOCKED'`, the Asserter throws a catastrophic structural failure exception.
- Only sequences resulting in exactly `PrerequisiteViolationCount == 0` are cleared for theoretical deployment scenarios. 
- Deadlocks (where a phase fails to append any node despite remaining required skills existing without sufficient budget allowance) trigger a `BudgetDeadlockException`.
