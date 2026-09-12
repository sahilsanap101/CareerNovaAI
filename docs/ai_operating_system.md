# AI Operating System (AIOS) Technical Specification

## 1. System Overview
The **PathForge AIOS** is a provider-independent, multi-agent AI orchestration platform. It connects internal platform data (student profile, BYSER scores, active roadmap, skill gaps) with specialized LLM agents to deliver grounded, non-hallucinated career intelligence.

---

## 2. Specialized Agents & Responsibilities

| Agent Name | Agent ID | Core Responsibilities |
|------------|----------|------------------------|
| **Career Mentor** | `CAREER_MENTOR` | Holistic career path guidance, salary expectations, industry trends |
| **Resume Intelligence** | `RESUME` | ATS compatibility scoring (0-100), missing keyword detection, bullet rewrite suggestions |
| **GitHub Intelligence** | `GITHUB` | Portfolio repository analysis, code quality score, maintainability feedback |
| **Interview Coach** | `INTERVIEW` | Mock HR, Technical, System Design, and Behavioral interview evaluation |
| **Learning Assistant** | `LEARNING` | Technical concept breakdowns, code examples, revision notes |
| **Research Assistant** | `RESEARCH` | Non-hallucinated academic paper summaries, methodology suggestions |
| **Roadmap Optimizer** | `ROADMAP` | Adaptive study schedule optimization & milestone planning |

---

## 3. Provider Abstraction & Metric Tracking
- **Provider Agnostic**: Switchable via `AI_PROVIDER` (Gemini, OpenAI, Anthropic, Ollama, Fallback) without code changes.
- **Metric Logging**: Stores `tokensInput`, `tokensOutput`, `durationMs`, and estimated `cost` per session in `AiMetric` table for complete observability.
