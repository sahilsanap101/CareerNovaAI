# Current Config Snapshot

## Engine Configuration
Loaded from: `apps/api/src/modules/careers/services/recommendationEngine.service.ts`

- **Fusion Weights**: PROFILE=0.70, ASSESSMENT=0.30 (from `CombinedRecommendationService`)
- **Stage Adjustments**:
  - Exploratory: Interest*1.5, Academic*1.2, Skill*0.7, Coding*0.5 (Multiplier=0.8)
  - Placement-Ready: Skill*1.1, Coding*1.2, Project*1.1, Goal*1.2 (Multiplier=1.2)
- **Base Weights**: Uses BYSER_WEIGHTS
