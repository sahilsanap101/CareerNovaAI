# Dependency Graph Validation Protocols

Because cyclic dependencies physically halt linear progression frameworks, the DAG must remain rigorously acyclic and connected appropriately.

## Pre-Computation Asserts
Every time the graph initializes or ingests a new structural dependency payload from the processed data layer, it runs through the validation cycle:

1. **Cycle Detection**:
   - A standard Depth-First Search (DFS) runs a state-map marking nodes as `UNVISITED`, `VISITING`, and `VISITED`. If a `VISITING` edge resolves back to another `VISITING` node, the graph instantiation halts with a `CyclicDependencyException`.
2. **Unreachable Node Detection**:
   - Compares the set of all known canonical skill endpoints against the topological sort traversal list. Missing nodes are flagged as disconnected islands.
3. **Closure Validity**:
   - Validates that the transitive prerequisite closure resolves downwards to at least one root node (a node with zero incoming prerequisites).

## Transparency of Rules
This graph operates as the singular source of truth for both the UI visualization component (e.g., ReactFlow rendering) and the research algorithm calculating optimization. This prevents synchronization divergence.
