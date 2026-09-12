# CURRENT FRONTEND MAP

## UI Architecture
React app utilizing standard routing (Vite-based).

### Pages
- Standard Auth flows (Login, Register).
- **Dashboard**: Aggregates recommendations and roadmap progress.
- **Onboarding**: Multi-step form filling out the profile schema.
- **Recommendation Screen**: Reads from `/api/v1/recommendations`.
- **Roadmap Screen**: Renders the hierarchical tree structure from DB.
- **AI Mentor**: Chat interface querying `/api/v1/ai`.

## Claims vs Reality
- **"AI-Powered Personalized Recommendations"**: Driven by heuristic equations (BYSER) using standard maths (weights * confidence). No models on client side.
- **"Adaptive Roadmaps"**: Displays static DB trees generated once upon initialization. Not dynamically adjusting to real-time skill gaps via feedback loops.
- **"Market Demand Data"**: Displayed values (e.g. 22% YoC growth) are hardcoded in the frontend or DB seed files, not pulled live.
