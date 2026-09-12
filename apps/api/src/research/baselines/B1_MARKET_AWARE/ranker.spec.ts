import { MarketAwareRanker, B1StudentState, B1CareerState, DEFAULT_WEIGHTS } from './ranker';
import { runB1Evaluation } from './wrapper';

const mockDemandFetcher = (skillId: string, careerId: string) => {
    if (skillId === 'react') return 0.9;
    if (skillId === 'ai') return 1.0;
    return 0.5;
};

const studentMock: B1StudentState = {
    roleGoal: 'Software Engineer',
    industryGoal: 'Tech',
    interests: ['Frontend', 'AI'],
    proficiencies: {
        'js': 1.0,
        'html': 0.8
    }
};

const careerMock1: B1CareerState = {
    id: 'c1',
    role: 'Software Engineer',
    industry: 'Tech',
    tags: ['Frontend', 'Web'],
    requiredSkills: [
        { skillId: 'js', weight: 1.0 },
        { skillId: 'react', weight: 1.0 }
    ]
};

const careerMock2: B1CareerState = {
    id: 'c2',
    role: 'Data Scientist',
    industry: 'Tech',
    tags: ['AI', 'Data'],
    requiredSkills: [
        { skillId: 'python', weight: 1.0 },
        { skillId: 'ai', weight: 1.0 }
    ]
};

describe('B1 Market-Aware Career Ranker', () => {
    it('calculates expected score factors deterministically', () => {
        const ranker = new MarketAwareRanker(DEFAULT_WEIGHTS);
        const result = ranker.rankCareer(studentMock, careerMock1, mockDemandFetcher);

        // Skill fit for c1: has js(1.0), missing react. Earns 1/2 = 0.5
        expect(result.skill_fit).toBe(0.5);

        // Goal fit for c1: role match (1.0) overrides industry match (0.5), bounded to 1.0
        expect(result.goal_fit).toBe(1.0);

        // Interest fit for c1: 'Frontend' matches. 1 out of 2 tags = 0.5
        expect(result.interest_fit).toBe(0.5);

        // Market align: missing react which has 0.9 demand
        expect(result.market_alignment).toBe(0.9);

        // Explanation explicitly flags 'react' as expected missing high demand skill
        expect(result.explanation.highDemandMissing).toContain('react');
    });

    it('sorts and formats output properly in wrapper', () => {
        const results = runB1Evaluation(
            studentMock,
            [careerMock2, careerMock1], // Deliberately unordered
            mockDemandFetcher
        );

        // Career 1 should rank higher due to strong SkillFit (0.5 vs 0.0) and GoalFit
        expect(results[0].career_id).toBe('c1');
        expect(results[0].rank).toBe(1);
        expect(results[1].career_id).toBe('c2');
        expect(results[1].rank).toBe(2);
    });
});
