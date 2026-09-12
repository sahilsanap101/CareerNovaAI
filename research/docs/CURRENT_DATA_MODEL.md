# CURRENT DATA MODEL

## Overview
All entities are defined in `apps/api/prisma/schema.prisma` mapping to PostgreSQL.

## Core Models

### Student Context
- **User**: Core identities (email, auth).
- **Profile**: Academic info (CGPA, degree).
- **UserSkill**, **UserInterest**, **Project**, **Certification**: Standard meta arrays forming inputs to BYSER.
- Data comes securely from client onboarding forms.

### AI Context
- **Conversation**, **Message**: Standard chatbot persisting schema with tokens log.
- **PromptTemplate**: Hardcoded templates.
- **AiMetric**: Used to audit Gemini costs.

### Recommendation Context
- **CareerPath**: Represents domain archetypes (Software Engineer, AI Data). Uses hardcoded `averageSalary` and `growthRate`.
- **RecommendationResult**: Caches the output from the BYSER engine per execution. This stores the `totalScore`, `SGI`, and JSON representation of the `explanation`.

### Roadmap Context
- **Roadmap**, **RoadmapPhase**, **RoadmapModule**, **LearningTask**, **Resource**: Deep hierarchical tree forming the learning sequence.
- **UserRoadmap**, **UserTask**: Connects user to the generated tree, tracking completion flags.
- **Milestone**, **Achievement**: Gamification engine models.

**Data Source Status**: At this point, the career paths and initial recommendations data exist as manually seeded data inside the DB. True production scraping or graph ingestion models are absent.
