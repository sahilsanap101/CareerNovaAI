import { runB2Prioritization, SkillEvaluationRequest, calculateGap } from './prioritizer';

describe('B2 Skill Priority Model', () => {
    const mockProv = { source: 'TEST' };

    it('calculates gap bounded at 0', () => {
        expect(calculateGap(0.8, 0.4)).toBeCloseTo(0.4);
        expect(calculateGap(0.5, 1.0)).toBe(0); // Handled correctly, not negative
    });

    it('prioritizes based on variables and ranks dynamically', () => {
        const skills: SkillEvaluationRequest[] = [
            { // S1: Small gap, low importance, low demand
                skillId: 's1',
                studentProficiency: 0.8,
                requiredProficiency: 1.0,  // Gap 0.2
                careerImportance: 0.2,
                marketDemand: 0.5,
                prerequisiteStatus: 'AVAILABLE',
                provenance: mockProv
            },
            { // S2: High gap, high importance, high demand
                skillId: 's2',
                studentProficiency: 0.0,
                requiredProficiency: 1.0,  // Gap 1.0
                careerImportance: 1.0,
                marketDemand: 1.0,
                prerequisiteStatus: 'BLOCKED_BY_PREREQUISITE',
                provenance: mockProv
            },
            { // S3: Medium gap, but MASSIVE demand multiplier
                skillId: 's3',
                studentProficiency: 0.5,
                requiredProficiency: 1.0, // Gap 0.5
                careerImportance: 0.8,
                marketDemand: 0.8,
                prerequisiteStatus: 'AVAILABLE',
                provenance: mockProv
            }
        ];

        const results = runB2Prioritization(skills);

        // S2 should be highest priority (1.0 * 1.0 * 1.0 = 1.0 logic score)
        expect(results[0].skillId).toBe('s2');
        expect(results[0].priorityScore).toBe(1.0);
        expect(results[0].normalizedPriority).toBe(1.0);

        // S3 should be second (0.5 * 0.8 * 0.8 = 0.32)
        expect(results[1].skillId).toBe('s3');
        expect(results[1].priorityScore).toBeCloseTo(0.32);

        // S1 is last (0.2 * 0.2 * 0.5 = 0.02)
        expect(results[2].skillId).toBe('s1');
        expect(results[2].normalizedPriority).toBe(0.0); // min norm

        // Notably, prerequisite logic is uncoupled from priority logic.
        // S2 is ranked #1 in subjective priority despite being structurally 'BLOCKED_BY_PREREQUISITE'.
        expect(results[0].prerequisiteStatus).toBe('BLOCKED_BY_PREREQUISITE');
    });

    it('calculates utility score factoring learning cost appropriately', () => {
        const identicalSkills: SkillEvaluationRequest[] = [
            { // Large cost
                skillId: 'HardSkill', studentProficiency: 0.0, requiredProficiency: 1.0,
                careerImportance: 1.0, marketDemand: 1.0, learningCostHours: 100,
                prerequisiteStatus: 'AVAILABLE', provenance: mockProv
            },
            { // Micro cost (should have radically higher utility)
                skillId: 'EasySkill', studentProficiency: 0.0, requiredProficiency: 1.0,
                careerImportance: 1.0, marketDemand: 1.0, learningCostHours: 5,
                prerequisiteStatus: 'AVAILABLE', provenance: mockProv
            }
        ];

        const results = runB2Prioritization(identicalSkills);

        // Priority scores are identical: 1.0 (both gap=1, imp=1, demand=1)
        expect(results[0].priorityScore).toBe(results[1].priorityScore);

        const easySkill = results.find(r => r.skillId === 'EasySkill')!;
        const hardSkill = results.find(r => r.skillId === 'HardSkill')!;

        // But Utility must be vastly different. priority(1.0) / cost(5) vs priority(1.0) / cost(100)
        expect(easySkill.utilityScore).toBeGreaterThan(hardSkill.utilityScore!);
    });
});
