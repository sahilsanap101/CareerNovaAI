/**
 * Deterministic Semantic Baseline using native TF-IDF + Cosine Similarity.
 * Operates purely locally on exact skill/career text representations matching B4 semantics avoiding opaque API calls.
 */

export class TFIDF_SemanticBaseline {
    private documents: string[] = [];
    private termCounts: Map<string, number>[] = [];
    private documentFrequencies = new Map<string, number>();

    private tokenize(text: string): string[] {
        return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 0);
    }

    public fit(corpus: string[]) {
        this.documents = corpus;
        this.termCounts = [];
        this.documentFrequencies.clear();

        for (const doc of corpus) {
            const tokens = this.tokenize(doc);
            const tc = new Map<string, number>();
            const uniqueTokens = new Set<string>();

            for (const t of tokens) {
                tc.set(t, (tc.get(t) || 0) + 1);
                uniqueTokens.add(t);
            }

            this.termCounts.push(tc);

            for (const t of uniqueTokens) {
                this.documentFrequencies.set(t, (this.documentFrequencies.get(t) || 0) + 1);
            }
        }
    }

    private computeVector(text: string): Map<string, number> {
        const tokens = this.tokenize(text);
        const tc = new Map<string, number>();
        for (const t of tokens) tc.set(t, (tc.get(t) || 0) + 1);

        const vector = new Map<string, number>();
        const N = this.documents.length;

        for (const [t, count] of tc.entries()) {
            const df = this.documentFrequencies.get(t) || 0;
            // IDF using smoothing: ln( (1 + N) / (1 + df) ) + 1
            const idf = Math.log((1 + N) / (1 + df)) + 1;
            vector.set(t, count * idf);
        }

        return vector;
    }

    public cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
        let dotProduct = 0;
        let magA = 0;
        let magB = 0;

        for (const [key, valA] of vecA.entries()) {
            magA += valA * valA;
            if (vecB.has(key)) dotProduct += valA * vecB.get(key)!;
        }

        for (const valB of vecB.values()) {
            magB += valB * valB;
        }

        if (magA === 0 || magB === 0) return 0.0;
        return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    public rankCandidates(query: string, candidates: string[]): { candidate: string, score: number }[] {
        const queryVec = this.computeVector(query);
        return candidates.map(c => {
            const cVec = this.computeVector(c);
            return { candidate: c, score: this.cosineSimilarity(queryVec, cVec) };
        }).sort((a, b) => b.score - a.score);
    }
}
