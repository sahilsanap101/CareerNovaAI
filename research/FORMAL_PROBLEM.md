# Formal Problem Definition

The problem addressed by this framework is defined mathematically and systematically as an optimization problem under constraint.

## Inputs (The "Given")
The algorithmic model accepts the following state vectors and matrices:
- **$S$**: A student's current skill state (e.g., a vector of proficiencies).
- **$C$**: A target career objective.
- **$W_c$**: Career-specific skill requirements (importance weights representing how vital a skill is for career $C$).
- **$M$**: Observed labor-market skill demand (external weighting reflecting hiring frequency).
- **$P$**: A directed acyclic graph detailing prerequisite relationships among skills (e.g., Skill $A \rightarrow$ Skill $B$).
- **$B$**: A finite learning budget (temporal or cognitive constraints dictating the maximum subset of skills that can be acquired per iteration).

## Output (The Objective)
The system must determine a skill learning sequence (roadmap path) $R = (s_1, s_2, \dots, s_k)$ such that:
- Total career-market utility of $R$ is maximized.
- $R$ strictly obeys the topological ordering required by $P$.
- The cumulative cost of acquiring $R$ does not exceed $B$.

## Dynamic Re-planning (Closed-Loop)
Because learning is non-linear and markets are volatile, the planning vector $R$ is not static. The system executes a closed-loop trajectory correction, meaning it must subsequently re-plan and output a new $R'$ when:
- The student's measured skill state $S$ changes (due to completion, failure, or reassessment).
- The market-demand state $M$ changes (due to temporal shifts in labor data).
