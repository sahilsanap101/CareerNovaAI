# PATHFORGE Phase 3 Architecture — BYSER Recommendation & Explainability Engine

```mermaid
graph TD
    User[Student User] -->|1. Profile & Skills Data| ProfileModule[Student Profile Module]
    ProfileModule -->|2. Data Payload| ByserEngine[BYSER Scoring Engine]
    
    subgraph "BYSER Engine Pipeline"
        ByserEngine -->|3. Evaluate 23 Paths| SkillMatch[Skills Scorer - 35%]
        ByserEngine --> InterestMatch[Interests Scorer - 20%]
        ByserEngine --> ProjectMatch[Projects Scorer - 15%]
        ByserEngine --> AcademicMatch[Academic Scorer - 10%]
        ByserEngine --> CertMatch[Certifications Scorer - 10%]
        ByserEngine --> CodingMatch[Coding Experience - 5%]
        ByserEngine --> GoalMatch[Career Goals Scorer - 5%]
        
        SkillMatch & InterestMatch & ProjectMatch & AcademicMatch & CertMatch & CodingMatch & GoalMatch --> ScoreAggregator[Score & SGI Aggregator]
        ScoreAggregator -->|Calculate SGI = 100 - SkillScore| SGIEngine[Skill Gap Index Engine]
        ScoreAggregator -->|Generate Rationale| ExplainabilityEngine[Explainability Engine]
    end

    SGIEngine & ExplainabilityEngine -->|4. Persist Top 5| DB[(Supabase PostgreSQL)]
    DB -->|5. Serve APIs| ExpressAPI[Express REST API /api/v1/recommendations]
    ExpressAPI -->|6. Render Recharts & Badges| ReactWeb[React Vite Frontend]
```

## Data Flow Summary
1. **Student Profile Retrieval**: The engine collects student skills, proficiencies (1-5), projects, CGPA, interests, certifications, and career goals.
2. **Deterministic Evaluation**: Each of the 23 database-configured `CareerPath` options is evaluated against the 7 weighted factors defined in `byserWeights.ts`.
3. **SGI Calculation**: The Skill Gap Index is computed as `100 - SkillScore` and categorized into 5 tiers (`Excellent Match`, `Good Match`, `Moderate Gap`, `Large Gap`, `Critical Gap`).
4. **Explainability Generation**: Strengths, actionable areas to improve, and missing skill priorities (`HIGH`, `MEDIUM`, `LOW`) are generated deterministically without opaque AI black-boxes.
5. **Interactive Visualization**: Top 5 recommendations, side-by-side comparison, and analytics charts are presented using Recharts and Tailwind UI cards.
