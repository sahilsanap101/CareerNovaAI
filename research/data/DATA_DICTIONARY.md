# Data Dictionary

Algorithms in this research operate exclusively on Canonical Entities mapped via the resolution pipeline.

## 1. Skill
- `id`: Canonical UUID
- `name`: Standardized nomenclature (e.g., "Python")
- `category`: Broad structural category.

## 2. Occupation
- `id`: Canonical UUID
- `title`: Market-known job title.
- `description`: Formal summary of the occupation.

## 3. Career
- `id`: Canonical UUID
- `name`: Target generalized pathway integrating multiple occupations.

## 4. JobPosting
- `id`: Unique snapshot UUID
- `title`: Raw listing title
- `datePosted`: Temporal tracking parameter
- `skillsExtracted`: Array of mapped canonical skill IDs

## 5. Student
- `id`: Anonymized UUID
- `learningBudget`: Allowed hours or cognitive load threshold for current roadmap iteration.

## 6. StudentSkill
- `studentId`: Foreign Key
- `skillId`: Canonical Skill ID
- `proficiency`: Assessed measurement (0.0 to 1.0)
- `confidence`: Assessment variance confidence measurement

## 7. CareerSkill
- `careerId`: Target index
- `skillId`: Condition index
- `importanceWeight`: Internal domain significance computed from O*NET/ESCO baselines.

## 8. SkillDependency
- `skillId`: The target dependent node.
- `prerequisiteId`: The antecedent required node.

## 9. MarketDemandSnapshot
- `skillId`: Canonical index.
- `timestamp`: The chronological index of measurement.
- `demandScore`: The computed occurrence frequency/weight relative to a specific temporal window in the JobPosting corpus.
