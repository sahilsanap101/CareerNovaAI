# Exact Assessment Normalization

- Formula: `normalizedScore = (rawScore / maxPossibleScore) * 100`
- `rawScore` is the sum of `option.careerWeights[careerName]`.
- `maxPossibleScore` increments by 1.0 per question answered.
- Missing Response: Skipped in loop, does not increase `maxPossibleScore`.
- Range: 0 to 100.
