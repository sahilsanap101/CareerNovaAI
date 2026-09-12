# Priority Parameter Sensitivity

## Behavioral Variations via Weight Adjustments

### Expanding The Utility Function
The implementation of the exact `LearningCost(s)` scalar exerts profound influence on generated pathways:

1. **High Variability in Cost ($\Delta$ = Large variance)**:
   - Divides high-value, high-cost skills significantly (e.g. learning 'Python Data Science Ecosystems' $= 200 \text{hrs}$). By dividing utility heavily, the planner fundamentally pivots focus toward low-cost quick-wins (e.g., 'Writing CSVs' $= 5 \text{hrs}$).
   - **Result**: The student achieves multiple rapid milestones, generating high dopamine fulfillment, but sacrifices core macro-competence development until entirely cornered by prerequisite constraints.

2. **Negligible Cost Scaling**:
   - Setting $LearningCost$ globally to $1.0$ effectively disables Utility modifications, collapsing the formula purely onto $Priority$.
   - **Result**: Generates grueling, monolithic roadmap stages where students tackle hyper-complex targets purely driven by labor-market valuation, reducing retention probability drastically.

### Market Demand Saturation
Because $Priority$ relies on multiplicative $MarketDemand$, any sudden labor shifts radically reconfigure priority targets. 
- A $0.0$ Market Demand multiplier zeroes out the Priority completely. We resolve this by ensuring MarketDemand operates within specifically floored $MinMax$ bounded logic as previously mapped in the `MarketDemandEngine` (e.g., minimum bound 0.05).
