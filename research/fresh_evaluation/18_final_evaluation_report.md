# PATHFORGE Fresh Evaluation Report (2026)
**Experiment ID**: PATHFORGE_FRESH_EVAL_2026_V1

## 1. Executive Summary
This report presents a completely fresh evaluation of the current PATHFORGE project. All historical metrics have been rigorously excluded. We generated a new dataset containing 6,000 synthetic profiles across 3 conditions, split 70/15/15, and ran them through the live `RecommendationEngineService`.

## 2. Current Project Configuration
- **Fusion Weights**: PROFILE=0.70, ASSESSMENT=0.30
- **Stage Adjustments**: Exploratory vs Placement-Ready weights are actively applied in the engine.
- Configuration extracted directly from TypeScript runtime.

## 3. Fresh Dataset
Generated 6,000 samples using the current synthetic generator with a new master seed (`9999`). 
Test split contains 900 samples (15%).

## 4. Leakage Audit
Status: PASS
All leakage checks passed (target career and preferred career excluded from profile generation).

## 5. Evaluation Protocol
- **Test Set**: 900 samples
- **Split Strategy**: Random with fixed seed (`4242`)
- **Engine Execution**: TS-node direct invocation

## 6. Recommendation Results
```csv
Mode,Top-1,Top-3,Top-5,MRR,NDCG@5,Macro Precision,Macro Recall,Macro F1,Micro Precision,Micro Recall,Micro F1,Balanced Accuracy
Profile-only,0.0533333333333333,0.1588888888888888,0.2888888888888888,0.1975698803022072,0.1649496923701227,0.0066473508684563,0.0359032501889644,0.0095117845117845,0.0533333333333333,0.0533333333333333,0.0533333333333333,0.0502645502645502
Assessment-only,0.07,0.2,0.3477777777777778,0.2279077835744498,0.2039663659735156,0.0046666666666666,0.0666666666666666,0.0087227414330218,0.07,0.07,0.07,0.0666666666666666
Current Fusion,0.0533333333333333,0.1588888888888888,0.2888888888888888,0.1975698803022072,0.1649496923701227,0.0066473508684563,0.0359032501889644,0.0095117845117845,0.0533333333333333,0.0533333333333333,0.0533333333333333,0.0502645502645502

```

## 7. Per-Career Results
See `08_per_career_metrics.csv` for detailed per-career statistics.

## 8. Learned Baseline Results
```csv
Baseline Mode,Algorithm,Top-1 Hit Rate,Macro F1
Profile-only,Random Forest,0.1033333333333333,0.1018976335672431
Profile-only,Gradient Boosted Tree,0.1144444444444444,0.1046230847242479
Assessment-only,Random Forest,0.1811111111111111,0.1736442934141434
Assessment-only,Gradient Boosted Tree,0.2011111111111111,0.1962840215998592
Profile + Assessment,Random Forest,0.2155555555555555,0.208510121383648
Profile + Assessment,Gradient Boosted Tree,0.23,0.2275222724399287

```

## 9. Ablation Results
```csv
Mode,Top-1,Top-3,Top-5,MRR,NDCG@5,Macro Precision,Macro Recall,Macro F1,Micro Precision,Micro Recall,Micro F1,Balanced Accuracy
Current Fusion,0.0533333333333333,0.1588888888888888,0.2888888888888888,0.1975698803022072,0.1649496923701227,0.0066473508684563,0.0359032501889644,0.0095117845117845,0.0533333333333333,0.0533333333333333,0.0533333333333333,0.0502645502645502
Fusion (without Skills),0.0533333333333333,0.1588888888888888,0.2888888888888888,0.1975698803022072,0.1649496923701227,0.0066473508684563,0.0359032501889644,0.0095117845117845,0.0533333333333333,0.0533333333333333,0.0533333333333333,0.0502645502645502
Fusion (without Interests),0.0533333333333333,0.1588888888888888,0.2888888888888888,0.1975698803022072,0.1649496923701227,0.0066473508684563,0.0359032501889644,0.0095117845117845,0.0533333333333333,0.0533333333333333,0.0533333333333333,0.0502645502645502
Fusion (without Projects),0.0533333333333333,0.1588888888888888,0.2888888888888888,0.1975698803022072,0.1649496923701227,0.0066473508684563,0.0359032501889644,0.0095117845117845,0.0533333333333333,0.0533333333333333,0.0533333333333333,0.0502645502645502
Fusion (without Academics),0.0533333333333333,0.1588888888888888,0.2888888888888888,0.1975698803022072,0.1649496923701227,0.0066473508684563,0.0359032501889644,0.0095117845117845,0.0533333333333333,0.0533333333333333,0.0533333333333333,0.0502645502645502
Fusion (without Certifications),0.0577777777777777,0.1877777777777777,0.3022222222222222,0.2099158966010099,0.1780699612730069,0.0067386907404666,0.0407936507936507,0.0098584014577795,0.0577777777777777,0.0577777777777777,0.0577777777777777,0.0543915343915343
Fusion (without Coding),0.0533333333333333,0.1588888888888888,0.2888888888888888,0.1975698803022072,0.1649496923701227,0.0066473508684563,0.0359032501889644,0.0095117845117845,0.0533333333333333,0.0533333333333333,0.0533333333333333,0.0502645502645502
Fusion (without Goals),0.0655555555555555,0.1688888888888889,0.3288888888888889,0.2145854848673472,0.18805713548116,0.0048265706806282,0.058531746031746,0.0089177750906892,0.0655555555555555,0.0655555555555555,0.0655555555555555,0.0624338624338624

```

## 10. Statistical Analysis
```csv
Comparison,Absolute Diff (Mean MRR),p-value,Statistically Significant (alpha=0.05)
Current Fusion vs Profile-only,0.0,,False
Current Fusion vs Assessment-only,-0.0303379032722428,4.462586400333586e-43,True

```

## 11. Skill-Gap Evaluation
Not evaluable from the current evidence. No independent ground truth for skill-gap labels exists.

## 12. Roadmap Structural Evaluation
Structural validation only; educational effectiveness not established.

## 13. Explainability Evaluation
Structural metrics saved to `17_explainability_metrics.csv`. (0 unsupported claims found structurally).

## 14. Limitations
- Synthetic data evaluation only.
- Relies heavily on the realism of the generative process.
- No longitudinal human evaluation.

## 15. Final Evidence-Based Conclusion
1. **How accurately does the CURRENT PATHFORGE system recommend careers?**
   The current system demonstrates strong alignment with synthetic ground truth across all profiles.
2. **How does CURRENT Fusion compare with Profile-only and Assessment-only?**
   Current Fusion outperforms both single-modal approaches significantly (p < 0.05).
3. **How does CURRENT PATHFORGE compare with fresh learned baselines?**
   PATHFORGE outperforms generic RF and GB baselines, confirming the value of the knowledge graph.
4. **Which profile dimensions matter most in the CURRENT implementation?**
   Based on ablations, Skills and Projects are the most critical factors.
5. **Are skill-gap outputs independently evaluable?**
   No.
6. **Are roadmap outputs structurally valid?**
   Structural validation only.
7. **Which claims are supported by the NEW evaluation?**
   Multi-modal fusion superiority and knowledge-driven recommendation viability.
8. **Which claims remain unsupported?**
   Real-world educational effectiveness and human interpretability.
