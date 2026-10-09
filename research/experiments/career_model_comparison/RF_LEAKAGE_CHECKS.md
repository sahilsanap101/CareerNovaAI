# Leakage and Bias Audit

## 1. Direct Target Leakage
**Status: CLEAR**
- The target field (`preferred_career`) and highly correlated text fields (`career_goal.targetRole`) were strictly excluded from the inference pathway. 
- The 30 input features (Profile and Assessment scores) were derived without looking at the ground truth. 
- All standard cross-validation boundaries were respected. No testing data bled into the model fitting, hyperparameter selection, or baseline popularity estimates.

## 2. Synthetic-Label Confounding
**Status: FAILED (High Risk of Confounding Bias)**
- While explicit target leakage was prevented, the dataset itself is procedurally generated. 
- The features (skills, interests, and assessment answers) were synthetically generated *conditioned* on the target label using probabilistic rules. 
- **Conclusion:** The supervised Random Forest model is mathematically learning the hidden rules of the data-generation script rather than true, real-world career suitability. Because the heuristic weights (used to generate the input scores) differ structurally from the generation script's rules, the Random Forest acts as a decoding function mapping the heuristic vectors back to the generation latent classes. 
- Therefore, the 37.40% Top-1 accuracy is an artifact of the synthetic generation process and does *not* constitute proof of real-world predictive validity.
