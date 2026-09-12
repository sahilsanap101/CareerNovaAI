# Data Provenance

An IEEE-grade model requires explicit transparency of data origin. Each dataset stored within the `raw/` and `processed/` structures must maintain a corresponding metadata snapshot in `metadata/` documenting the following fields.

## Required Metadata Fields (Machine-Readable JSON Object)

```json
{
  "dataset_name": "string",
  "source": "string (URL or agency)",
  "version": "string",
  "download_date": "ISO8601",
  "publication_date": "ISO8601 | null",
  "geographic_scope": "string",
  "temporal_scope": "string",
  "license": "string",
  "record_count": "number",
  "fields": ["array", "of", "strings"],
  "preprocessing_version": "string (e.g. v1.0.0 mapping script)",
  "transformation_history": ["list of operations executed from raw"],
  "limitations": ["list of known biases or constraints"]
}
```

## Designated Target Sources
1. **O*NET**
   - **Purpose**: Baseline occupation definitions, standard occupational skill relationships, generalized importance vectors.
2. **ESCO**
   - **Purpose**: Canonical skill taxonomy standardization, hierarchical skill topologies, explicit prerequisite assertions when available.
3. **Job-Posting Corpus**
   - **Purpose**: Observed external labor market skill demand scoring (dynamically overriding static definitions).
4. **Anonymized Student Dataset**
   - **Purpose**: Live target application testing and baseline evaluation matching. 
5. **Synthetic Student Profiles**
   - **Purpose**: Edge-cases, perturbation robustness scaling, extreme capability testing (e.g., zero-skill user vs all-skill user).
