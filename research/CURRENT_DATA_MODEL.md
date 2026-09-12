# PathForge Current Data Model Audit

## Foundational Models
- **User Ecosystem**: `User`, `Profile`, `UserPreference`, `CareerGoal`, `Project`, `Certification`, `CodingPlatform`.
- **Knowledge Representation**: `Skill`, `Interest`, `CareerPath`.

## Core Entities
- `CareerPath`: 23 predefined paths loaded via Prisma seed. Includes hardcoded categorical assertions (`averageSalary`, `growthRate`, `demandLevel`).
- `RecommendationResult`: Snapshots the BYSER output, storing `totalScore`, `SGI`, `confidence`, and `factors` as JSON.
- `Roadmap`: Hierarchical structure (`Roadmap` -> `RoadmapPhase` -> `RoadmapModule` -> `LearningTask` -> `Resource`).
- `AiMetric`: Telemetry for AI operations (`durationMs`, `tokensInput`, `tokensOutput`, `cost`, `model`).

## Reproducibility Risks
- **Data Leakage**: The static seed data represents an artificial baseline. If an ML model is trained on interactions with these static careers, it may overfit to the limited matrix of 23 careers and hardcoded prerequisites.
- **Implicit Assumptions**: "12 - 24 LPA" salary estimates and growth rates are assumed true but have no citation in the DB schema.
- **Evaluation**: Lacks ground-truth labels for "successful" recommendations to calculate Precision/Recall.
