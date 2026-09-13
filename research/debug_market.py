import csv
import json
from run_evaluation import evaluate, CAREERS

def debug():
    rows = []
    with open('research/eval_dataset.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= 5: break
            rows.append({
                'id': row['student_id'],
                'truth': row['ground_truth'],
                'skills': json.loads(row['skills']),
                'interests': json.loads(row['interests']),
                'projects': json.loads(row['projects']), 
                'cgpa': float(row['cgpa']) if row['cgpa'] else None,
                'certifications_count': int(row['certifications_count']),
                'coding_solved': int(row['coding_solved']),
                'preferred_role': row['preferred_role']
            })
            
    print("--- 1. MarketAlignment values across Top-3 Careers for 5 Profiles ---")
    for r in rows:
        print(f"\nStudent ID: {r['id']}")
        
        # We need to manually calculate just the market_bonus to display it cleanly,
        # but since 'evaluate' returns the final match score, we'll run 
        # evaluate and snag the difference, or rewrite the internal logic.
        
        # Let's run base and market natively
        scores_base = {c['name']: evaluate(r, c, enable_market=False) for c in CAREERS}
        scores_mkt = {c['name']: evaluate(r, c, enable_market=True) for c in CAREERS}
        
        # Sort by Market winners
        sorted_mkt = sorted(scores_mkt.items(), key=lambda x: x[1], reverse=True)[:3]
        for cname, score_m in sorted_mkt:
            score_b = scores_base[cname]
            diff = score_m - score_b
            print(f"  - {cname}: Base = {score_b:4d}, Score(+Market) = {score_m:4d} | Delta (approx MarketAlignment) = {diff:2d}")
            
if __name__ == "__main__":
    debug()
