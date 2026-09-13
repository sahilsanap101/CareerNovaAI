import { normalizeSkillName } from '@pathforge/shared-constants';
import { evaluateCareerPath, StudentProfileForEngine, CareerPathForEngine } from './byserEngine';

describe('Skill Normalization', () => {
    it('normalizes JS, js, and Javascript to the same canonical value', () => {
        const val1 = normalizeSkillName('JS');
        const val2 = normalizeSkillName('js ');
        const val3 = normalizeSkillName('Javascript');

        expect(val1).toBe('JavaScript');
        expect(val2).toBe('JavaScript');
        expect(val3).toBe('JavaScript');
    });

    it('normalizes multi-word skills mapping correctly', () => {
        expect(normalizeSkillName('NodeJS')).toBe('Node.js');
        expect(normalizeSkillName('node js')).toBe('Node.js');
        expect(normalizeSkillName('Node.js')).toBe('Node.js');
    });

    it('normalizes case + whitespace combined mapping correctly', () => {
        expect(normalizeSkillName('   javascript  ')).toBe('JavaScript');
        expect(normalizeSkillName('\t jS \n')).toBe('JavaScript');
    });

    it('handles skills with 3+ aliases resolving to the exact same canonical string', () => {
        // JavaScript has 5 aliases: ['js', 'javascript', 'vanilla js', 'ecmascript', 'es6']
        expect(normalizeSkillName('vanilla js')).toBe('JavaScript');
        expect(normalizeSkillName('ecmascript')).toBe('JavaScript');
        expect(normalizeSkillName('es6')).toBe('JavaScript');
        expect(normalizeSkillName('js')).toBe('JavaScript');
        expect(normalizeSkillName('javascript')).toBe('JavaScript');
    });

    it('passes canonical values through unchanged', () => {
        expect(normalizeSkillName('JavaScript')).toBe('JavaScript');
    });

    it('matches unknown/unmapped skills consistently between user and career requirements', () => {
        const student: StudentProfileForEngine = {
            id: 's2',
            fullName: 'Test Student 2',
            profile: { cgpa: 7.5 },
            skills: [
                {
                    proficiency: 4,
                    experienceMonths: 12,
                    confidence: 80,
                    skill: { id: 'sk_unk1', name: '   Kotlin   ', category: 'Programming' },
                },
            ],
            interests: [],
            careerGoal: null,
            projects: [],
            certifications: [],
            codingPlatforms: [],
        };

        const career: CareerPathForEngine = {
            id: 'c2',
            name: 'Android Developer',
            description: 'Dev stuff',
            category: 'Software Engineering',
            industry: 'Technology',
            demandLevel: 'HIGH',
            requiredSkills: [
                {
                    importanceWeight: 8,
                    skill: { id: 'sk_unk2', name: 'KOTLIN', category: 'Programming' },
                },
            ],
        };

        const result = evaluateCareerPath(student, career);
        const skillFactor = result.factors.find((f) => f.factor === 'Skills');
        expect(skillFactor).toBeDefined();
        expect(skillFactor?.score).toBe(80);
        expect(skillFactor?.explanation).toContain('Matched 1 skill(s)');
    });

    it('correctly matches a user who entered "JS" against a career requiring "JavaScript"', () => {
        const student: StudentProfileForEngine = {
            id: 's1',
            fullName: 'Test Student',
            profile: { cgpa: 8.0 },
            skills: [
                {
                    proficiency: 5,
                    experienceMonths: 24,
                    confidence: 100,
                    skill: { id: 'sk1', name: 'JS', category: 'Programming' },
                },
            ],
            interests: [],
            careerGoal: null,
            projects: [],
            certifications: [],
            codingPlatforms: [],
        };

        const career: CareerPathForEngine = {
            id: 'c1',
            name: 'Frontend Dev',
            description: 'Dev stuff',
            category: 'Software Engineering',
            industry: 'Technology',
            demandLevel: 'HIGH',
            requiredSkills: [
                {
                    importanceWeight: 10,
                    skill: { id: 'sk2', name: 'JavaScript', category: 'Programming' },
                },
            ],
        };

        const result = evaluateCareerPath(student, career);
        const skillFactor = result.factors.find((f) => f.factor === 'Skills');
        expect(skillFactor).toBeDefined();
        expect(skillFactor?.score).toBe(100);
        expect(skillFactor?.explanation).toContain('Matched 1 skill(s)');
    });
});
