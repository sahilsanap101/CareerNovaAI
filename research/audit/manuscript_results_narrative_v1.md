# Results

## A. Controlled synthetic benchmark design
To evaluate the deterministic algorithms, a schema-compatible semantic benchmark (Synthetic V3) was generated via a causally controlled DAG. This dataset eliminates the label-leakage artifacts of earlier exploratory benchmarks and provides three controlled conditions (A: Profile Dominant, B: Complementary, C: Assessment Dominant) mapping latent traits to observable features across 15 career targets.

## B. Deterministic PATHFORGE evaluation
The deterministic scoring functions, $P(u,c)$ (Profile) and $Q(u,c)$ (Assessment), were evaluated offline using the exact production configuration weights. Overall performance for the heuristic scoring engines was poor across all conditions, struggling to effectively parse and align the multi-modal evidence matrix into accurate rankings. 

## C. Fusion-ratio evaluation
The primary hypothesis evaluated whether a 70:30 fixed linear combination of profile and assessment scores outperformed a profile-only (100:0) baseline. Results showed the 70:30 heuristic failed to consistently improve recommendation accuracy, actively degrading performance in Conditions A and C, while providing only marginal Top-1 benefits in Condition B. The fixed ratio was universally outperformed by the 100:0 profile-only baseline during hyperparameter validation.

## D. Learned baseline comparison
We compared the deterministic heuristics against standard tree-based learned estimators (Random Forest, HistGradientBoosting). The learned models substantially outperformed the deterministic PATHFORGE functions in every configuration. 

## E. Ablation analysis
Leave-one-out and zero-weight ablations demonstrated that while specific dimensions like Skills and Academics are predictive for learned models, the deterministic weighting schema in PATHFORGE is highly brittle. 

## F. Assessment information vs scoring-function recovery
Random Forest baselines trained exclusively on the 20 Likert assessment features extracted significant predictive information (especially in Condition C). However, the deterministic PATHFORGE Assessment-only heuristic failed to recover this information effectively, indicating a structural flaw in the manual question-to-career mappings rather than a lack of information in the assessment itself.

## G. Limitations
All findings are based on a synthetic environment. Real-world validation remains future work. The limitations of deterministic semantic matching are severely apparent under controlled evaluation.
