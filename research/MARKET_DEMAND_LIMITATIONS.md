# Job-Market Demand Limitations

## Explicit Experimental Constraints

The calculated variables in the Job-Market Demand Engine exhibit the following strict boundaries and constraints:

1. **Sampling Bias**: 
   - Postings retrieved from specific aggregates (e.g., LinkedIn vs. Indeed vs. Public NGO domains) exhibit platform bias (frequently skewing toward white-collar SaaS roles). Consequently, $GlobalDemand$ is only global *relative to the sampled corpus*.
2. **Ghost Jobs & Perpetual Listings**:
   - Despite deduplication heuristics, corporations frequently leave generic "evergreen" postings active or post duplicate requisitions across diverse geographic localities spanning identical roles. This inherently inflates demand frequency.
3. **Keyword Overloading**:
   - Poor job descriptions often list excessive secondary skills resembling a "wishlist" rather than strict prerequisites, creating collinearity in the $CareerDemand$ matrices.
4. **Proxy for Hire Rate**:
   - $GlobalDemand(s, t)$ measures the *intent to recruit* a skill vector, but does NOT equate 1:1 with the volume of completed hires or job security.
5. **Lag Indicators**:
   - Job postings reflect the capitalization needs of previous economic quarters and project demands; they are lagging indicators compared to leading market innovations (e.g., internal unadvertised adoption of new frameworks).
