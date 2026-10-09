# Exact Roadmap Generation Algorithm

- Construction: Identify GAP/PARTIAL skills.
- Layering: Standard topological layering. While unblocked skills exist, assign them to `currentStage`, then increment stage. Blocked skills wait for dependencies.
- Placements: Final stage appended with static role-specific interview preparation nodes based on career name keywords ('engineer', 'frontend', 'data', 'ai').
- Source: `roadmapEngine.service.ts`
