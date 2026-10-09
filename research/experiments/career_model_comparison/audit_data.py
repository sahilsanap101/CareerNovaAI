import pandas as pd
import json
import os
import glob
from collections import Counter

data_dir = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/data/evaluation/"
output_file = "c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/experiments/career_model_comparison/DATA_AUDIT.md"

csv_files = glob.glob(os.path.join(data_dir, "*.csv"))

report = []
report.append("# Data Audit Report")

for file in csv_files:
    filename = os.path.basename(file)
    try:
        df = pd.read_csv(file)
        report.append(f"## Dataset: {filename}")
        report.append(f"- **Rows:** {len(df)}")
        report.append(f"- **Columns:** {len(df.columns)}")
        
        # Check duplicates
        if 'student_id' in df.columns:
            dups = df['student_id'].duplicated().sum()
            report.append(f"- **Duplicate student_ids:** {dups}")
        
        # Missing values
        missing = df.isnull().sum()
        report.append(f"- **Columns with missing values:**")
        for col, count in missing[missing > 0].items():
            report.append(f"  - {col}: {count}")
            
        # Target distribution
        if 'preferred_career' in df.columns:
            dist = df['preferred_career'].value_counts()
            report.append(f"- **Unique careers in labels:** {len(dist)}")
            report.append(f"- **Top 5 careers:** {dist.head(5).to_dict()}")
            report.append(f"- **Bottom 5 careers:** {dist.tail(5).to_dict()}")
            
        # Check target leakage / generation artifacts
        # We need to see what features exist
        report.append(f"- **Available features:** {', '.join(df.columns.tolist()[:10])} ...")
        
        # Check invalid assessment responses
        ass_cols = [c for c in df.columns if c.startswith('assessment_q')]
        if ass_cols:
            invalid_count = 0
            for col in ass_cols:
                invalid_count += df[~df[col].astype(str).str.match(r'^[1-8]$', na=False)].shape[0]
            report.append(f"- **Invalid assessment responses:** {invalid_count} total across all questions")
        
        report.append("")
    except Exception as e:
        report.append(f"Error reading {filename}: {e}")

with open(output_file, 'w') as f:
    f.write('\n'.join(report))
print("Audit complete.")
