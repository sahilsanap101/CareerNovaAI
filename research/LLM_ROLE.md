# The Defined Role of LLM (AIOS / Gemini)

In traditional educational applications, Large Language Models (LLMs) operate opaquely, directly fabricating numerical scores and chronological maps. PathForge explicitly repudiates this black-box generation.

## Supported Functions (The Formatting Layer)
AIOS/Gemini interactions are explicitly restricted towards operating as conversational rendering engines transforming raw arrays. The LLM is permitted to handle:
- **Presentation**: Translating deep structural JSON logs into accessible natural language paragraphs.
- **Clarification**: Addressing explicit UI questions about terminology (e.g., "What does this Demand Score mathematically imply?").
- **Coaching**: Assisting natively with auxiliary workflows extending beyond pathfinding (Interview prep, resume tailoring over targeted skills).
- **Consolidation**: Constructing high-level student-facing narrative summaries.

## Explicitly Forbidden Functions (The Logic Layer)
The LLM possesses strictly **ZERO** write-access or determination logic regarding:
- Numerical Career Ranking ($Score$) computations.
- Evaluating objective Market Demands or deriving Priority Vectors.
- Verifying whether Prerequisite Edges are computationally valid.
- Dictating chronological Roadmap Sequence orderings.
- Interpreting Evaluation metrics, experiment parameters, or statistical tables natively.

## The Structured Evidence Bridge
The architecture strictly enforces:
$$ \text{Deterministic Research Engine} \rightarrow \text{Explicit Structured Evidence Object} \rightarrow \text{AIOS Formatting} \rightarrow \text{UI Presentation} $$
The AI model only receives completed graphs explicitly tagged with explanations, preventing generative hallucination at the computational root.
