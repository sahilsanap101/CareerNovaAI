# PATHFORGE Fusion Evaluation Report (Prompt 6)

**WARNING: CONTROLLED SYNTHETIC EVALUATION**
All results contained in this document reflect deterministic performance on the `student_dataset_500_minimal.csv` synthetic benchmark. They do NOT represent real-world effectiveness, human validation, or actual career suitability. This evaluation strictly measures how well the Assessment Specification v1 aligns with the synthetic ground-truth labels.

## Evaluation Results

### A. Does assessment improve over profile-only?
**No.** Introducing the assessment score degrades overall recommendation accuracy against the synthetic benchmark's ground-truth targets.

### B. Does 70:30 outperform 100:0?
**No.** The 100:0 configuration (Profile Only, M0) significantly outperforms the 70:30 configuration (M4).
- 100:0 Top-1: 0.074
- 70:30 Top-1: 0.032

### C. Does 70:30 outperform 50:50?
**No.** The 50:50 equal-weight fusion (M2) achieved a Top-1 of 0.044, outperforming the 70:30 fusion (0.032). Interestingly, 50:50 performs worse than 100:0 (0.074) and 0:100 (0.048), indicating that blending the two scores destructively interferes rather than constructively combining.

### D. Which fusion ratio performs best?
**100:0 (M0 - Profile Only)** performs best across all primary metrics.
- Top-1: 0.074
- MRR: 0.223
- NDCG@5: 0.193

### E. How many students benefit from assessment?
**180 students** (36%) saw their ground-truth career rank improve when moving from 100:0 to 70:30.

### F. How many are harmed?
**283 students** (56.6%) saw their ground-truth career rank worsen when moving from 100:0 to 70:30.
*(37 students were unchanged).*

### G. What happens to MRR?
Mean Reciprocal Rank drops significantly from **0.223** (100:0) down to **0.155** (70:30).

### H. What happens to NDCG@5?
NDCG@5 drops from **0.193** (100:0) down to **0.098** (70:30).

### I. Is the result robust to Likert encoding?
**Yes.** A sensitivity check modifying the Likert encoding distribution (1->0.0, 2->0.20, 3->0.50, 4->0.80, 5->1.0) yielded a Top-1 of 0.034 and MRR of 0.157, which is statistically indistinguishable from the standard linear encoding (0.032 / 0.155). The negative impact of the assessment is structurally robust to the encoding scale.

### J. Are the results valid only as synthetic benchmark evidence?
**Absolutely.** The assessment drops performance because the synthesized ground truth (`preferred_career`) appears to be overwhelmingly aligned with the profile feature generation rules (skills, academics, projects). The manually designed assessment questions introduce a new axis of preference variance that the synthetic labels do not inherently contain, making the assessment act as predictive noise against this specific synthetic dataset.

### K. What experiment should be performed next?
**Dataset Generation Audit:** The immediate next step must be investigating the script/logic used to originally generate `student_dataset_500_minimal.csv`. We must determine if the `preferred_career` label was assigned using *only* profile attributes. If the dataset's ground truth was generated without factoring in the assessment distribution, then any assessment configuration will mathematically degrade performance. We need to validate the dataset's target generation rules before concluding that 70:30 is fundamentally flawed.
