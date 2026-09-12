export class E1CollaborativeFilteringBaseline {
    /**
     * Represents a standard Matrix-Factorization approximation baseline widely used in SOTA Recommenders.
     * Evaluates users strictly on distance vectors avoiding sequence causality or topological graphs.
     * @param userSkills Array of string skill IDs the user possesses
     * @param targetCareers Array of careers matching {id, requiredSkills}
     * @returns Array of sorted recommendations matching purely on Jaccard Coefficient
     */
    public executeJaccardSimilarityBaseline(userSkills: string[], targetCareers: { id: string, requiredSkills: string[] }[]): { careerId: string, jaccardScore: number }[] {
        const results = targetCareers.map(career => {
            const intersection = career.requiredSkills.filter(s => userSkills.includes(s)).length;
            const union = Array.from(new Set([...userSkills, ...career.requiredSkills])).length;
            const jaccardScore = union === 0 ? 0 : intersection / union;

            return {
                careerId: career.id,
                jaccardScore
            };
        });

        return results.sort((a, b) => b.jaccardScore - a.jaccardScore);
    }
}
