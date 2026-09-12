# PathForge Current System Audit

## Objective
This document acts as an architectural audit to assess which components of the current PathForge platform can serve as research baselines, which need to be replaced, and which constitute the application's infrastructure.

## Monorepo Structure
- `apps/web`: Frontend application (Product/UX).
- `apps/api`: Backend services (Infrastructure / Research Core).
- `packages/*`: Shared modules for UI, Zod schemas, constants, types.

## Component Classifications

1. **RESEARCH BASELINE**
   - *These components serve as the "before" state to compare against novel methodologies.*
   - `BYSER Implementation`: Current multi-factor weighting formula (35% Skills, 20% Interests, etc.).
   - `Skill Gap Index (SGI)`: Existing rule-based gap calculation based on matched required skills.
   - `Roadmap Engine`: The current sequential `adaptiveRoadmapEngine` generating static 3-phase modules.

2. **RESEARCH CORE CANDIDATE (To be extended/replaced)**
   - *These represent the target domain for the IEEE paper's contributions.*
   - `Skill Dependency Engine`: The current hard-coded prerequisite chain requires a dynamic, data-driven ontology or knowledge graph approach.
   - `Recommendation Algorithms`: Must move from hardcoded heuristic weights to a learned or predictive model.

3. **PRODUCT/UX ONLY**
   - *These support demonstration but are not scientific contributions.*
   - `apps/web` React components, gamification (Achievements, Milestones), dashboard layouts, theming.

4. **SUPPORTING INFRASTRUCTURE**
   - *These run the application but aren't novel.*
   - Prisma ORM, PostgreSQL database, JWT authentication, Session management, Email listeners.

5. **REMOVE / REPLACE**
   - *These conflict with scientific rigor.*
   - Hardcoded metrics like `averageSalary`, `growthRate` in seed data (need live external data source or stated limitation).
   - "Mocked" AI metrics unless officially benchmarked.

6. **CLAIM REQUIRES EVIDENCE**
   - *These are UI claims unsupported by rigorous data.*
   - SGI confidence scores (0-100%).
   - "Estimated Weeks/Hours" for roadmaps.
   - Growth rate percentages for careers.
