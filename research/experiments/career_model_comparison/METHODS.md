# Experimental Methods

## A. Random-ranking baseline
Generates a random uniform score between 0 and 1 for each candidate career for each student. This establishes the absolute minimum performance floor.

## B. Most-popular-career baseline
Counts the frequency of each career in the student dataset's target labels and scores candidates based on their global popularity. This is a naive non-personalized recommender.

## C. Existing profile-only engine
Uses the exact `heuristic_scores.json` produced by the current PATHFORGE logic (with `career_goal.targetRole` disabled to prevent target leakage). Represents the static profile logic.

## D. Existing assessment-only engine
Evaluates the 20-question multiple-choice assessment using the raw `careerWeights` attached to each selected option. Scores are accumulated and normalized by 20.0.

## E. Existing 70:30 fusion engine
The current production configuration. Score = (0.7 * Profile_Score) + (0.3 * Assessment_Score). 

## F. Fusion-weight comparison
A grid search over profile vs assessment weights (from 10:90 to 90:10). The best weight was determined to be 10% Profile / 90% Assessment.

## I. Supervised machine-learning baseline (Random Forest)
A 5-fold cross-validated Random Forest Classifier (100 trees, max depth 5). The input features were the concatenated Profile scores and Assessment scores (the meta-features) for each career. The model learns how to weight these sub-scores to predict the target career.
