# CareerNova Engine Contract

This document establishes the immutable research and engineering contract for the new Career Recommendation + Personalized Roadmap Engine. Every later implementation part must follow these rules.

## 1. Research System Name
**Working Description:**
"Constraint-Aware Competency-Preference Career Ranking with Dependency-Constrained Personalized Roadmap Generation"

**Forbidden Claims:**
Do NOT claim the system is:
- first-ever
- optimal
- state-of-the-art
- best
- highest accuracy
- AI accuracy
- prediction accuracy

*(unless later experiments genuinely establish those claims)*

## 2. Core Career Recommendation Model
For student `u` and career `c`:

- `CompetencyFit(u,c) = earnedCompetencySum(u,c) / totalRequirementWeight(c)`
- `PreferenceFit(u,c) = deterministic preference alignment score`
- `FinalScore(u,c) = 0.7 * CompetencyFit(u,c) + 0.3 * PreferenceFit(u,c)`

The 70/30 configuration is the primary fixed configuration.

**Forbidden Additions:**
Do NOT add:
- market score
- popularity score
- personality score
- LLM score
- random score
- arbitrary stage score
- fabricated demand score

## 3. Recommendation Pipeline
1. Student Profile
2. Competency Representation
3. Skill Identity Resolution
4. Career Knowledge Base
5. Eligibility Constraint
6. Competency Fit
7. Preference Fit
8. 70/30 Fusion
9. Ranking
10. Top 5

## 4. Skill Resolution
**Waterfall Priority:**
1. Internal canonical skill ID
2. ESCO/source URI exact match
3. Explicit validated source mapping
4. Normalized exact name
5. unresolved

**Forbidden Rules:**
- No fuzzy matching.
- No arbitrary similarity threshold.
- Never assume identifiers from different namespaces are identical.

## 5. Status Semantics
**Valid Statuses:**
- `MATCHED`
- `MISSING`
- `UNMAPPED`
- `AMBIGUOUS`
- `UNRESOLVED`
- `AVAILABLE`
- `NOT_AVAILABLE`
- `NOT_APPLICABLE`
- `NOT_USED`
- `INSUFFICIENT_EVIDENCE`

**Critical Semantic Rules:**
- `0` = valid numeric zero
- `null` = unavailable
- Never convert null to 0.
- Never convert unavailable competency into preference-only scoring.

## 6. Eligibility
- Academic eligibility is a constraint.
- Use only explicit evidence contained in the research data.
- Do not invent academic restrictions.
- If eligibility is unknown: `NOT_VERIFIED` / `NOT_AVAILABLE`.

## 7. Roadmap Model
**Roadmap Pipeline:**
1. Selected Career
2. Skill Gap
3. Dependency Closure
4. Remove Satisfied Nodes
5. Topological Ordering
6. Priority Scheduling
7. Roadmap Validation

**Forbidden Concepts:**
- Do NOT use: `Foundation → Intermediate → Advanced → Professional` as the core research algorithm.
- Do NOT call the roadmap: `optimal`, `pedagogically optimal`, `guaranteed`, or `best`.

**Required Terminology:**
Use: `dependency-valid personalized roadmap`.

## 8. Gemini
**Status:** Gemini is OPTIONAL.

**Allowed Generation:**
- natural-language explanations
- student-friendly explanations
- explanation of existing roadmap steps
- learning guidance based on already validated roadmap steps

**Forbidden Generation:**
- assign career scores
- change ranking
- determine eligibility
- invent skill mappings
- invent prerequisite relationships
- change roadmap ordering
- invent requirement weights

**Source of Truth:**
The deterministic backend is always the source of truth.

## 9. Data Architecture
- **PostgreSQL:** student/application state
- **File System (`research/data/processed/final_v2/`):** career/research knowledge base

**Rule:**
Do not seed complete `FINAL_V2` into PostgreSQL.

## 10. Determinism
The exact same inputs:
- same student profile
- same research data version
- same configuration

**Must produce exactly the same:**
- competency fit
- preference fit
- final scores
- ranking
- skill-gap classification
- roadmap ordering

## 11. Traceability
- Every career recommendation and roadmap step must be explainable through structured evidence.
- No Markdown parsing.
- No frontend reconstruction of scores.
- Backend is the single source of truth.

## 12. Required Test Categories
The final engine must contain tests for:
- data ingestion
- schema validation
- skill resolution
- competency calculation
- preference calculation
- eligibility
- 70/30 fusion
- null vs zero
- top-5 ranking
- skill gaps
- dependency closure
- topological ordering
- roadmap validation
- Gemini independence
- determinism
- frontend/backend consistency
