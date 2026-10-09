# REPAIR BASELINE

## Current Status
- Assessment parsing in `run_fresh_inference.ts` is broken.
- Assessment score always evaluates to zero.
- 70:30 fusion effectively performs 70% profile + 0% assessment, which behaves identically to Profile-only ranking.
- Target generation for the fresh dataset uses independent random matrices, causing accuracy to plummet to 5.33% Top-1.

## Known Bugs
1. **BUG 1:** `qId` loop in `run_fresh_inference.ts` constructs `"Q1"` instead of `"Q01"`.
2. **BUG 2:** `qDef.options` is accessed, but the schema uses `career_weights` mapped by Likert values directly.
3. **BUG 3:** Assessment scores are 0, resulting in incorrect 70:30 fusion.
4. **BUG 4:** Inference logic for assessment is partially duplicated inside the eval script instead of relying exclusively on backend services (or the backend service has the same bug).

## Objectives
- Fix the assessment parser logic (string formatting, JSON property access).
- Restore the proper 0-100 assessment score scale.
- Restore the 70:30 fusion.
- Validate scoring mathematically without modifying the underlying deterministic methodology.
