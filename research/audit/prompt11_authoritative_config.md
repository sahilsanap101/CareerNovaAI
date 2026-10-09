# PATHFORGE Authoritative Configuration Reconciliation (Prompt 11, Phase 1)

## 1. Discrepancy Resolution
**Configuration A** (Skills 0.35, Interests 0.20, Projects 0.15, Academics 0.10, Certifications 0.10, Coding 0.05, Goals 0.05) is the true, authoritative base configuration.

**Evidence:**
- The actual values are exported directly from `apps/api/src/config/byserWeights.ts`.
- These weights are injected at runtime into `RecommendationEngineService.ts`. No environment variables or configuration overlays override the base map before it reaches the core matching function.
- Configuration B appears to be a historical typo or from an outdated ablation test.

## 2. Dynamic Stage Multipliers
The base weights are not static; they are dynamically multiplied depending on the student's `yearStage` inside `RecommendationEngineService.ts`.
- **Exploratory Stage (Years 1-2):**
  - Interests: $\times 1.5$
  - Academics: $\times 1.2$
  - Skills: $\times 0.7$
  - Coding: $\times 0.5$
  - Overall Stage Score Multiplier: $0.8$
- **Placement Ready Stage (Years 3-4):**
  - Skills: $\times 1.1$
  - Coding: $\times 1.2$
  - Projects: $\times 1.1$
  - Goals: $\times 1.2$
  - Overall Stage Score Multiplier: $1.2$
After dynamic weighting, the subset is re-normalized to sum to exactly 1.0.

## 3. Exact Profile Scoring Formulas
The profile score is a weighted sum over seven dimension scores, each out of 100:
1. **Skills:** `userProficiency / reqProficiency` up to a max of $1.2$. This ratio is multiplied by the skill type weight (`CORE = 10, IMPORTANT = 7, OPTIONAL = 4`). Missing core skills yield 0 points unless in exploratory stage (yields 20%). Score is normalized over max possible weight $\times 100$.
2. **Interests:** Matching interest count $\times 33.3$ (capped at 100).
3. **Academics:** 100 (CGPA $\ge 8.5$), 80 (CGPA $\ge 7.5$), 60 (CGPA $\ge 6.5$), 40 (CGPA $< 6.5$). $+10$ points if branch is core computing.
4. **Projects:** 25 points per project technology keyword that matches career domain keywords, capped at 100.
5. **Certifications:** 50 points per certification title that string-matches career keywords, capped at 100.
6. **Coding:** 100 ($\ge 300$ problems), 75 ($\ge 150$), 50 ($\ge 50$), 20 ($< 50$).
7. **Goals:** 100 (Target role substring match), 80 (Target industry match), 50 (Neutral).

## 4. Exact Assessment Scoring Formula
From `AssessmentService.ts` and `CombinedRecommendationService.ts`:
Each Likert response applies a fractional weight multiplier to the maximum theoretical contribution of that question:
- Likert 5 (Strongly Agree) = $1.0 \times \text{careerWeight}$
- Likert 4 = $0.75 \times \text{careerWeight}$
- Likert 3 = $0.50 \times \text{careerWeight}$
- Likert 2 = $0.25 \times \text{careerWeight}$
- Likert 1 = $0.0 \times \text{careerWeight}$
The total raw score is divided by the theoretical maximum score (assuming 1.0 per question answered) to yield a $0-100$ scale.

## 5. Exact Fusion Equation
From `CombinedRecommendationService.ts`:
`combinedScore = (profileScore * 0.70) + (assessmentScore * 0.30)`

## Final Answers
**1. Which profile-weight configuration is actually authoritative?** Configuration A.
**2. What exact input schema does PATHFORGE require?** Detailed in `pathforge_input_schema_v1.md`. It requires JSON objects mapping canonical skill names, project tech arrays, and explicit academic/goal strings.
**3. Can a causal latent benchmark be generated in that schema without target-conditioning?** Yes, by using a probability sampling mechanism mapping latent traits to standard PATHFORGE skill keys/project arrays independently of the `career_suitability` output.
**4. What mappings are required?** We must map the continuous latent vectors $LV$ to a multinomial distribution over the valid `canonicalName` skill keys and keyword strings, followed by a binomial sampling step to simulate presence/absence of discrete skills.
**5. What validation must pass before synthetic_v3 is generated?** The design must pass schema validity checks (matching the TS Interface), structural complementarity checks, and dependency audit checks.
**6. Is the benchmark design sufficient to make a PATHFORGE fusion evaluation interpretable?** Yes. By replacing the unparseable abstract numbers with valid semantic features drawn from the canonical knowledge base, PATHFORGE will be able to score the profile correctly. A failure under this schema would definitively indicate a failure in the fusion logic or scoring assumptions, rather than a mere parsing incompatibility.
