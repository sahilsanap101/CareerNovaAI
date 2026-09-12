# PathForge Baseline Definitions

To produce a scientifically rigorous IEEE conference paper, we must cleanly separate our *Baseline Model* (the existing system) from our *Proposed Model* (the research contribution).

## 1. The Baseline Career Recommendation (Baseline-BYSER)
- **Definition**: The deterministic weighting formula defined in the current `byserEngine.ts`.
- **Metrics**: 
  - Calculates `TotalScore` manually: Skills(0.35) + Interests(0.20) + Projects(0.15) + ... + Goals(0.05).
  - Assumes a generic, statically weighted importance for all users equally.
- **Research Gap**: Does not learn hidden correlations (e.g., strong projects might compensate more for weak certifications in certain domains). No feedback loop.

## 2. The Baseline SGI & Roadmap
- **Definition**: The Skill Gap Index and static Topological Sort of dependencies currently living in `skillDependencyEngine.ts` and `adaptiveRoadmapEngine.ts`.
- **Metrics**:
  - `SGI = max(0, 100 - skillScore)` based strictly on matched skill arrays.
  - Generates rigid 3-phase roadmaps utilizing a hardcoded JSON dependency list of ~40 skills.
- **Research Gap**: Fails to capture non-linear, multi-modal learning paths or micro-skill relationships.

## 3. The Proposed Research Contribution (Target)
The evolutionary goal of this project for an IEEE submission should likely focus on:
1. **Dynamic Ontology / Graph**: Replacing static JSON dependencies with an LLM-derived or formal knowledge-graph representation of skills.
2. **Predictive Recommendation**: Utilizing Machine Learning or collaborative filtering over historical/synthetic profiles instead of hardcoded weights.
3. **Pacing and Load Prediction**: Replacing the naive `paceMultiplier` with an adaptive cognitive-load model that updates dynamically based on continuous assessment feedback.

## Next Steps
1. Formalize the Mathematical Formulation of Baseline-BYSER.
2. Formulate the Proposed Methodology.
3. Generate or source a valid dataset for empirical evaluation (do NOT test exclusively on the current 23 static seed paths).
4. Run A/B testing implementations inside the `api` app.
