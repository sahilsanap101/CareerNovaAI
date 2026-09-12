# Roadmap Versioning Strictness

## Entity Immutable Rule
The active array of scheduled nodes provided to a learning user is conceptually handled identically to distributed immutable code commits.

1. **Snapshots**: Every discrete computation of the planner algorithm returns an object matching the internal schema requirement `RoadmapVersion`, indexed with $v_{n+1}$.
2. **Atomic Iterations**: You cannot directly mutate the specific node values in $R_t$. You derive $R_{t+1}$ based on current boundaries and compare the array mapping differences. 

## The Change Record (`RoadmapChange`)
When $R_{t} \neq R_{t+1}$, the system populates a structural delta object capturing:
- `AddedNodes`: High priority newly injected via market demand increases or unlocked upstream bounds.
- `DroppedNodes`: Targets ejected outside global constraints parameters, deferred due to resource exhaustion, or reduced priority scaling. 
- `RetainedNodes`: Target arrays overlapping concurrently.
- `CauseVector`: Precise pointers identifying exactly *what specific transition* unhinged the node states (Student vs Market).
