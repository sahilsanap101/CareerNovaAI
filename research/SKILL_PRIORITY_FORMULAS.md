# Skill Priority Formulas

## 1. Skill Gap Measurement
Measures the strictly unmastered distance relative to the target career bounds. If proficiency meets or exceeds requirement, gap equates to 0, ensuring no recursive training loops.

$$ Gap(u,s,c) = \max(0, RequiredProficiency(s,c) - StudentProficiency(u,s)) $$
*(Requires normalization domain [0,1] for proper multiplication downstream).*

## 2. Priority Function
Standard weighted urgency index mapping the direct relevance and temporal labor value of completing the gap. 

$$ Priority(u,s,c,t) = Gap(u,s,c) \times CareerImportance(s,c) \times MarketDemand(s,c,t) $$

### Normalization of Priority
Because scaling differs across domain structures, raw Priority inputs must be normalized across the subset of required career skills to support stable ranking scales in utility mapping.
$$ NormalizedPriority(s_{n}) = \frac{Priority(s_{n}) - \min(Priority(s_{subset}))}{\max(Priority(s_{subset})) - \min(Priority(s_{subset}))} $$

## 3. Utility Function (Cost-Adjusted Option)
Optionally introduces friction logic prioritizing "low hanging fruit"—high-priority targets with minimal cognitive processing thresholds/learning hours required.

$$ Utility(u,s,c,t) = \frac{Priority(u,s,c,t)}{LearningCost(s) + \epsilon} $$

*(Where epsilon is heavily small factor guarding against infinite division limits for instantly-attainable micro-skills).*
