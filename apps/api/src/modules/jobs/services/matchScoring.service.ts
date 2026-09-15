/**
 * Job Match Scoring Engine.
 *
 * Completely separate from BYSER — does NOT modify Career Recommendation logic.
 *
 * Weights:
 *   Career Match:          40%
 *   Skill Match:           40%
 *   Education/Experience:  10%
 *   Location Match:        10%
 *
 * Returns a 0–100 integer score plus explanation arrays.
 */

import { inferMatchingCareers } from './careerJobMapping.service';

interface StudentContext {
    recommendedCareers: string[];   // e.g. ['Mobile Developer', 'QA Engineer']
    skillNames: string[];           // e.g. ['React', 'Node.js', 'Flutter']
    preferredLocation?: string;     // e.g. 'Pune'
    workMode?: string;              // REMOTE | HYBRID | ONSITE
}

interface JobContext {
    title: string;
    location?: string | null;
    snippet?: string | null;
    type?: string | null;
    careerIdentifiers: string[];    // careers already linked via JobCareerMatch
}

export interface MatchResult {
    matchScore: number;
    matchedSkills: string[];
    gapSkills: string[];
    matchReasons: string[];
}

// Extract skill tokens from a text blob (title + snippet)
function extractKeywordsFromJobText(title: string, snippet: string | null | undefined): string[] {
    const text = `${title} ${snippet ?? ''}`.toLowerCase();
    // Full list of common tech skills to scan for
    const knownSkills = [
        'react', 'angular', 'vue', 'javascript', 'typescript', 'node.js', 'nodejs', 'python',
        'java', 'kotlin', 'swift', 'flutter', 'dart', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'git', 'linux',
        'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'graphql', 'rest', 'api',
        'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
        'android', 'ios', 'react native', 'xamarin', 'django', 'flask', 'fastapi', 'spring',
        'express', 'nginx', 'jenkins', 'github actions', 'selenium', 'cypress',
        'figma', 'sketch', 'html', 'css', 'sass', 'redux', 'webpack', 'vite',
        'blockchain', 'solidity', 'unity', 'opengl', 'embedded', 'rtos', 'mqtt',
        'kafka', 'rabbitmq', 'elasticsearch', 'firebase', 'supabase',
    ];
    return knownSkills.filter((skill) => text.includes(skill));
}

/**
 * Scores a job for a specific student context.
 */
export function scoreJob(job: JobContext, student: StudentContext): MatchResult {
    // ─── 1. Career Match (40%) ────────────────────────────────────────
    let careerScore = 0;
    const matchReasons: string[] = [];

    // Check if job is already linked to any of the student's recommended careers
    const directCareerMatch = job.careerIdentifiers.some((ci) =>
        student.recommendedCareers.some((rc) => rc.toLowerCase() === ci.toLowerCase()),
    );

    if (directCareerMatch) {
        careerScore = 100;
        const matchedCareer = student.recommendedCareers.find((rc) =>
            job.careerIdentifiers.some((ci) => ci.toLowerCase() === rc.toLowerCase()),
        );
        if (matchedCareer) matchReasons.push(`Matches your recommended career: ${matchedCareer}`);
    } else {
        // Soft match: infer from job title
        const inferred = inferMatchingCareers(job.title, student.recommendedCareers);
        if (inferred.length > 0) {
            careerScore = 60;
            matchReasons.push(`Related to your recommended career: ${inferred[0]}`);
        } else {
            careerScore = 10;
        }
    }

    // ─── 2. Skill Match (40%) ─────────────────────────────────────────
    const jobKeywords = extractKeywordsFromJobText(job.title, job.snippet);
    const studentSkillsLower = student.skillNames.map((s) => s.toLowerCase());

    const matchedSkills: string[] = [];
    const gapSkills: string[] = [];

    for (const kw of jobKeywords) {
        if (studentSkillsLower.some((s) => s === kw || s.includes(kw) || kw.includes(s))) {
            matchedSkills.push(kw);
        } else {
            gapSkills.push(kw);
        }
    }

    let skillScore = 0;
    if (jobKeywords.length === 0) {
        // No skill info in job → neutral contribution
        skillScore = 50;
    } else {
        skillScore = Math.round((matchedSkills.length / jobKeywords.length) * 100);
    }

    matchedSkills.forEach((s) => matchReasons.push(`${capitalise(s)} matches your skills`));

    // ─── 3. Education / Experience (10%) ─────────────────────────────
    // Use neutral contribution — avoid penalising students for incomplete info
    const eduScore = 50;

    // ─── 4. Location Match (10%) ──────────────────────────────────────
    let locationScore = 50; // Neutral if no data
    const jobLocationLower = (job.location ?? '').toLowerCase();
    const studentLocation = (student.preferredLocation ?? '').toLowerCase();

    if (student.workMode === 'REMOTE' && jobLocationLower.includes('remote')) {
        locationScore = 100;
        matchReasons.push('Remote matches your work preference');
    } else if (studentLocation && jobLocationLower.includes(studentLocation)) {
        locationScore = 100;
        matchReasons.push(`${capitalise(studentLocation)} matches your location preference`);
    } else if (student.workMode === 'HYBRID' && jobLocationLower.includes('hybrid')) {
        locationScore = 80;
        matchReasons.push('Hybrid matches your work preference');
    }

    // ─── Final Weighted Score ──────────────────────────────────────────
    const matchScore = Math.round(
        careerScore * 0.40 +
        skillScore * 0.40 +
        eduScore * 0.10 +
        locationScore * 0.10,
    );

    return {
        matchScore: Math.max(0, Math.min(100, matchScore)),
        matchedSkills: [...new Set(matchedSkills)].slice(0, 8),
        gapSkills: [...new Set(gapSkills)].slice(0, 6),
        matchReasons,
    };
}

function capitalise(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
