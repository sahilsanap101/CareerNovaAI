# PATHFORGE Input Schema v1 Snapshot (Phase 1B)

This document specifies exactly what the production PATHFORGE `RecommendationEngineService` requires for a student profile input.

## 1. Skills
- **Type:** `Record<string, { proficiency: number, confidence: number }>`
- **Expected Representation:** The key MUST be the canonical skill name (e.g., `SK_python`, `SK_react`).
- **Matching Mechanism:** Exact exact string match on object keys against the required skill canonical names from the career knowledge base.
- **Canonical Vocabulary:** `skill_catalog_pathforge_2026.csv` or `test_personalization.ts` mocks.
- **Missing Values:** Supported; if a required skill key is missing, it is evaluated as 0 proficiency (causing gaps).

## 2. Interests
- **Type:** `Record<string, { priority: number }>`
- **Expected Representation:** The key MUST be the exact interest ID (e.g., `INT_systems_design`).
- **Matching Mechanism:** Exact string match against `career.interests` mapping.
- **Canonical Vocabulary:** System-defined interest strings.
- **Missing Values:** Supported; evaluated as 0 matching interests.

## 3. Projects
- **Type:** `Array<{ title: string, description: string, technologies: string[] }>`
- **Expected Representation:** Array of objects.
- **Matching Mechanism:** Fuzzy/Substring match. The engine lowercases all `technologies` in the student's project and checks if they `include()` any of the career's required skill canonical names (lowercased) or the career's domain category (lowercased).
- **Missing Values:** Supported via empty array `[]`.

## 4. Academics
- **Type:** `{ degree: string | null, branch: string | null, specialization: string | null, cgpa: number | null }`
- **Expected Representation:** Standard object.
- **Matching Mechanism:** 
  - CGPA is matched numerically via hardcoded thresholds ($\ge 8.5$, $\ge 7.5$, etc.).
  - Branch is matched using substring checks: if `branch.toLowerCase().includes(b)` where `b` is `['computer science', 'it', 'software']`.
- **Missing Values:** `cgpa = 0` fallback. Missing branch defaults to no bonus points.

## 5. Certifications
- **Type:** `Array<{ title: string, issuer: string }>`
- **Expected Representation:** Array of objects.
- **Matching Mechanism:** Fuzzy/Substring match. Checks if `title.toLowerCase()` contains any of the required skill canonical names or career category strings.
- **Missing Values:** Supported via empty array `[]`.

## 6. Coding Evidence
- **Type:** `{ totalProblemsSolved: number, activePlatforms: string[] }`
- **Expected Representation:** Standard object.
- **Matching Mechanism:** Numerical thresholding on `totalProblemsSolved` ($300$, $150$, $50$).
- **Missing Values:** Missing defaults to 0 problems (yielding minimum 20 points).

## 7. Career Goals
- **Type:** `{ targetRole: string | null, targetIndustry: string | null, ... }`
- **Expected Representation:** Standard object.
- **Matching Mechanism:** Substring matching. `targetRole.toLowerCase().includes(career.name.toLowerCase())` or `targetIndustry.toLowerCase().includes(career.category.toLowerCase())`.
- **Missing Values:** Supported via `null`, yields neutral 50 points.

## 8. Assessment Responses
- **Type:** `Array<{ questionId: string, selectedValue: string }>` (handled via AssessmentService)
- **Expected Representation:** `questionId` must match v1 JSON ids (e.g., `Q1`). `selectedValue` must be strings `"1"`, `"2"`, `"3"`, `"4"`, `"5"`.
- **Matching Mechanism:** Direct lookup into `career_assessment_weight_matrix_v1.json`.
- **Missing Values:** Unanswered required questions throw an error in `submitAssessment()`.
