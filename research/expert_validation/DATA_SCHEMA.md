# Expert Validation Data Schema

Evaluation databases explicitly reject Personally Identifiable Information (PII). Results must serialize against this schema mapping strict qualitative integers binding statistical formulas.

## Typescript Definition Reference

```typescript
export interface ExpertEvaluationItem {
  // Anonymization bounds
  evaluatorId: string;       // Generic GUID (e.g., 'EVAL_10283A')
  caseId: string;            // Reference to synthetic benchmark (e.g., 'STU_MOCK_40')
  itemId: string;            // Explicit reference to node or baseline output execution id
  
  // Likert Matrix (Each bounded 1-5 natively)
  scores: {
    careerRelevance: number;
    skillGapCorrectness: number;
    skillPriorityCorrectness: number;
    marketAlignmentPlausibility: number;
    prerequisiteCorrectness: number;
    roadmapSequenceCorrectness: number;
    roadmapActionability: number;
    explanationQuality: number;
  };
  
  // Optional Qualifiers
  optionalComment?: string;
  
  // Tracking Reference
  timestamp: string;         // ISO String boundary
}
```
