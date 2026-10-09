import hashlib, json, os, pandas as pd

res = {}
d = 'research/data/synthetic_v2'
files = ['synthetic_v2_A.csv', 'synthetic_v2_B.csv', 'synthetic_v2_C.csv', 'generator_config_v1.json']
for f in files:
    p = os.path.join(d, f)
    b = open(p, 'rb').read()
    h = hashlib.sha256(b).hexdigest()
    info = {'hash': h}
    if f.endswith('.csv'):
        df = pd.read_csv(p)
        info['rows'] = len(df)
        info['columns'] = len(df.columns)
    res[f] = info

res['generator_version'] = 'v1'
res['random_seeds'] = {'master': 42, 'career_mappings': 101, 'transition_bias': 202}
json.dump(res, open('research/audit/synthetic_v2_freeze_manifest.json', 'w'), indent=2)
print("Frozen!")
