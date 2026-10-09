# Exact Skill-Gap Rules

- `MASTERED`: `currentLevel >= recommendedProficiency`
- `STRONG`: `currentLevel >= minimumProficiency`
- `PARTIAL`: `currentLevel > 0` but less than minimum
- `OPTIONAL`: skillType == 'OPTIONAL' and `currentLevel == 0`
- `GAP`: `currentLevel == 0` (for CORE/IMPORTANT)
- `BLOCKED`: Dependency block exists during topological staging.
- Source: `roadmapEngine.service.ts`
