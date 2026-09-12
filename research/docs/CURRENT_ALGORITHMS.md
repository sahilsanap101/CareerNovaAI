# CURRENT ALGORITHMS

## Career Recommendation (BYSER Engine)
**File**: `apps/api/src/modules/recommendations/engine/byserEngine.ts`

**Formula**:
```typescript
Total Score = 
  (SkillScore * 0.35) + 
  (InterestScore * 0.20) + 
  (ProjectScore * 0.15) + 
  (AcademicScore * 0.10) + 
  (Certifications * 0.10) + 
  (CodingExperience * 0.05) + 
  (CareerGoals * 0.05)
```

**Implementation details**:
- Purely deterministic, rule-based heuristic engine.
- NOT machine learning.
- Normalizes individual scores to a 100-point scale before weighting.
- **Skill Gap Index (SGI)**: SGI is mathematically `100 - SkillScore`.
- Classification of SGI is based on simple threshold barriers (`<= 20` Excellent, `<= 40` Good).
- **Status**: VERIFIED WORKING (but algorithmically elementary).

## Roadmap Adaptation Engine
**File**: `apps/api/src/modules/roadmap/engine/adaptiveRoadmapEngine.ts`

**Algorithm**:
- Fetches prerequisite chain.
- Filters out skills user has proficiency `>= 4`.
- Distributes remaining skills into 3 phases (40/35/25 split).
- **Adaptation mechanism**: Applies a `paceMultiplier` (`FAST=0.75`, `SLOW=1.5`, `MEDIUM=1.0`) to the estimated weeks.
- Maps template resources to the skills.
- **Status**: PARTIALLY WORKING. It isn't truly adaptive contextually; it's personalized on generation via simple multipliers. TRUE ADAPTATION is missing.

## Dependency Graph
**File**: `apps/api/src/modules/roadmap/engine/skillDependencyEngine.ts`

- The skill dependency graph is an array of hardcoded rule objects (e.g., `skill: React, prerequisites: [HTML, CSS, JS]`).
- No graph theory library used. Simply recursively builds an ordered list.
- **Status**: PROTOTYPE (Not using ESCO hierarchy).
