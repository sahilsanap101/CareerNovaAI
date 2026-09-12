# B3 Constraint Matrices

The Prerequisite-Constrained Planner enforces strict boundary checks throughout the learning generation loop. 

## 1. Zero Violation Topologies (Prerequisite Exclusivity)
If Node $C$ depends heavily on Node $B$, $C$ CAN NEVER be placed in an equal or earlier execution phase than $B$, regardless of how aggressively $C$'s Market Demand priority scales. The planner strictly prohibits "optimistic learning", honoring physical reality constraints over mathematical urgency parameters.

## 2. Transparent Backtracking Strategies
If a highly-demanded end-state target (e.g., Deep Learning) remains persistently `BLOCKED`, the graph recursively injects the missing prerequisite (e.g., Backpropagation calculus) seamlessly into the active execution phase, propagating a documented reason (`"Scheduled due to dependency on target: Deep Learning"`).

## 3. Strict Resource Bounding
Learning requires static cognitive load/hour limits. The solver packs active phases recursively until the `PhaseLearningCostThreshold` overflows. Upon hitting the threshold, the simulated timeline forcibly chunks into a new iterative phase variable ($t+1$). 
- This physically maps theoretical roadmap execution against calendar viability metrics without speculative LLM variance logic.
