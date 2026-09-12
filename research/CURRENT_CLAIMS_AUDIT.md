# PathForge Current Claims Audit

## Purpose
An IEEE research submission requires all claims to be empirically backed, cited, or logically sound. The current application contains several hardcoded parameters and UI metrics that simulate validity but lack scientific evidence.

## Unsupported Claims in Source Data
1. **Career Statistics (Seed Data)**: 
   - `averageSalary`, `growthRate`, and `demandLevel` are hardcoded strings. They are represented to the user as factual market data.
   - *Fix*: Must be labeled as "Simulated Data" or dynamically pulled/cited from a valid dataset (e.g., BLS or LinkedIn API).
2. **BYSER Factor Weights (`byserWeights.ts`)**:
   - The distribution (35% Skills, 20% Interests, etc.) is arbitrarily selected.
   - *Fix*: The paper must either present this as the "Baseline Heuristic Model" to be outperformed, or statistically derive these weights from dataset covariance.
3. **Skill Gap Index (SGI) Confidence**:
   - Calculated in `byserEngine.ts` as `Math.round(Math.min(98, 60 + (matchedSkillNames.length * 5)))`.
   - The concept of "Confidence" here is mathematically unsound; it scales linearly with the number of matched skills rather than reflecting an actual probabilistic certainty bound.
   - *Fix*: Rename to "Profile Completeness Score" or implement actual probabilistic confidence calculation.
4. **Estimated Roadmap Timelines**:
   - Time estimation in `adaptiveRoadmapEngine.ts` is purely a heuristic `4 * paceMultiplier` weeks.
   - *Fix*: Relabel as "Suggested Heuristic Pacing" or replace with a predictive model based on historical user cadence data.
