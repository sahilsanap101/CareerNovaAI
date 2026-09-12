# CURRENT API MAP

## Backend Setup
Express.js using standard `Router` mounts.
Middlewares: `helmet`, `cors`, `morgan`, global error handler.

### Core Endpoints
- `/api/v1/auth/*`: Registration, Login, JWT handling.
- `/api/v1/profile/*`: CRUD operations for user profiles.
- `/api/v1/recommendations/*`:
  - `GET /`: Returns BYSER Recommendation Results from PostgreSQL.
  - `POST /generate`: Triggers `byserEngine.ts` synchronously. (Calls `evaluateCareerPath`).
- `/api/v1/roadmap/*`:
  - `POST /generate`: Triggers `adaptiveRoadmapEngine.ts`.
- `/api/v1/ai/*`:
  - `POST /chat`: Hits `multiAgentOrchestrator.ts`. Passes `AgentType`.

## Note
Most endpoints are functional but behave as standard CRUD endpoints mapping to database tables, rather than processing real-time streaming ML outputs. Data pipelines flow natively through Express controllers.
