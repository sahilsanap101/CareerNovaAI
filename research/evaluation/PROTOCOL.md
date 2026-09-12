# Experimental Protocol

## Execution Guidelines
Unbiased comparisons between Legacy PathForge heuristics and Graph-Constrained baselines occur strictly under the following controlled protocols:

1. **Deterministic Random Seeds**:
   All topological sorts, tie-breakers, and batch evaluation processes instantiate via a fixed global seed (`RANDOM_SEED_BETA`) ensuring computational repeatability identically across distributed environments.
2. **Explicit Temporal Splitting (No Leakage)**:
   Predictive models referencing job market frequencies explicitly segregate historical arrays. The Demand Engine calculating Priority limits $Priority(u,s,t_1)$ strictly utilizes datasets $Time \leq t_1$. No futuristic labor metrics can leak backward into historical roadmap generation.
3. **Statistical Significance**:
   - Because $N$ generated roadmap lengths vary across permutations, empirical validation must execute $N \ge 300$ simulations covering uniform boundary profiles to achieve Normalcy assumptions. 
   - Uses **Paired t-tests** assessing metric deviations (e.g. Utility/Cost differences) mapping algorithmic significance ($p < 0.05$).
4. **Effect Size (Cohen's $d$)**:
   Statistically significant differences are strictly paired with absolute Effect Size distributions indicating practical observable variances masking large $n$-value inflations.
