# PathForge Final Forensic Audit Report

## 1. What Exists
PathForge is a fully functional web monorepo featuring a React frontend (`apps/web`) and a Node.js/Express-style backend (`apps/api`). The core features include the BYSER career recommendation engine (heuristic weighting), an adaptive roadmap generation engine (sequential bucketing), and a skill dependency graph. The DB contains 23 hardcoded career paths with arbitrary statistics, standard user/auth schemas, and an AI metric log for basic GenAI abstractions.

## 2. What Can Be Reused
- **Infrastructure**: The monorepo setup, Prisma ORM, JWT auth, and UI elements (`packages/*`) are completely reusable.
- **Data Models**: User profiles, histories, API scaffolding, and the structure of roadmaps/milestones are structurally sound.
- **AI Telemetry**: The `AiMetric` and `Message` tables afford excellent mechanisms for human-in-the-loop evaluation and data collection for future ML models.

## 3. What Must Be Replaced
- **Seed Data As Ground Truth**: The 23 hardcoded career paths with manually assigned salaries/weights construct a closed, artificial loop. You must integrate actual labor data (BLS, localized scraping) or clearly scope out external scraping in future updates.
- **Hardcoded Engine Weights**: The `BYSER` heuristic weights (Skills 35%, Interests 20%, etc.) must be replaced with statistical derivations or predictive ML functions.

## 4. What Should Become a Baseline
- The current **BYSER Algorithm** serves as a perfect "Heuristic Baseline."
- The current **Adaptive Roadmap Engine & Skill Graph** serves as the "Static Rule-Based Baseline."
- These baselines will be tested against the new research proposed models (A/B testing) to prove the delta improvement offered by your research.

## 5. What Should Become the New Research Contribution
- **Knowledge Graph / Ontology**: Moving from static JSON arrays (`skillDependencyEngine.ts`) into a true, multi-modal knowledge graph mapping concepts to skills to jobs.
- **Predictive Scoring**: Replacing the arbitrary linear equations with a predictive ranking system or graph-neural-network style recommendation model.
- **Adaptive Cognitive Load Modelling**: Using the generated telemetry (time taken, quiz scores, AI interactions) to dynamically shape the pacing of roadmaps, rather than using a static pace multiplier.

## 6. Potential Data Leakage Risks
- Because the system operates on 23 static, internally hardcoded career paths, testing the system's "accuracy" mechanically risks severe data leakage (overfitting to those exact 23 profiles). You must construct a holdout testing set (external profiles vs external roles) before proceeding with model training.

## 7. Reproducibility Risks
- The arbitrary values appended to the UI (e.g., Estimated Hours, Confidence Scores) have no mathematical backing. An IEEE paper requires reproducible mathematics underlying confidence bounds and predictions.
- **Mitigation**: Implement true probabilistic confidence indices (e.g., probability of candidate success based on historically labeled outcomes).

## 8. Unsupported Claims
- Currently, the application asserts an arbitrary "Skill Gap Index" and "Confidence Percentage."
- "Growth Rates" and "Demand Levels" are fabricated in seed data.
- The "Adaptive" nature of the roadmap is mostly static phase-slicing.
- **Resolution**: Audit phase complete. The next action is to strip/label these claims as simulated, or begin building the data pipeline capable of verifying them.
