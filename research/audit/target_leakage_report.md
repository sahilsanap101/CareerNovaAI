# Target Leakage Report
## Target Field
- `preferred_career`: The explicit target ground truth.

## Field Inspections
**career_goal vs preferred_career**: 0 exact matches out of 500 rows.

**Other fields**:
- `skills`, `interests`, `coding_evidence`, `projects_count` are standard feature vector elements and do not explicitly encode the target label, although they are highly correlated (which is intended for the recommendation system to learn).
