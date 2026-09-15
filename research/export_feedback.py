import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

def main():
    # Load environment variables relative to current script
    env_path = os.path.join(os.path.dirname(__file__), '..', 'apps', 'api', '.env')
    load_dotenv(env_path)
    
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL not found in apps/api/.env")

    # Connect to the DB and execute standard dataframe mapping
    engine = create_engine(db_url)
    query = "SELECT * FROM feedbacks"
    df = pd.read_sql(query, engine)
    
    os.makedirs(os.path.join(os.path.dirname(__file__), 'results'), exist_ok=True)
    out_path = os.path.join(os.path.dirname(__file__), 'results', 'feedback_raw.csv')
    df.to_csv(out_path, index=False, encoding='utf-8')
    print(f"Exported {len(df)} feedback records to {out_path}")

if __name__ == "__main__":
    main()
