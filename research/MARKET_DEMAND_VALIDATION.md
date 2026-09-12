# Market Demand Validation Protocol

## 1. Fixture-Based Unit Testing
All deterministic frequency equations, min-max normalizations, and binomial confidence bounds are asserted against manual synthetic arrays of size $N < 100$ resolving to static known analytical answers. 

## 2. Invariant Tracking
- **Bounded Properties**: Ensures that for all $s,c,t$, $0 \leq GlobalDemand \leq 1$ and $0 \leq CareerDemand \leq 1$.
- **Subset Invalidation**: Asserts that $\sum_{p \in Postings(c)} p \leq |Postings|$ to prevent career subset sizes from violating global boundary metrics.
- **Confidence Penetration**: Ensures the returned confidence lower-bound never exceeds the empirical frequency observation $\hat{p}$.

## 3. Ground-Truth Comparisons
Where macroscopic labor statistics are available through national demographic APIs (e.g., BLS or OECD), large-scale output calculations of aggregate $CareerDemand$ indices will be cross-referenced for correlative validity to ensure the pipeline isn't diverging significantly from general labor consensus.
