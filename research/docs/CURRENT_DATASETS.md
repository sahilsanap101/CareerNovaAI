# CURRENT DATASETS

## Repository Inspection
Within `research/data/raw/` the following paths exist:

### 1. db_31_0_csv/
- Likely O*NET SQL/CSV database dumps.
- **Integration Status**: UNVERIFIED (Appears to be just downloaded raw archives. No pipeline scripts actively injecting this into Prisma seed files in `apps/api`).

### 2. ESCO dataset - v1.2.1/
- Contains CSVs of ESCO classification (occupations, skills, relations).
- **Integration Status**: NOT INTEGRATED. `skillDependencyEngine.ts` uses hard-coded arrays rather than ESCO CSVs.

### 3. archive/
- Contains `job_skills.csv`, `job_summary.csv`, `linkedin_job_postings.csv`.
- Likely Kaggle/LinkedIn job data.
- **Integration Status**: NOT INTEGRATED. Market data (salary, growth, demand) on `CareerPath` profiles in DB is seeded synthetically or inputted manually. Currently unused by recommendation engines.

## Conclusion
Currently Used Datasets: **NONE** (Only synthetic Prisma seeds).
Currently Unused Datasets: O*NET, ESCO, LinkedIn Archives.
