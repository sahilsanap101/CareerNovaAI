# PathForge Current Algorithms Audit

## 1. BYSER Engine (Career Recommendation)
- **Algorithm Type**: Weighted linear combination heuristic.
- **Location**: `src/modules/recommendations/engine/byserEngine.ts`
- **Formula**:
  `Total Score = (Skills * 0.35) + (Interests * 0.20) + (Projects * 0.15) + (Academic * 0.10) + (Certifications * 0.10) + (Coding * 0.05) + (Goals * 0.05)`
- **SGI (Skill Gap Index)**: 
  SGI is linearly mapped to missing skills: `SGI = max(0, 100 - skillScore)`.
- **Issues for Research**: Arbitrary human-assigned weights, unvalidated confidence metric, no feedback loop or backtesting.

## 2. Adaptive Roadmap Engine
- **Algorithm Type**: Heuristic phase bucketing.
- **Location**: `src/modules/roadmap/engine/adaptiveRoadmapEngine.ts`
- **Mechanic**:
  1. Filters out mastered skills.
  2. Partitions remaining skills sequentially: Phase 1 (40%), Phase 2 (35%), Phase 3 (25%).
  3. Hardcoded pace multiplier affects static week estimates.
- **Issues for Research**: Not truly "adaptive" based on user cognitive load or real-time progression. Only adapts slightly to initial pace selection.

## 3. Skill Dependency Graph
- **Algorithm Type**: Hand-crafted Dependency Mapping + Depth-First Topological Sort.
- **Location**: `src/modules/roadmap/engine/skillDependencyEngine.ts`
- **Mechanic**: Uses a static array of objects (e.g., `React` requires `HTML, CSS, JavaScript`) to build a prerequisite chain.
- **Issues for Research**: Manual, non-exhaustive, does not capture nuanced dependencies (e.g., soft skills, tooling). Must transition to a formal ontology or automated graph.
