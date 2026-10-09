# Exact Final Fusion

- Formula: `R(u,c) = (P(u,c) * w_p) + (A(u,c) * w_a)`
- Default weights: Profile = 0.70, Assessment = 0.30
- Fallbacks:
  - Profile only: Profile = 1.0, Assessment = 0.0
  - Assessment only: Profile = 0.0, Assessment = 1.0
  - Neither: Profile = 1.0, Assessment = 0.0
- Source: `combinedRecommendation.service.ts`
