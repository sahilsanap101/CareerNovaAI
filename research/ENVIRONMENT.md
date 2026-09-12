# Experimental Environment Constants

Reproducing topological outcomes in typescript relies explicitly on node resolution.

## Environment Architecture
*   **Operating System Agnostic**: Computed variables strictly utilize absolute relative boundaries preventing path-resolution disparities.
*   **Engine Versions**: Node $20.x$, TS-Node matching strict execution parity avoiding asynchronous math drifting.

## Tracking Dependencies
Each executing experiment dynamically generates a `.prov.json` (Provenance) file alongside the table storing:
1. `Git Commit Hash` (The exact iteration of the Graph definitions).
2. `Execution Timestamp` (Preventing Data Leakage overlapping metrics).
3. `Random Seed` (Enforcing stochastic tie-breakers yield identically across execution loops).
4. Explicit Dependency Versions isolating `React/Tanstack` UI layers entirely from backend TS algorithm constraints.
