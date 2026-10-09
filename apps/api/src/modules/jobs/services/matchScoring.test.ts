import { scoreJob } from './matchScoring.service';
import type { StudentContext, JobContext } from './matchScoring.service';

describe('Live Jobs Match Scoring Engine', () => {
    const defaultStudent: StudentContext = {
        recommendedCareers: ['Software Developer', 'Mobile Developer'],
        skillNames: ['Java', 'Spring Boot', 'SQL', 'Git'],
        preferredLocation: 'Pune',
        workMode: 'REMOTE',
        educationLevel: 'B.Tech',
        experienceMonths: 0,
    };

    it('calculates score within 0–100 range', () => {
        const job: JobContext = {
            title: 'Software Developer',
            location: 'Pune',
            snippet: 'Looking for a Software Developer with Java and Spring Boot knowledge. Entry-level freshers welcome.',
            careerIdentifiers: ['Software Developer'],
        };

        const result = scoreJob(job, defaultStudent);
        expect(result.matchScore).toBeGreaterThanOrEqual(0);
        expect(result.matchScore).toBeLessThanOrEqual(100);
        expect(result.recommendedCareer).toBe('Software Developer');
        expect(result.matchedSkills).toContain('Java');
        expect(result.explanation).toContain('match for Software Developer');
    });

    it('does not hallucinate skills not present in the job text', () => {
        const job: JobContext = {
            title: 'Technical Support',
            location: 'Mumbai',
            snippet: 'Customer communication and ticket resolution. No coding required.',
            careerIdentifiers: [],
        };

        const result = scoreJob(job, defaultStudent);
        // None of Java, Spring Boot, etc. should be matched if they are not in title or snippet
        expect(result.matchedSkills).toEqual([]);
        expect(result.skillGaps).toEqual([]);
    });

    it('lowers confidence and handles missing job details without fabrication', () => {
        const sparseJob: JobContext = {
            title: 'Specialist',
            snippet: '',
            careerIdentifiers: [],
        };

        const result = scoreJob(sparseJob, defaultStudent);
        expect(result.confidence).toBe('LOW');
        expect(result.eduExperienceMatch.status).toBe('UNAVAILABLE');
        expect(result.locationMatch.status).toBe('UNAVAILABLE');
        expect(result.matchScore).toBeGreaterThanOrEqual(0);
        expect(result.matchScore).toBeLessThanOrEqual(100);
    });

    it('identifies matched skills and skill gaps accurately', () => {
        const job: JobContext = {
            title: 'Software Developer',
            snippet: 'Requires Java, Docker, Kubernetes, and Git.',
            careerIdentifiers: ['Software Developer'],
        };

        const result = scoreJob(job, defaultStudent);
        // Student has Java, Git
        expect(result.matchedSkills).toContain('Java');
        expect(result.matchedSkills).toContain('Git');
        // Student does not have Docker, Kubernetes
        expect(result.skillGaps).toContain('Docker');
        expect(result.skillGaps).toContain('Kubernetes');
    });

    it('handles location matching accurately (exact match, remote, partial, mismatch)', () => {
        const onsiteStudent: StudentContext = {
            ...defaultStudent,
            workMode: 'ONSITE',
            preferredLocation: 'Pune',
        };
        const puneJob: JobContext = {
            title: 'Developer',
            location: 'Pune, Maharashtra',
            careerIdentifiers: ['Software Developer'],
        };
        const resPune = scoreJob(puneJob, onsiteStudent);
        expect(resPune.locationMatch.status).toBe('MATCHED');

        const remoteJob: JobContext = {
            title: 'Developer - Remote',
            location: 'Anywhere / Remote',
            careerIdentifiers: ['Software Developer'],
        };
        const resRemote = scoreJob(remoteJob, defaultStudent);
        expect(resRemote.locationMatch.status).toBe('MATCHED');

        const resPartial = scoreJob(puneJob, defaultStudent); // defaultStudent prefers REMOTE
        expect(resPartial.locationMatch.status).toBe('PARTIAL');

        const delhiStudent: StudentContext = {
            ...defaultStudent,
            preferredLocation: 'Delhi',
            workMode: 'ONSITE',
        };
        const bangaloreJob: JobContext = {
            title: 'Developer',
            location: 'Bengaluru, Karnataka',
            careerIdentifiers: ['Software Developer'],
        };
        const resMismatch = scoreJob(bangaloreJob, delhiStudent);
        expect(resMismatch.locationMatch.status).toBe('MISMATCH');
    });
});
