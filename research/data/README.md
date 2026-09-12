# PathForge Research Data Foundation

This directory houses the entirely segregated, reproducible data layer necessary for the PathForge IEEE research project.

## Core Rules
1. **Never modify raw files.** Data deposited into the `raw/` folder are read-only immutable assets.
2. **All processing creates derived datasets.** Pipelines output to the `processed/` directory.
3. **Canonical Mappings Only.** All algorithms operate exclusively on canonical entity IDs, regardless of which raw data source originally provided the entity.

## Directory Structure
- `raw/`: Unaltered, original downloads of datasets (e.g., O*NET csvs, ESCO taxonomies, job posting dumps).
- `processed/`: Derived data transformations outputting canonical formats.
- `student/`: Anonymized student performance and profile data tracking.
- `synthetic/`: Fabricated profiles solely for robust/ablation experiments and controlled scenario testing.
- `metadata/`: Machine-readable metadata objects tracking origin, modification dates, algorithms used, and data limitations for every source.
- `types/`: Canonical definitions of the data schema.
- `pipeline/`: ETl and entity resolution scripts.
