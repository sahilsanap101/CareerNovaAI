# PathForge Current Architecture Audit

## Overarching Structure
PathForge is a Monorepo managed using `npm` workspaces.

### 1. `apps/web` (Client Tier)
- **Role**: Handles all end-user UI, gamification overlays, dashboards, and visualizations.
- **Tech Stack**: Likely React / Next.js (based on typical modern monorepos in this format).
- **Research Implication**: Should strictly consume APIs. Should not contain core algorithm logic.

### 2. `apps/api` (Services Tier)
- **Role**: Core backend processing. Coordinates recommendation engines, database reads/writes, LLM requests.
- **Modules**:
  - `recommendations/engine`: BYSER calculation.
  - `roadmap/engine`: Adaptive generation and dependency graph.
  - `ai/gateway`: Interfaces with external LLMs (gemini-1.5-pro reported in schemas).
- **Research Implication**: This is the primary laboratory for the IEEE paper. New algorithms must be injected here as modular services that can be AB-tested against the baseline heuristics.

### 3. `packages/*`
- Contains shared constants, enums, UI components, Zod types, and utility functions.
- **Research Implication**: Data contracts (Zod) must support polymorphic responses (e.g. `type SGIResult = BaselineResult | PredictiveResult`).

## Deployment / Execution
- Uses standard containerization (`Dockerfile`, `docker-compose.yml`) for infrastructure consistency.
- Database: PostgreSQL (Prisma).

## AI Operation System (AIOS) Configuration
- Interactions are logged to the `Conversation`, `Message`, and `AiMetric` tables.
- **Research Potential**: This existing infrastructure allows for "human-in-the-loop" feedback metrics to serve as ground-truth labeling for ML models.
