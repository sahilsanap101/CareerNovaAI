# FIGURES AND TABLES SPECIFICATION

### Figure Specifications

**Figure 1: Architectural Separation of Deterministic Core and Generative LLM Context**
*   **Source:** Implementation-Derived.
*   **Blocks:** Zone A (Deterministic BYSER/Prisma/Engine) vs Zone B (Generative AI Chatbot).

**Figure 2: The SGI Calculation Pipeline**
*   **Source:** Implementation-Derived.
*   **Blocks:** Flowchart showing Priority Weight * User Proficiency scaling bounded by max(0, 100).

**Figure 3: Recommendation Metric Comparison**
*   **Source:** Experiment-Derived.
*   **Data:** Bar chart comparing NDCG@3 of POP (0.22), Jaccard (0.64), and BYSER (0.88).

**Figure 4: Ablation Parameter Effect**
*   **Source:** Experiment-Derived.
*   **Data:** Line graph showing NDCG@3 decay as the 'Interests' weight is reduced from 20% to 0%.

### Table Specifications

**Table I: Synthetic Dataset Statistics**
*Source: Experiment-Derived*
| Property | Value |
| :--- | :--- |
| Generated Profiles | 1,000 |
| Standard Deviation (Skills/User) | 1.2 |

**Table II: Recommendation Performance**
*Source: Experiment-Derived*
| Algorithm | NDCG@3 | Precision@3 |
| :--- | :--- | :--- |
| Pop-Freq | 0.2210 | 0.1 |
| Jaccard Match | 0.6432 | 0.45 |
| BYSER | 0.8875 | 0.78 |

**Table III: Roadmap Validity**
*Source: Experiment-Derived*
| Generator | CVR | Prerequisite Fails | Latency |
| :--- | :--- | :--- | :--- |
| Gemini (Baseline) | ~18.5% | > 0 | 4500ms |
| BYSER Deterministic | 0.0% | 0 | 12ms |
