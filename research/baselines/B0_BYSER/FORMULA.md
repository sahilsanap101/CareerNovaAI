# B0 Baseline Formula

The B0 Recommendation engine relies on a static linear combination of seven fixed vectors, hardcoded within the runtime instance.

## Heuristic Weighting
$$ Score = 0.35(Skills) + 0.20(Interests) + 0.15(Projects) + 0.10(Academics) + 0.10(Certifications) + 0.05(CodingActivity) + 0.05(TargetGoals) $$

## Skill Factor Breakdown
The Skill Score relies strictly on the required skills mapping.
$$ SkillsScore = \frac{\sum (ReqWeight_i \times (\frac{Proficiency_i}{5}))}{\sum ReqWeight_i} \times 100 $$

## Non-Probabilistic Fallback
The engine generates a `confidence` metric currently calculated as a linear scalar based on raw array lengths rather than a statistical probability curve:
$$ MatchScore = \min(98, 60 + (|MatchedSkills| \times 5) + (|MatchingProjects| \times 6)) $$
*To respect mathematical integrity, this metric is renamed in UI and research evaluations to `Match Score` as it holds no probabilistic boundary merit.*
