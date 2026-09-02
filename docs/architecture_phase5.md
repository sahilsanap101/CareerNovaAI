# PATHFORGE Phase 5 Architecture — AI Operating System (AIOS) for Career Intelligence

```mermaid
graph TD
    Client[React Vite Frontend] -->|1. Chat / Resume / Mock Interview Request| ExpressAPI[Express REST API /api/v1/ai]
    
    subgraph "AIOS Multi-Agent Architecture"
        ExpressAPI --> AIOSGateway[AI Gateway - Provider Abstraction]
        AIOSGateway -->|Select Model| Provider[Gemini / OpenAI / Ollama / Fallback]
        
        AIOSGateway --> ContextBuilder[Dynamic Context Builder]
        ContextBuilder -->|Fetch Profile, SGI & Roadmap| ToolCalling[Platform Tools Framework]
        
        AIOSGateway --> Orchestrator[Multi-Agent Orchestrator]
        Orchestrator --> CareerMentor[Career Mentor Agent]
        Orchestrator --> ResumeAgent[Resume Intelligence Agent]
        Orchestrator --> GitHubAgent[GitHub Intelligence Agent]
        Orchestrator --> InterviewCoach[Interview Coach Agent]
        Orchestrator --> LearningAgent[Learning Assistant Agent]
        Orchestrator --> ResearchAgent[Research Assistant Agent]
    end

    subgraph "RAG & Knowledge Retrieval"
        Orchestrator --> RAGEngine[Knowledge Retrieval Engine]
        RAGEngine --> EmbeddingsDB[(Knowledge Docs DB)]
    end

    Orchestrator -->|2. Stream Response & Log Metrics| DB[(Supabase PostgreSQL)]
    DB -->|3. Persist Conversations & Token Cost| ExpressAPI
    ExpressAPI -->|4. Markdown & Code Output| Client
```

## Data Flow Summary
1. **Client Request**: Frontend sends queries to `/api/v1/ai/chat`, `/api/v1/ai/resume`, or `/api/v1/ai/interview`.
2. **Provider-Independent AI Gateway**: `aiGateway.ts` isolates provider details, tracking token input/output, latency (ms), and cost ($).
3. **Platform Context Grounding**: `platformTools.ts` retrieves real student profile data, BYSER scores, and roadmap progress to ground agent responses without data hallucination.
4. **Multi-Agent Execution**: `multiAgentOrchestrator.ts` routes to specialized agents (Career Mentor, Resume Intelligence, GitHub Intelligence, Interview Coach, Research Assistant).
5. **Session History & Analytics**: All messages and token usage metrics (`AiMetric`) are stored in PostgreSQL for continuous observability.
