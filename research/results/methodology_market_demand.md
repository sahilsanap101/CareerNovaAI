# Methodology Note: Market Demand Integration

## Data Source
The `MarketAlignment` factor computes its scoring parameters inherently via an internal proxy data structure rather than dynamically scraping live public job postings from the Internet. We specifically isolated the `ESCO` (European Skills, Competences, Qualifications and Occupations) dataset mappings contained precisely within:
- `research/data/processed/esco/esco_skills.csv`
- `research/data/processed/esco/esco_occ_skills.csv`
- `research/data/processed/esco/esco_occupations.csv`

The `scrape_job_postings.py` runtime queries these relationships strictly for occupations aligning mathematically with Software Engineering/Computer Science keywords (`software`, `developer`, `programmer`, `frontend`, etc.). It then calculates the global occurrence frequency of any designated `esco_skill_id` tied to these proxy occupations, normalizing the maximum frequency ratio mathematically toward `1.0`.

## Limitations
Because this implementation proxies market demand via static hierarchical frameworks engineered by the EU rather than dynamically aggregating live job boards (e.g. LinkedIn, Indeed), its utility as a pure market-alignment tracker is inherently abstracted:
1. **Recency Degradation**: ESCO datasets publish sequentially; current skills surfacing immediately in modern job descriptions may not materialize cleanly within the hierarchy.
2. **Geographical Agnosticism**: Proxied relationships abstract geographic variations within software demands natively.
3. **Absence of Real Volumes**: Frequency in the `esco_occ_skills` database maps exactly to *how many standard roles require the skill*, not *how many companies are hiring for that role*, leading to potentially noisy absolute-volume metrics.
