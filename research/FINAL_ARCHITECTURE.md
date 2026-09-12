# FINAL PathForge ARCHITECTURE

## Execution Separation Boundaries

The PathForge publication guarantees explicit computational isolation ensuring Large Language Models (LLMs) function solely as non-functional presentation rendering layers. This prevents arbitrary text generators from secretly writing logic loops.

### Layer 1: The Deterministic Mathematical Core
*   **Module Scope**: `search/baselines/` and `recommendations/engine`
*   **Behavior**: Ingests purely parsed student numeric matrices. Employs mathematically static `E1` external baselines, B2 Skill Utility Prioritization, and B3 Acyclic Dependency Constraints to determine priority targets and evaluate proficiency gaps.
*   **LLM Penetration**: **0%**. Generative models are disconnected entirely from core graph node sorting arrays. 

### Layer 2: Quantitative Outputs & Explanations (Telemetry)
*   **Module Scope**: `research/evaluation/`
*   **Behavior**: Generates structured logical explanations tied natively to the numeric conditions triggered inside Layer 1. (e.g. `If Prerequisite Closed -> Fire Prerequisite Log Vector`).
*   **LLM Penetration**: **0%**. 

### Layer 3: Presentation UI
*   **Module Scope**: `apps/web/src/pages/`
*   **Behavior**: The User Interface receives pure analytical JSON nodes rendering them explicitly against React Cards. Uses the `AI Coach` modules simply to translate complex structured mathematical logs into easily digestible, highly conversational human-readable advice over WebSockets.
*   **LLM Penetration**: Restricted structurally to visual/text-wrapper representation bounds lacking any ability to alter numerical recommendations.
