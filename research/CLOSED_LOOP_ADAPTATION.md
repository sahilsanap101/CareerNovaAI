# Closed-Loop Roadmap Adaptation Framework

## Context
Many theoretical platforms incorrectly claim continuous learning adaptation despite only relying on static generation models evaluated once upon initial enrollment. To scientifically claim adaptivity in PathForge, the implementation implements a formal **Closed-Loop Feedback Controller**.

## The Mechanism
1. **$R_t = \text{Planner}(S_t, M_t, \text{Career}, \text{Constraints})$**: 
   - A roadmap is fundamentally derived from a student state ($S_t$) and market topology ($M_t$) captured concurrently at time index $t$.
2. **Detection of Perturbation**:
   - Time advances. The student consumes learning assessments (`SkillAssessmentEvidence`), advancing their internal matrices. Or, the Job Market crawler detects broad shifts in target Career demand vectors.
   - We record discrete transitions: $S_t \rightarrow S_{t+1}$ and $M_t \rightarrow M_{t+1}$.
3. **Re-Evaluation**: 
   - With boundaries disturbed, mathematical stability breaks. The system forces a new planner pipeline generating $R_{t+1}$.
4. **Diffing and Adaptation Explanations**:
   - Total regeneration is computationally wasteful and psychologically abrasive for active students losing long-standing goals inexplicably. An analysis wrapper formally computes the "Diff" spanning the previous roadmap variables ($R_t$) against the new generation ($R_{t+1}$).
   - Generates deterministic strings explicitly rationalizing logic bounds (e.g., *"Removed skill X because it is no longer prioritized due to a 50% drop in Market Demand."*).
