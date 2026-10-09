import os
import json

base_dir = 'c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/audit'

def write_md(filename, content):
    with open(os.path.join(base_dir, filename), 'w', encoding='utf-8') as f:
        f.write(content)

# 2. FINAL EXPERIMENTAL STATUS
final_exp_status = """# Final Experimental Status

- **Original synthetic benchmark status**: Deprecated/Unusable for final validation due to unknown generation dependencies (Prompt 6, 7).
- **Assessment v1 status**: Formally specified, extracted, and frozen (Prompt 8, 9).
- **Synthetic v2 status**: Structurally controlled, verified latent causal structure, but not consumable directly by PATHFORGE schema (Prompt 10).
- **Synthetic v3 status**: Final controlled benchmark, PATHFORGE schema compatible, used for all final evaluations (Prompt 12).
- **Deterministic PATHFORGE status**: Fully evaluated offline using production Typescript weights/algorithms (Prompt 13).
- **Learned-baseline status**: Fully evaluated using Random Forest and HistGradientBoosting (Prompt 14).
- **Real-student evaluation status**: **NO REAL-STUDENT VALIDATION HAS BEEN COMPLETED.**
"""
write_md('final_experimental_status.md', final_exp_status)

# 5. PRIMARY HYPOTHESIS RESULT
primary_hypothesis = """# Primary Hypothesis Result (70:30 Fusion)

**H0 (Null Hypothesis):** The fixed 70:30 deterministic fusion strategy performs less than or equal to a 100:0 profile-only strategy.
**H1 (Alternative Hypothesis):** The fixed 70:30 deterministic fusion strategy significantly improves recommendation performance (e.g. Top-1 accuracy or MRR) over a 100:0 profile-only strategy.

## Condition A (Profile Dominant)
- **Comparison:** 70:30 vs 100:0 (M4 vs M0)
- **Top-1 Difference:** -0.67 percentage points (M4: 8.67%, M0: 9.33%)
- **95% CI (MRR difference):** [-0.0039, 0.0001]
- **Statistical Test:** Wilcoxon signed-rank
- **P-value:** < 0.001 (for a negative difference)
- **Decision:** Fail to reject H0 (Fusion degrades performance).

## Condition B (Complementary)
- **Comparison:** 70:30 vs 100:0 (M4 vs M0)
- **Top-1 Difference:** +2.33 percentage points (M4: 8.00%, M0: 5.67%)
- **95% CI (MRR difference):** [0.0019, 0.0037]
- **Statistical Test:** Wilcoxon signed-rank
- **P-value:** < 0.001
- **Decision:** Statistically significant but practically minimal improvement. Overall deterministic accuracy remains extremely low.

## Condition C (Assessment Dominant)
- **Comparison:** 70:30 vs 100:0 (M4 vs M0)
- **Top-1 Difference:** -5.0 percentage points (M4: 5.00%, M0: 10.00%)
- **95% CI (MRR difference):** [-0.0545, -0.0371]
- **Statistical Test:** Wilcoxon signed-rank
- **P-value:** < 0.001 (for negative difference)
- **Decision:** Fail to reject H0. Assessment-based fusion catastrophically fails in the exact condition where assessment data is strongest.

## Final Classification
**NOT SUPPORTED**
"""
write_md('primary_hypothesis_final.md', primary_hypothesis)

# 6. ASSESSMENT COMPONENT DIAGNOSIS
assessment_diagnosis = """# Assessment Component Diagnosis

**A. Does the observable assessment data contain predictive information?**
Yes. Learned baselines (RF Assessment-Only) significantly outperform random chance and the deterministic PATHFORGE Assessment-Only baseline, confirming the 20 Likert features contain a recoverable causal signal linking them to suitable careers.

**B. Does assessment add information beyond profile?**
Yes. When training a Random Forest on Profile+Assessment features vs Profile-only features, there are noticeable gains, particularly in Conditions B and C where the assessment data specifically holds complementary latent information.

**C. Does PATHFORGE Assessment v1 recover that information?**
No. The deterministic Likert-to-Career mapping in Assessment v1 (M1 model) fails drastically. In Condition C (assessment dominant), M1 achieved only a 5% Top-1 accuracy, while RF Assessment-only achieved >25%.

**D. Does the deterministic fusion mechanism benefit from that recovered signal?**
No. Because the underlying $Q(u,c)$ function fails to recover the signal, linearly mixing it into $P(u,c)$ acts essentially as adding noise. The fusion mechanism itself is helpless if the inputs to the scalar combination are faulty.
"""
write_md('assessment_component_diagnosis.md', assessment_diagnosis)

# 8. REAL WORLD EVIDENCE STATUS
real_world_status = """# Real-World Evidence Status

- No real student dataset has been collected.
- No human expert annotation has been completed.
- No longitudinal career outcomes have been measured.
- No real-world statistical validation exists.

**Explicit Prohibition:**
Manuscript claims such as "validated on students", "effective in practice", "improves career outcomes", or "generalizes to real-world students" are STRICTLY PROHIBITED unless separately supported in future studies.
"""
write_md('real_world_evidence_status.md', real_world_status)

# 9. SYNTHETIC EVIDENCE STATUS
synthetic_evidence = """# Synthetic Evidence Status

## Historical synthetic benchmark
NOT SUITABLE FOR FINAL VALIDATION. Prompt 6/7 audits discovered unknown label dependencies and uncontrollable leakage. 

## Synthetic v2
Structurally controlled but abstract. It successfully proved that the DAG structure works, but it was not directly consumable by the PATHFORGE semantic engine due to feature representation mismatches.

## Synthetic v3
PATHFORGE-schema-compatible controlled benchmark used for final deterministic evaluation. 
- **What it can establish:** It can establish whether the deterministic algorithms (P, Q, and F) mathematically function to extract predictive signals from ideal, clean inputs under varying conditions of latent information distribution.
- **What it cannot establish:** It cannot establish whether real students will fill out the forms accurately, whether the semantic similarities hold true for complex real-world edge cases, or whether the recommendations actually lead to job satisfaction or placement (real-world effectiveness).
"""
write_md('synthetic_evidence_status.md', synthetic_evidence)

# 11. MANUSCRIPT RESULTS NARRATIVE
manuscript_narrative = """# Results

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
"""
write_md('manuscript_results_narrative_v1.md', manuscript_narrative)

# 12. MANUSCRIPT LIMITATIONS
manuscript_limitations = """# Limitations

- The evaluation is strictly based on a **synthetic evaluation only**.
- There has been **no human validation**, meaning the system has not been tested on real students or evaluated by human experts.
- The results are subject to **synthetic generator assumptions**.
- The evaluation was constrained to a **15-career evaluation subset** rather than the full 60+ career catalog.
- The **deterministic heuristic limitations** are severe; linear combination of predefined feature extractors heavily restricts accuracy.
- The **newly introduced Assessment v1** has predefined manual weighting assumptions that have not been dynamically optimized.
- There is a clear **semantic matching brittleness** in how strings are extracted and scored.
- There is an **absence of expert/longitudinal validation** regarding whether recommended paths actually result in career success.
- There is **limited evidence for skill-gap effectiveness** and **limited evidence for roadmap effectiveness**, as these downstream features rely on the accuracy of the primary suitability ranking which is currently flawed.
- The **controlled benchmark does not establish generalization** to complex, noisy real-world data environments.
"""
write_md('manuscript_limitations_v1.md', manuscript_limitations)

# 14. FINAL PAPER CLAIMS
final_claims = """# Final Paper Claims Guidelines

## A. Claims that ARE safe to make
- "The controlled synthetic evaluation did not support the proposed 70:30 fusion configuration."
- "The assessment responses contained predictive information in the controlled benchmark, but the deterministic PATHFORGE assessment scoring function failed to recover that information effectively."
- "Tree-based learned baselines substantially outperformed the current deterministic scoring functions under the synthetic benchmark."
- "PATHFORGE provides an interpretable, deterministic recommendation architecture."

## B. Claims that require qualification
- "PATHFORGE performs profile-based recommendation." (Requires qualification: it does this deterministically via heuristic matching, but with low accuracy compared to ML baselines).
- "PATHFORGE identifies skill gaps and prerequisites." (Requires qualification: only based on static string matching from predefined knowledge catalogs, not evaluated dynamically).
- "Assessment improves recommendation quality." (Requires qualification: the *concept* of assessment data improves ML models, but the *implementation* in PATHFORGE does not).

## C. Claims that MUST be removed
- "PATHFORGE outperforms state-of-the-art baselines."
- "The 70:30 fusion ratio optimizes recommendations across all student types."
- "PATHFORGE has been validated on real students."
- "PATHFORGE generalizes to real-world career suitability."
- "The deterministic implementation is empirically proven to be highly accurate."
"""
write_md('final_paper_claims_v1.md', final_claims)

# 15. FINAL SCIENTIFIC VERDICT
final_verdict = """# Final Scientific Verdict

**1. Is the current deterministic PATHFORGE recommender empirically supported?**
No. It is drastically outperformed by basic ML baselines in a controlled synthetic environment.

**2. Is the 70:30 fusion hypothesis supported?**
No. A static 70:30 heuristic combination fails to consistently outperform a 100:0 profile-only baseline.

**3. Does the assessment data contain useful predictive information?**
Yes. Learned baselines easily extracted this information.

**4. Does the current Assessment v1 scoring function recover that information?**
No. The deterministic mapping catastrophically fails to align the 20 Likert questions with their true career associations.

**5. Do learned baselines outperform the deterministic system?**
Yes, significantly across all modalities and conditions.

**6. Is real-world effectiveness established?**
No. All tests to date are strictly synthetic.

**7. What is the strongest defensible contribution of the current work?**
The engineering architecture itself: providing an interpretable, deterministic, seven-dimensional competency representation framework that combines profile tracking, gap analysis, and roadmap generation in a unified schema (even if the current scoring weights are fundamentally suboptimal).

**8. What evidence is required next?**
Real-world student evaluation, longitudinal human annotation of recommendations, and the replacement of the deterministic scoring function with a learned or dynamically optimized retrieval layer.
"""
write_md('final_scientific_verdict.md', final_verdict)

print("Markdown files generated successfully.")
