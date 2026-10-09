# Assessment Scoring Specification v1

- **Amax(c)**: Theoretical maximum for career `c`. Sum of weights for `c` across all 20 questions where weight > 0, assuming max Likert response (weight * 1.0). In Likert scoring: response 5 = 1.0, 4 = 0.75, 3 = 0.5, 2 = 0.25, 1 = 0.0.
- **Response Encoding**: Strongly Disagree (1) -> 0.0 multiplier. Disagree (2) -> 0.25. Neutral (3) -> 0.5. Agree (4) -> 0.75. Strongly Agree (5) -> 1.0.
- **Q(u,c)**: Question contribution = `encoding(response) * weight(q, c)`.
- **A(u,c)**: Raw Assessment Score = Sum of `Q(u,c)` across 20 questions.
- **Normalization**: `Normalized A(u,c) = (A(u,c) / Amax(c)) * 100`.
- **Missing response handling**: Omitted from both `A(u,c)` and `Amax(c)`, treating the question as if it did not exist for this user.
