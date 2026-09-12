# Prerequisite Test Vectors

Unit testing in the formal graph evaluates these explicit user-progression contexts computationally:

1. **Valid DAG (Base Case)**: Graph initializes successfully without cycles and sorts topologically.
2. **Cycle Injection**: Creating a bidirectional relationship between $A \rightarrow B$ and $B \rightarrow A$ correctly triggers a Cycle Error.
3. **Missing Prerequisite**: Given a student has $C = 0.0$ where $C$ depends on $B$, if $B_{proficiency} = 0$, then $C$ resolves gracefully to `BLOCKED`.
4. **Partially Satisfied Prerequisite**: Given $C$ depends on $A$ and $B$, where $A_{proficiency} = 1.0$ and $B_{proficiency} = 0.3$ (but threshold requires 0.5), $C$ remains `BLOCKED`.
5. **Multiple Satisfied Prerequisites**: Given $C$ depends on $A$ and $B$, where both are fully mastered, $C$ resolves gracefully to `AVAILABLE`.
6. **Transitive Path Status**: If $C$ relies on $B$, and $B$ relies on $A$, $A$'s completion immediately unlocks $B$ (but explicitly not $C$ until $B$ completes).
