# PathForge Experimental Metrics

This document formalizes the variables required to publish evaluating tests against the Baseline (B0/R0) implementations. Note that no ground truth can be internally fabricated; tracking these metrics requires concrete historic user-outcomes (e.g., retrospective datasets where $c_{actual}$ is known).

## Career Recommendation Metrics

| Metric | Definition | Required Truth | Interpretation / Limitation |
|---|---|---|---|
| **Recall@K** | Measures if the true chosen career appears mathematically in the top $K$ outputs ($K=1,3,5$). | True target career ($c_{true}$). | High Recall@1 indicates perfect system understanding of user intent. Limited by assumptions that students only ever have *one* optimal path. |
| **Precision@K** | Ratio of relevant careers suggested within the top $K$. | Dataset of acceptable alternative pathways. | Extremely difficult to measure properly without subjective expert labeling of "valid" pathways. |
| **MRR** | Mean Reciprocal Rank: Average of $\frac{1}{\text{rank}(c_{true})}$. | Target career. | Strongly penalizes algorithms pushing the true career outside the Top 3. |
| **NDCG@K** | Normalized Discounted Cumulative Gain scaling relevance incrementally down the rank order. | Graded relevance arrays mapping similarities. | Best overall metric for sequential models but requires dense distance mapping to be valuable. |
| **Spearman** | Rank correlation assessing how closely the internal scoring engine aligns against known labor consensus hierarchies. | External market priority ranking arrays. | Useful strictly for evaluating the Market Alignment subset delta. |

## Roadmap Output Metrics
Unlike matching models, sequence outputs evaluate topological traversal constraints and resource boundaries.

| Metric | Definition | Required Truth | Interpretation / Limitation |
|---|---|---|---|
| **Prerequisite Violation Rate** | Number of blocked skills sequenced before their blockers. | Formal Skill DAG definitions. | Must strictly equal `0` in formal B3/R4 constraints. |
| **Feasible Plan Rate** | Ratio of generated roadmaps resolving fully successfully vs crashing constraints. | None. Absolute computational metric. | Measures systemic brittleness. |
| **Learning-Budget Compliance** | Difference between $\sum \text{AllocatedCost}$ and $Budget_{max}$. | None. | Verifies the bounds algorithms. |
| **Utility per Learning Cost** | $\frac{\text{Average Priority}}{\text{Hours Allocated}}$ | Known dataset constraints. | Measures 'cognitive ROI'. |
| **Weighted Skill Gap Reduction** | Sum of Target Gap bridged normalized recursively by Career Importance bounds. | None. | Evaluates completion trajectory vs deferred tails. |
| **Market-Weighted Coverage** | Sum of specific market demand velocity bridged. | Up-to-date Job Engine frequencies. | Correlates learning directly to hire-ability scaling. |
| **Roadmap Churn / Stale Rate** | Diff measurement across temporal $t_0 \rightarrow t_1$. | $S_t, M_t$ transition arrays. | Bounding constraints for closed-loop over-adaptation. |
| **Planning Runtime** | Deterministic CPU traversal execution speed. | None. | Captures scaling failures in DAG closure loops. |
