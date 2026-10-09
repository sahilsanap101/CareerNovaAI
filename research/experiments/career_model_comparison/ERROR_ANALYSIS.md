# Error Analysis

## 1. 15-Career vs 60-Career Assessment Similarity
**Finding:** The assessment-only Top-1 and Top-3 accuracy metrics are virtually identical between the 15-career and 60-career evaluations.
**Explanation:** Inspection of the assessment schema reveals that the `careerWeights` attached to options *only* contain non-zero weights for a small subset of the 15 core careers. The vast majority of the 60-career catalog receives a flat 0.0 score from the assessment engine. Because these extra careers never gain points, they never displace the 15 core careers at the top of the ranking, resulting in nearly identical top-k metrics regardless of the catalog size.

## 2. Heuristic vs Random vs Popularity
**Finding:** The existing heuristic methods (Profile only, Assessment only, 70:30 fusion) score between 7.4% and 8.0% Top-1 accuracy on the 15-career set.
**Explanation:** This is barely better than the uniform random baseline (6.8%) and substantially worse than a trivial Most Popular baseline (12.4%). The heuristic scoring rules manually engineered in PATHFORGE are largely arbitrary and fail to capture the actual underlying signal connecting student features to their preferred careers. 

## 3. Weak Careers
**Finding:** Careers like `Cybersecurity Engineer` and `MLOps Engineer` rank very poorly in the heuristic models.
**Explanation:** Their specific keywords and weights are underrepresented in the hand-coded rules, or the students who prefer them answer the assessment in ways the heuristic engine mistakenly attributes to `Software Engineer`.

## 4. Machine Learning Explanations
**Finding:** The Random Forest Classifier achieved 37.40% Top-1 accuracy.
**Explanation:** By treating the Profile and Assessment heuristics as inputs (meta-features) rather than final answers, the ML model learned to correctly recalibrate the broken manual weights. It found non-linear patterns that correctly predict the student's actual career preferences, tripling the accuracy of the manual engine.
