# Data Processing Pipeline

## 1. Raw Ingestion
Data is pulled from APIs or public bulk downloads directly into `data/raw/` in its native format (.csv, .json, .xml).

## 2. Unification and Canonical Mapping (Entity Resolution)
The Entity Resolution script iterates over distinct sources (e.g., O*NET, ESCO, Job Postings).
- Uses Jaro-Winkler, Levenshtein, or semantic embeddings to bind localized skill strings (`"Python 3"`, `"Python (Programming)"`) to the singular Canonical Skill ID (`"skill_python_01"`).
- Every bound object emits a mapping record.

### Mapping Record Properties
- `source`: The raw dataset origin.
- `originalValue`: The literal unmutated string.
- `canonicalId`: The mapped system ID.
- `matchingMethod`: Describes mechanism (`EXACT`, `FUZZY`, `LLM_SEMANTIC`, `MANUAL`).
- `matchingConfidence`: (0.0 to 1.0)
- `timestamp`: Time of resolution operation.

## 3. Isolation of Unmatched Entities
When raw entities fall below the defined configuration threshold for `matchingConfidence`, they are **not discarded**. They are stored in an Unresolved Queue file to prevent silent dropping of valid data. This queue is periodically audited to merge new synonyms or discover novel market skills.

## 4. Output
Finally, standard data structures are dumped into `data/processed/` enforcing the types defined in the Data Dictionary. Theoretical simulations strictly fetch from `processed/`.
