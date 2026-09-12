# CURRENT PROJECT AUDIT

## Overview
PathForge is a comprehensive software engineering project aimed at career recommendation and roadmap planning. 
The system operates as a monorepo consisting of:
- `apps/api/`: Express.js backend API
- `apps/web/`: React frontend
- `packages/shared-*/`: Ecosystem packages for constants, types, Zod validators.
- `research/`: Contains directories for legacy docs and raw data folders.

## Codebase Status
- **Architecture**: Monolithic modular architecture using Express and Prisma.
- **Frontend**: Standard React implementation with typical pages/components/store setup.
- **Algorithms**: Currently implements heuristic weighted-scoring algorithms instead of explicit Machine Learning models. The "BYSER" engine assigns hard-coded weights based on profile metadata.
- **AI Integration**: AI OS utilizes hard-coded prompt engineering rather than complex agentic workflows.
- **Current Project Classification**: `PROTOYPE / ENGINEERING PROJECT` (Not yet a research-grade system).
