import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def main():
    csv_path = os.path.join(os.path.dirname(__file__), 'results', 'feedback_raw.csv')
    try:
        df = pd.read_csv(csv_path, encoding='utf-8')
    except FileNotFoundError:
        print(f"No {csv_path} found! Ensure you have exported feedback first.")
        return

    n_size = len(df)
    print("=" * 40)
    print(f"HUMAN EVALUATION METRICS (N={n_size})")
    print("=" * 40)

    if n_size < 30:
        print("\n[WARNING] Sample size is strictly beneath n=30. Results may lack statistical significance.\n")

    if n_size > 0:
        mean_relevance = df['relevanceScore'].mean()
        std_relevance = df['relevanceScore'].std()
        mean_clarity = df['roadmapClarityScore'].mean()
        std_clarity = df['roadmapClarityScore'].std()

        print(f"Relevance: M={mean_relevance:.2f}, SD={std_relevance:.2f}")
        print(f"Clarity:   M={mean_clarity:.2f}, SD={std_clarity:.2f}")

        # Plot distribution cleanly
        plt.figure(figsize=(6, 4))
        val_counts = df['relevanceScore'].value_counts().sort_index()
        # Guarantee all 1 to 5 index labels are present
        for i in range(1, 6):
            if i not in val_counts:
                val_counts[i] = 0
        val_counts = val_counts.sort_index()
        
        plt.bar(val_counts.index, val_counts.values, color='#3b82f6', edgecolor='black')
        plt.title(f'Relevance Score Distribution (N={n_size})')
        plt.xlabel('Score (1-5 Likert)')
        plt.ylabel('Frequency')
        plt.xticks(range(1, 6))
        plt.tight_layout()
        
        img_path = os.path.join(os.path.dirname(__file__), 'results', 'relevance_distribution.png')
        plt.savefig(img_path)
        print(f"\nSaved Relevance Distribution chart to {img_path}")
    else:
        print("Data source is empty (0 records). Cannot compute statistics.")

if __name__ == "__main__":
    main()
