# Career Model Comparison Results

| Method                  | Candidate set   | Top-1   | Top-3   | Top-5   | MRR    | NDCG@5   | Macro F1   | Confidence interval   | Leakage status   |
|:------------------------|:----------------|:--------|:--------|:--------|:-------|:---------|:-----------|:----------------------|:-----------------|
| A - Random Baseline     | 15 careers      | 6.80%   | 18.20%  | 30.20%  | 21.61% | 18.23%   | 6.76%      | N/A                   | NO               |
| A - Random Baseline     | 60 careers      | 1.00%   | 4.40%   | 7.60%   | 7.16%  | 4.30%    | 0.37%      | N/A                   | NO               |
| B - Most Popular        | 15 careers      | 12.40%  | 28.60%  | 43.00%  | 28.59% | 27.49%   | 1.47%      | N/A                   | NO               |
| B - Most Popular        | 60 careers      | 12.40%  | 28.60%  | 43.00%  | 28.59% | 27.49%   | 1.47%      | N/A                   | NO               |
| C - Profile Only        | 15 careers      | 7.40%   | 20.00%  | 31.80%  | 22.33% | 19.33%   | 6.57%      | N/A                   | NO               |
| C - Profile Only        | 60 careers      | 7.40%   | 20.00%  | 31.80%  | 22.33% | 19.33%   | 6.57%      | N/A                   | NO               |
| D - Assessment Only     | 15 careers      | 7.80%   | 21.80%  | 36.60%  | 23.47% | 21.62%   | 3.84%      | N/A                   | NO               |
| D - Assessment Only     | 60 careers      | 8.00%   | 22.00%  | 36.80%  | 21.77% | 21.50%   | 3.84%      | N/A                   | NO               |
| E - 70:30 Fusion        | 15 careers      | 7.60%   | 20.20%  | 32.20%  | 22.51% | 19.61%   | 6.74%      | N/A                   | NO               |
| E - 70:30 Fusion        | 60 careers      | 7.60%   | 20.20%  | 32.20%  | 22.51% | 19.61%   | 6.74%      | N/A                   | NO               |
| F - Best Fusion (10:90) | 15 careers      | 8.00%   | 21.00%  | 35.00%  | 22.98% | 20.89%   | 7.26%      | N/A                   | NO               |
| F - Best Fusion (10:90) | 60 careers      | 8.00%   | 21.00%  | 35.00%  | 22.99% | 20.89%   | 7.26%      | N/A                   | NO               |
| I - ML Random Forest    | 15 careers      | 37.40%  | 71.80%  | 88.00%  | 57.60% | 64.06%   | 32.47%     | N/A                   | NO               |
| I - ML Random Forest    | 60 careers      | 37.40%  | 71.80%  | 88.00%  | 57.60% | 64.06%   | 32.47%     | N/A                   | NO               |