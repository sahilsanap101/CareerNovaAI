# CURRENT ARCHITECTURE

## System Flow

USER
 ↓
FRONTEND (React) (HTTP/REST)
 ↓
API (Express.js) (`/api/v1/*`)
 ↓
AUTHENTICATION (Standard JWT / Session) -> Auth Controllers
 ↓
DATABASE (PostgreSQL via Prisma ORM)
 ↓
RECOMMENDATION (BYSER Engine: `apps/api/src/modules/recommendations/engine/byserEngine.ts`. Synchronous calculation based on DB fetch).
 ↓
SKILL GAP (Calculated strictly by BYSER Engine via SGI formula).
 ↓
ROADMAP (Adaptive Roadmap Engine: `apps/api/src/modules/roadmap/engine/adaptiveRoadmapEngine.ts`. Tree generation with heuristic pacing multipliers).
 ↓
PROGRESS (UserRoadmap and UserTask models tracking boolean/minute completeness).
 ↓
ANALYTICS (AiMetric, StudySession aggregations).
 ↓
AIOS / LLM (MultiAgentOrchestrator pulling DB tools & sending formatted prompts to Gemini Gateway).
 ↓
OTHER EXTERNAL SERVICES (N/A — mock/dummy or standard SMTP configuration).

## Data Transfer
Validation occurs via shared Zod schemas (`packages/shared-zod`). 
Failure behavior usually returns standard Express global error handlers with standardized API JSON responses.
