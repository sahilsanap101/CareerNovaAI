import { E1CollaborativeFilteringBaseline } from './collaborative_filter';

describe('E1 External Baseline Validation', () => {
    it('ranks purely on Jaccard intersection violating causality', () => {
        const baseline = new E1CollaborativeFilteringBaseline();
        const user = ['python', 'sql'];
        const careers = [
            { id: 'C1', requiredSkills: ['python', 'sql', 'ml'] }, // Intersection 2, Union 3, Score 2/3 = 0.66
            { id: 'C2', requiredSkills: ['python', 'tableau'] }, // Intersection 1, Union 3, Score 1/3 = 0.33
            { id: 'C3', requiredSkills: ['java', 'spring'] } // Score 0
        ];

        const scores = baseline.executeJaccardSimilarityBaseline(user, careers);
        expect(scores[0].careerId).toBe('C1');
        expect(scores[0].jaccardScore).toBeCloseTo(0.666);
        expect(scores[1].careerId).toBe('C2');
        expect(scores[2].jaccardScore).toBe(0);
    });
});
