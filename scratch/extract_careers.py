import csv
import json
import os

base_dir = r'c:\Users\ankit\Downloads\PATHFORGE (1)\PATHFORGE'
csv_path = os.path.join(base_dir, 'research', 'data', 'career_catalog_pathforge_60_careers_2026.csv')
subset_path = os.path.join(base_dir, 'research', 'data', 'synthetic_v3', 'synthetic_v3_career_subset_v1.json')

with open(subset_path, 'r', encoding='utf-8') as f:
    subset = json.load(f)
subset_names = {c['career_name'] for c in subset}

careers = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        careers.append({
            'id': row['career_id'],
            'name': row['career_name']
        })

careers.sort(key=lambda x: x['name'])
subset_sorted = sorted(list(subset_names))

md_lines = []
md_lines.append('# PATHFORGE Complete Career Catalog\n')
md_lines.append(f'**Total Careers in Production Catalog:** {len(careers)}\n')
md_lines.append('## Full 60 Career Catalog\n')

for i, c in enumerate(careers, 1):
    md_lines.append(f"{i}. **{c['name']}** (ID: {c['id']})")

md_lines.append('\n## 15-Career Synthetic Subset (synthetic_v3_career_subset_v1.json)\n')
for i, name in enumerate(subset_sorted, 1):
    c_id = next((c['id'] for c in careers if c['name'] == name), 'UNKNOWN')
    md_lines.append(f"{i}. **{name}** (ID: {c_id})")

with open(os.path.join(base_dir, 'COMPLETE_60_CAREER_CATALOG.md'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines))

print('Markdown file created successfully.')
