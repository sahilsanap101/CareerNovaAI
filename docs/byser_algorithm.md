# BYSER (Branch Yield Suitability Evaluation & Recommendation) Algorithm Specification

## 1. Objective & Design Philosophy
The **BYSER Algorithm** is a deterministic, explainable, research-backed recommendation framework designed for engineering students. Unlike LLM-based black-box models, BYSER provides 100% transparent, mathematical scoring and explicit reasoning for every career path recommendation.

---

## 2. Factor Weights & Mathematical Model

The final suitability score $S_{\text{total}} \in [0, 100]$ for student $u$ and career path $c$ is defined as:

$$S_{\text{total}}(u, c) = \sum_{f \in F} w_f \cdot S_f(u, c)$$

Where $F$ represents the 7 evaluation factors with configurable database/config weights:

| Factor | Symbol | Config Weight $w_f$ | Metric Evaluated |
|--------|--------|--------------------|-------------------|
| **Technical Skills** | $S_{\text{skills}}$ | **0.35 (35%)** | Weighted match of student skill proficiencies (1-5) against required career skills |
| **Domain Interests** | $S_{\text{interests}}$ | **0.20 (20%)** | Category alignment between student interest preferences and career domain |
| **Portfolio Projects** | $S_{\text{projects}}$ | **0.15 (15%)** | Relevant projects featuring required tech stack keywords |
| **Academic Performance**| $S_{\text{academic}}$ | **0.10 (10%)** | Normalized CGPA score $(\text{CGPA} / 10 \times 100)$ |
| **Certifications** | $S_{\text{certs}}$ | **0.10 (10%)** | Verified professional certifications |
| **Coding Experience** | $S_{\text{coding}}$ | **0.05 (5%)** | Total competitive coding problems solved across platforms |
| **Career Goals** | $S_{\text{goals}}$ | **0.05 (5%)** | Target job role and industry alignment |

---

## 3. Skill Gap Index (SGI) Formula

The **Skill Gap Index (SGI)** measures the skill deficit of a student relative to the target career path:

$$\text{SGI}(u, c) = \max\left(0, \min\left(100, 100 - S_{\text{skills}}(u, c)\right)\right)$$

### SGI Categorization Spectrum:
- **0 – 20**: `Excellent Match` (Minimal gap, job ready)
- **21 – 40**: `Good Match` (Minor skill gaps)
- **41 – 60**: `Moderate Gap` (Requires targeted learning)
- **61 – 80**: `Large Gap` (Requires substantial preparation)
- **81 – 100**: `Critical Gap` (Foundational preparation required)

---

## 4. Deterministic Explainability Engine Rules

For every evaluated recommendation, the Explainability Engine generates:

1. **Matched Strengths (`strengths`)**:
   - Lists exact matched skills with proficiency scores (e.g., *Java (4/5)*).
   - Identifies matching portfolio projects.
   - Highlights academic CGPA standing if $\ge 8.0$.

2. **Actionable Areas to Improve (`areasToImprove`)**:
   - Identifies missing required skills marked with importance weights $\ge 8$ as `HIGH` priority.
   - Recommends project creation if 0 matching portfolio projects exist.
   - Suggests industry certification acquisition if no certificates exist.

3. **Prioritized Missing Skills (`missingSkills`)**:
   - `HIGH`: Importance Weight $\ge 8$
   - `MEDIUM`: Importance Weight $5 - 7$
   - `LOW`: Importance Weight $\le 4$
