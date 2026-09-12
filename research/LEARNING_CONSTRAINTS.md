# Formal Learning Constraints Matrix

## Absolute Resource Limitations
The human ability to acquire new theoretical or technical competencies is fundamentally restricted by temporal constraints. 

### Formula
$$ LearningBudget = WeeklyHoursAvailable \times TotalWeeks $$
$$ \sum_{s \in \text{Roadmap}} Cost(s) \leq LearningBudget $$

Constraints are strictly unyielding. The planner algorithm is hard-capped from suggesting a learning sequence that structurally overflows this equation.

## Provenant Cost Assignments
No system generator is permitted to "hallucinate" learning times to make the math look favorable. Values must derive directly from dataset explicit definitions, expert heuristics mapping to standard academic courses (e.g., 3-credit hour = $120 \text{ hours}$), or clearly labeled experimental baselines.

## System Failure and Deferral
When `LearningBudget` is mathematically insufficient to bridge the aggregate remaining gap required for the target career vector:
1. **Explain the shortfall**: The output explicitly acknowledges what percentage of the domain is achievable.
2. **Select optimal subset**: The solver identifies and allocates remaining nodes prioritizing maximum multi-path Utility (often heavily favoring universally structural foundations over niche end-skills).
3. **Queue Deferred Skills**: Denotes all downstream nodes as explicitly bypassed due to lack of time, providing clarity over what the student *will not* know by the end of the window.
