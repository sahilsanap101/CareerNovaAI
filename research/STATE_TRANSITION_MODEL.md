# State Transition Model

To govern time-series validity, PathForge strictly logs variations via independent, immutable state-snapshots. 

## 1. Student State ($S_t$)
Defined internally as `StudentStateSnapshot`. 
- **Trigger**: Every time a student completes a technical test or explicit user self-assessment override (`SkillAssessmentEvidence`).
- **Mutation Rules**: Proficiencies operate along a bounded float domain $[0.0, 1.0]$. The system maintains a complete chronological graph history binding exactly *what evidence* caused the gap mapping to slide.

## 2. Market State ($M_t$)
Defined internally as `MarketDemandSnapshot`.
- **Trigger**: Scheduled cron ingestion pipelines evaluating external labor platforms. 
- **Mutation Rules**: Re-weights the probability metrics mapping the specific utility ratios required to compute algorithm B2 ($PriorityScore$).

The mathematical convergence forces $Planner$ executions to constantly evaluate the delta. Significant perturbations shift optimal allocations, directly influencing which specific node arrays topological sorting fetches next.
