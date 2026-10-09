# Original Assessment State Audit
- **Assessment Table/Schema**: Exists in `prisma/schema.prisma` (`career_assessment_questions`, `career_assessment_options`, `career_assessment_responses`).
- **Normalization Logic**: Implemented in `combinedRecommendation.service.ts` (`normalizedScore = (rawScore / maxPossibleScore) * 100`).
- **70:30 Fusion Logic**: Implemented in `combinedRecommendation.service.ts` (`Profile * 0.70 + Assessment * 0.30`).
- **Fallback Behavior**: Defaults to Profile * 1.0 if assessment data is missing.
- **Explicit Fact**: The structured Likert questions and deterministic weight matrices mapped precisely to the 15 evaluation careers were missing from the explicit research configuration.
