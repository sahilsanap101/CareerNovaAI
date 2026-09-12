# CURRENT AIOS / LLM AUDIT

## Implementation
File: `apps/api/src/modules/ai/orchestrator/multiAgentOrchestrator.ts`

- Uses basic native SDK integrations (e.g., Gemini SDK).
- `AgentType` acts as a routing switch to inject a DIFFERENT SYSTEM PROMPT.
- No graph execution logic (e.g. no LangGraph/AutoGen framework).
- No memory buffer implementation beyond basic DB querying.
- Context injection is done by stringifying DB results (`getStudentProfile`, `getBYSERRecommendations`).

### Verdict
WHAT DATA ENTERS THE LLM? Standard profile and roadmap strings.
WHAT DOES THE LLM DECIDE? Nothing algorithmic. It merely formats explanations.
CAN SYSTEM WORK WITHOUT LLM? Yes, core recommendations act entirely independently of the LLM.
IS THIS CORE ALGORITHM? No, it is an **EXPLANATION LAYER / UX FEATURE**.
