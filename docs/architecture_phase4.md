# PathForge Phase 4 Architecture — Intelligent Adaptive Learning & Career Execution Ecosystem

```mermaid
graph TD
    BYSER[Phase 3 BYSER Engine] -->|Top 1 Career Match| SkillDepEngine[Skill Dependency Engine]
    
    subgraph "Adaptive Roadmap Pipeline"
        SkillDepEngine -->|Prerequisite Graph Chain| RoadmapGen[Adaptive Roadmap Generator]
        StudentPace[Learning Pace: 5h / 10h / 20h] --> RoadmapGen
        
        RoadmapGen -->|Phases 1-3 & Modules| TaskPlanner[Task & Resource Engine]
        TaskPlanner -->|Curate Video & Docs| ResourceEngine[Curated Resource Aggregator]
    end

    RoadmapGen -->|Generate Version vN| DB[(Supabase PostgreSQL)]
    
    subgraph "Execution & Tracking Engines"
        UserAction[User Progress / Task Check] -->|Complete Task| ProgressEngine[Progress & Streak Engine]
        ProgressEngine -->|Recalculate Score| ReadinessEngine[Career Readiness Gauge]
        ProgressEngine -->|Check Criteria| AchievementsEngine[Gamified Achievements System]
        UserAction -->|Missed Schedule| SmartRescheduler[Smart Rescheduler Engine]
    end

    DB -->|Serve APIs| ExpressAPI[Express REST API /api/v1/roadmaps]
    ExpressAPI -->|Interactive Node Graph & Timeline| ReactWeb[React Vite + React Flow Frontend]
```

## Data Flow Summary
1. **BYSER Seed Input**: Takes top-ranked career recommendation from Phase 3 BYSER engine.
2. **Skill Dependency Resolution**: `skillDependencyEngine.ts` guarantees prerequisite ordering (e.g. HTML $\rightarrow$ CSS $\rightarrow$ JS $\rightarrow$ React $\rightarrow$ TypeScript).
3. **Pace-based Duration**: Dynamically computes estimated weeks based on target weekly hours (`FAST`: 20h, `MEDIUM`: 10h, `SLOW`: 5h).
4. **Interactive Timeline & Skill Graph**: Renders expandable phase timeline and React Flow node tree on the frontend.
5. **Real-time Gamification**: Updates Career Readiness score (0-100), habit streaks, and unlocks trophies automatically upon task completions.
