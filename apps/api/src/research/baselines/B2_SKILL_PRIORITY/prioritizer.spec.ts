import { runB2Prioritization, SkillEvaluationRequest, calculateGap, evaluateSkillPriority } from './prioritizer';

describe('B2 Skill Priority Model Validation', () => {
    describe('Gap Calculation', () => {
        it('calculates deterministic standard gap', () => {
            expect(calculateGap(1.0, 0.4)).toBeCloseTo(0.6);
        });
        it('bounds negative gap to 0', () => {
            expect(calculateGap(0.5, 1.0)).toBe(0.0);
        });
        it('handles undefined or missing proficiencies by defaulting to 0', () => {
            expect(calculateGap(undefined, 0.8)).toBe(0.0);
            expect(calculateGap(1.0, undefined)).toBe(1.0);
            expect(calculateGap(undefined, undefined)).toBe(0.0);
        });
        it('handles NaN gracefully', () => {
            expect(calculateGap(Number.NaN, 0.5)).toBe(0.0);
        });
    });

    describe('Priority & Edge Handlers', () => {
        it('calculates Priority = Gap * W_c * M_t correctly', () => {
            const res = evaluateSkillPriority({
                skillId: 's1', studentProficiency: 0.2, requiredProficiency: 1.0,
                careerImportance: 0.5, marketDemand: 2.0
            });
            expect(res.priorityScore).toBeCloseTo(0.8);
        });

        it('assigns 0 to priority when market demand or career importance is missing', () => {
            const missingCareer = evaluateSkillPriority({
                skillId: 's', requiredProficiency: 1.0, marketDemand: 1.0
            });
            expect(missingCareer.priorityScore).toBe(0.0);

            const missingMarket = evaluateSkillPriority({
                skillId: 's', requiredProficiency: 1.0, careerImportance: 1.0
            });
            expect(missingMarket.priorityScore).toBe(0.0);
        });
    });

    describe('Cost-Adjusted Utility Calculation', () => {
        it('calculates exact utility score Utility = Priority / (Cost + 0.0001)', () => {
            const res = evaluateSkillPriority({
                skillId: 's', requiredProficiency: 1.0, studentProficiency: 0.0,
                careerImportance: 1.0, marketDemand: 1.0, learningCostHours: 0
            });
            expect(res.utilityScore).toBeCloseTo(10000.0);
        });

        it('calculates standard utility', () => {
            const res = evaluateSkillPriority({
                skillId: 's', requiredProficiency: 1.0, studentProficiency: 0.0,
                careerImportance: 1.0, marketDemand: 1.0, learningCostHours: 10
            });
            expect(res.utilityScore).toBeCloseTo(1.0 / 10.0001);
        });
    });

    describe('Normalization & Batch Execution', () => {
        it('normalizes priorities correctly', () => {
            const results = runB2Prioritization([
                { skillId: 'high', requiredProficiency: 1.0, careerImportance: 1.0, marketDemand: 1.0 },
                { skillId: 'low', requiredProficiency: 1.0, careerImportance: 0.2, marketDemand: 1.0 }
            ]);
            expect(results.length).toBe(2);
            expect(results[0].skillId).toBe('high');
            expect(results[0].normalizedPriority).toBe(1.0);
            expect(results[1].normalizedPriority).toBe(0.0);
        });

        it('returns 0.5 normalized when all priorities are exactly equal', () => {
            const results = runB2Prioritization([
                { skillId: 's1', requiredProficiency: 1.0, careerImportance: 1.0, marketDemand: 1.0 },
                { skillId: 's2', requiredProficiency: 1.0, careerImportance: 1.0, marketDemand: 1.0 }
            ]);
            expect(results[0].normalizedPriority).toBe(0.5);
            expect(results[1].normalizedPriority).toBe(0.5);
        });
    });
});
