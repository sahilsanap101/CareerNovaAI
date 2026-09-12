# Job-Market Skill Demand Formulas

## 1. Global Demand Frequency
The raw proportionality of a skill across the entire sampled corpus at time $t$.

$$ GlobalDemand(s,t) = \frac{\sum_{p \in Postings(t)} Contains(p, s)}{|Postings(t)|} $$

## 2. Career-Specific Frequency
The localized relevance of a skill filtered explicitly to a target occupation or career bucket $c$.

$$ CareerDemand(s,c,t) = \frac{\sum_{p \in Postings(c,t)} Contains(p, s)}{|Postings(c,t)|} $$

## 3. Normalized Demand Score (Z-Score or Min-Max)
Raw frequency inherently biases toward ubiquitous foundational requirements. A normalized framework establishes rankable utility. Using a standard min-max scaling parameterized over the subset of skills observed for career $c$:

$$ NormalizedFreq(s,c,t) = \frac{CareerDemand(s,c,t) - \min_k(CareerDemand(k,c,t))}{\max_k(CareerDemand(k,c,t)) - \min_k(CareerDemand(k,c,t))} $$ 

## 4. Market Share
The ratio of postings within career $c$ requiring skill $s$ against the global postings requiring skill $s$. Represents the distinctiveness of the skill to the target career.

$$ MarketShare(s,c,t) = \frac{\sum_{p \in Postings(c,t)} Contains(p, s)}{\sum_{p \in Postings(t)} Contains(p, s)} $$

## 5. Temporal Trend (Derivative Velocity)
Analyzes the growth or decay of demand across two distinct epoch boundaries $(t_1, t_2)$.

$$ Trend(s,c,t_1,t_2) = \frac{CareerDemand(s,c,t_2) - CareerDemand(s,c,t_1)}{CareerDemand(s,c,t_1)} $$
*(Guarded by a threshold floor to prevent zero-division artifacts).*

## 6. Confidence Interval (Binomial Proportion)
Because job postings are an imperfect sample of true labor reality, frequency must be protected by a confidence interval (utilizing an approximation like the Wilson Score interval when sample size is low, or standard Normal when high).

For standard error ($SE$):
$$ SE = \sqrt{ \frac{\hat{p}(1-\hat{p})}{n} } $$
Where $\hat{p}$ is the $CareerDemand$ and $n$ is the $SampleSize$.

$$ \text{CI}_{95\%} \approx \hat{p} \pm 1.96 \times SE $$
*(Demand calculations return the lower-bound of the CI to naturally penalize low-sample skills).*
