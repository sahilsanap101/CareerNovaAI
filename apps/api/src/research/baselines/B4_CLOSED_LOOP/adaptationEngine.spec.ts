import { calculateRoadmapDiff, calculateStalePlanRate } from './adaptationEngine';
import { RoadmapVersion, StudentStateSnapshot, MarketDemandSnapshot, SkillAssessmentEvidence } from './types';

describe('B4 Closed-Loop Adaptation Engine', () => {
    const mockMarket1: MarketDemandSnapshot = { versionId: 'M1', timestamp: 'T1', demandScores: {} };
    const mockMarket2: MarketDemandSnapshot = { versionId: 'M2', timestamp: 'T2', demandScores: {}, triggerContext: 'Global AI Demand Surge' };

    const mockEvidence: SkillAssessmentEvidence = {
        skillId: 'Python', source: 'MANUAL_OVERRIDE', measuredProficiency: 1.0, confidence: 100, timestamp: 'T2'
    };

    const mockStudent1: StudentStateSnapshot = { versionId: 'S1', timestamp: 'T1', proficiencies: { 'Python': 0 } };
    const mockStudent2: StudentStateSnapshot = { versionId: 'S2', timestamp: 'T2', proficiencies: { 'Python': 1.0 }, latestEvidence: mockEvidence };

    const mockRoadmap1: RoadmapVersion = {
        versionId: 'R1', timestamp: 'T1', studentStateId: 'S1', marketStateId: 'M1', scheduledSkillIds: ['Python', 'SQL', 'React']
    };

    const mockRoadmap2: RoadmapVersion = {
        versionId: 'R2', timestamp: 'T2', studentStateId: 'S2', marketStateId: 'M1', scheduledSkillIds: ['SQL', 'React', 'Docker']
    };

    it('computes robust churn calculation correctly', () => {
        const diff = calculateRoadmapDiff(mockRoadmap1, mockRoadmap2, mockStudent1, mockStudent2, mockMarket1, mockMarket1); // Only Student changed

        expect(diff.causeVector).toBe('STUDENT_STATE_CHANGE');
        // R1 size = 3. 
        // Added = 1 (Docker)
        // Removed = 1 (Python)
        // Churn = (1 + 1) / 3 = 0.666...
        expect(diff.churnMetric).toBeCloseTo(0.666);
        expect(diff.addedSkills).toContain('Docker');
        expect(diff.removedSkills).toContain('Python');
        expect(diff.retainedSkills).toContain('SQL');
    });

    it('calculates deterministic explanation properly utilizing evidence hooks', () => {
        const diff = calculateRoadmapDiff(mockRoadmap1, mockRoadmap2, mockStudent1, mockStudent2, mockMarket1, mockMarket1);
        expect(diff.explanation).toContain('Initiated by student proficiency update for skill [Python]');
        expect(diff.explanation).toContain('structural churn mathematically tracked at 66.7%');
    });

    it('measures stale plan rates globally across arrays', () => {
        // 3 transitions. 1 has churn (stale = false), 2 have zero churn (stale = true) despite boundary updates
        const rate = calculateStalePlanRate([
            { churnMetric: 0.5 } as any,
            { churnMetric: 0.0 } as any,
            { churnMetric: 0.0 } as any,
            { churnMetric: 0.2 } as any
        ]);

        expect(rate).toBe(0.5); // 2 out of 4 are stale
    });
});
