/**
 * Live Jobs Match Scoring Engine
 *
 * ─── ISOLATION GUARANTEE ───────────────────────────────────────────────────
 * This service is ENTIRELY separate from BYSER (Balanced Yield-Sorted
 * Eligibility Ranker).  It does NOT import from, modify, or share weights
 * with the career recommendation engine, roadmap scorer, or placement
 * readiness calculator.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Scoring weights (Live Jobs only):
 *   Career Match:          40%
 *   Skill Match:           40%
 *   Education/Experience:  10%
 *   Location Match:        10%
 *
 * Output: 0–100 integer + rich explanation object.
 *
 * Design principles:
 *   • Deterministic — same inputs always produce the same output.
 *   • No hallucination — skills are only extracted from actual job text.
 *   • Graceful degradation — missing info lowers confidence, not score quality.
 *   • Uses CareerNova skill taxonomy (SKILL_ALIASES) for canonical matching.
 */

import { SKILL_ALIASES } from '@pathforge/shared-constants';
import type { RankedCareer } from '../types/jobs.types';
import { calculateCareerAffinity } from './careerJobMapping.service';

// ─── Input Contracts ──────────────────────────────────────────────────────

export interface StudentContext {
    recommendedCareers: string[];   // e.g. ['Mobile Developer', 'QA Engineer']
    rankedCareers?: RankedCareer[]; // Ranked list from RecommendationResult
    skillNames: string[];           // Canonical names from CareerNova taxonomy
    preferredLocation?: string;     // e.g. 'Pune'
    workMode?: string;              // REMOTE | HYBRID | ONSITE
    educationLevel?: string;        // e.g. 'B.Tech', 'MCA', 'Diploma'
    experienceMonths?: number;      // 0 = fresher
}

export interface JobContext {
    title: string;
    location?: string | null;
    snippet?: string | null;
    type?: string | null;
    careerIdentifiers: string[];    // careers linked via JobCareerMatch
}

// ─── Output Contracts ─────────────────────────────────────────────────────

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface EduExperienceMatch {
    /** MATCHED = job explicitly mentions level/exp that aligns; UNAVAILABLE = not enough info */
    status: 'MATCHED' | 'UNAVAILABLE';
    detail: string;
}

export interface LocationMatch {
    status: 'MATCHED' | 'PARTIAL' | 'MISMATCH' | 'UNAVAILABLE';
    detail: string;
}

export interface MatchResult {
    /** 0–100 weighted score */
    matchScore: number;
    /** Confidence in the score based on available job information */
    confidence: ConfidenceLevel;
    /** Primary recommended career this job aligns with, or null */
    recommendedCareer: string | null;
    /** Canonical skill names the student already has that appear in the job */
    matchedSkills: string[];
    /** Skills mentioned in the job that the student does not have */
    skillGaps: string[];
    /** Education / experience match result */
    eduExperienceMatch: EduExperienceMatch;
    /** Location match result */
    locationMatch: LocationMatch;
    /** Single human-readable explanation sentence */
    explanation: string;
    /** Granular reasons (for tooltip / detail panel) */
    matchReasons: string[];
}

// ─── CareerNova Skill Taxonomy ────────────────────────────────────────────

/**
 * Build a flat lookup set from SKILL_ALIASES:
 *   canonical names + all their aliases → lowercase → Set<string>
 *
 * This is built once at module load (deterministic, no I/O).
 */
const TAXONOMY_CANONICAL_NAMES: string[] = Object.keys(SKILL_ALIASES);

/**
 * Returns a lowercase normalised form of every canonical skill and its aliases.
 * Used for O(n) scan of job text.
 */
const TAXONOMY_ENTRIES: Array<{ canonical: string; tokens: string[] }> =
    TAXONOMY_CANONICAL_NAMES.map((canonical) => ({
        canonical,
        tokens: [
            canonical.toLowerCase(),
            ...(SKILL_ALIASES[canonical] ?? []).map((a) => a.toLowerCase()),
        ],
    }));

/**
 * Additional tech tokens NOT in SKILL_ALIASES that frequently appear in
 * Jooble job text and are safe to report as skill gaps.
 * These are never fabricated — they must literally appear in the job text.
 */
const SUPPLEMENTARY_SKILL_TOKENS: string[] = [
    'flutter', 'dart', 'swift', 'kotlin', 'android', 'ios',
    'react native', 'xamarin', 'solidity', 'web3', 'unity',
    'opengl', 'embedded', 'rtos', 'mqtt', 'kafka', 'rabbitmq',
    'elasticsearch', 'firebase', 'supabase', 'terraform', 'ansible',
    'fastapi', 'graphql', 'selenium', 'cypress', 'jest',
    'figma', 'sketch', 'sass', 'redux', 'webpack', 'vite',
    'spring boot', 'microservices', 'rest api', 'restful',
    'ci/cd', 'jenkins', 'nginx', 'linux', 'bash', 'shell scripting',
    'scikit-learn', 'sklearn', 'pandas', 'numpy', 'matplotlib',
    'llm', 'langchain', 'openai', 'generative ai',
];

/**
 * Extracts skills from job title + snippet using the CareerNova taxonomy
 * first, then supplementary tokens.  Only returns skills that are literally
 * present in the text — no inference, no hallucination.
 *
 * @returns Array of canonical skill names found in the text.
 */
function extractJobSkills(title: string, snippet: string | null | undefined): string[] {
    const text = `${title} ${snippet ?? ''}`.toLowerCase();

    // Phase 1: taxonomy-aware extraction (canonical + aliases)
    const found = new Set<string>();

    for (const entry of TAXONOMY_ENTRIES) {
        for (const token of entry.tokens) {
            // Word-boundary-aware check: avoid "go" matching "Django", etc.
            if (containsToken(text, token)) {
                found.add(entry.canonical);
                break;
            }
        }
    }

    // Phase 2: supplementary tokens not in taxonomy
    for (const token of SUPPLEMENTARY_SKILL_TOKENS) {
        if (containsToken(text, token) && !found.has(capitalise(token))) {
            found.add(capitalise(token));
        }
    }

    return [...found];
}

/**
 * Word-boundary-aware token inclusion check.
 * Prevents "go" matching "django" or "c" matching "cache".
 */
function containsToken(haystack: string, needle: string): boolean {
    if (needle.length <= 2) {
        // Very short tokens: require word boundaries
        const re = new RegExp(`(?<![a-z0-9])${escapeRegex(needle)}(?![a-z0-9])`, 'i');
        return re.test(haystack);
    }
    return haystack.includes(needle);
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Education / Experience Heuristics ───────────────────────────────────

/**
 * Looks for explicit experience / education signals in job text.
 * Does NOT fabricate requirements.  Returns UNAVAILABLE if text is silent.
 */
function scoreEduExperience(
    snippet: string | null | undefined,
    student: StudentContext,
): { score: number; match: EduExperienceMatch } {
    const text = (snippet ?? '').toLowerCase();

    const fresherSignals = [
        'fresher', 'fresh graduate', '0 year', '0-1 year', 'no experience',
        'entry level', 'entry-level', 'junior', 'trainee', 'intern',
        'graduate', 'recent grad',
    ];
    const experiencedSignals = [
        '2+ year', '3+ year', '4+ year', '5+ year', '2 year', '3 year',
        '4 year', '5 year', 'senior', 'lead', 'principal', 'architect',
    ];

    const isFresher = student.experienceMonths != null && student.experienceMonths < 6;
    const hasFresherSignal = fresherSignals.some((s) => text.includes(s));
    const hasExperiencedSignal = experiencedSignals.some((s) => text.includes(s));

    if (!hasFresherSignal && !hasExperiencedSignal) {
        // Job text doesn't mention experience requirements — neutral, no penalty
        return {
            score: 50,
            match: {
                status: 'UNAVAILABLE',
                detail: 'Job does not specify experience or education requirements.',
            },
        };
    }

    if (hasFresherSignal && (isFresher || student.experienceMonths == null)) {
        return {
            score: 90,
            match: {
                status: 'MATCHED',
                detail: 'This role is open to freshers / entry-level candidates.',
            },
        };
    }

    if (hasExperiencedSignal && isFresher) {
        return {
            score: 25,
            match: {
                status: 'UNAVAILABLE',
                detail: 'Job appears to require prior experience; your profile shows fresher-level experience.',
            },
        };
    }

    return {
        score: 60,
        match: {
            status: 'MATCHED',
            detail: 'Experience level is compatible with your profile.',
        },
    };
}

// ─── Location Scoring ─────────────────────────────────────────────────────

function scoreLocation(
    jobLocation: string | null | undefined,
    student: StudentContext,
): { score: number; match: LocationMatch } {
    const jobLoc = (jobLocation ?? '').toLowerCase().trim();
    const studentLoc = (student.preferredLocation ?? '').toLowerCase().trim();
    const mode = (student.workMode ?? '').toUpperCase();

    if (!jobLoc) {
        return {
            score: 50,
            match: { status: 'UNAVAILABLE', detail: 'Job location not specified.' },
        };
    }

    // Remote preference
    if (mode === 'REMOTE') {
        if (jobLoc.includes('remote') || jobLoc.includes('work from home') || jobLoc.includes('wfh')) {
            return {
                score: 100,
                match: { status: 'MATCHED', detail: 'Remote role matches your remote work preference.' },
            };
        }
        if (jobLoc.includes('hybrid')) {
            return {
                score: 65,
                match: { status: 'PARTIAL', detail: 'Hybrid role — partially matches your remote preference.' },
            };
        }
        if (studentLoc && jobLoc.includes(studentLoc)) {
            return {
                score: 70,
                match: { status: 'PARTIAL', detail: `Role in your city (${capitalise(studentLoc)}), though requires onsite presence.` },
            };
        }
        return {
            score: 35,
            match: { status: 'MISMATCH', detail: `Onsite role in ${capitalise(jobLoc)}; you prefer remote.` },
        };
    }

    // Hybrid preference
    if (mode === 'HYBRID') {
        if (jobLoc.includes('hybrid')) {
            return {
                score: 100,
                match: { status: 'MATCHED', detail: 'Hybrid work mode matches your preference.' },
            };
        }
        if (jobLoc.includes('remote')) {
            return {
                score: 75,
                match: { status: 'PARTIAL', detail: 'Remote role — close to your hybrid preference.' },
            };
        }
    }

    // Location city match
    if (studentLoc && jobLoc.includes(studentLoc)) {
        return {
            score: 100,
            match: { status: 'MATCHED', detail: `Location matches your preferred city (${capitalise(studentLoc)}).` },
        };
    }

    // Remote / hybrid bonus for onsite-preferring students
    if (jobLoc.includes('remote') || jobLoc.includes('hybrid')) {
        return {
            score: 70,
            match: { status: 'PARTIAL', detail: 'Remote/hybrid role — flexible location.' },
        };
    }

    if (!studentLoc) {
        return {
            score: 50,
            match: { status: 'UNAVAILABLE', detail: 'No preferred location set in your profile.' },
        };
    }

    return {
        score: 30,
        match: { status: 'MISMATCH', detail: `Job is in ${capitalise(jobLoc)}; you prefer ${capitalise(studentLoc)}.` },
    };
}

// ─── Explanation Builder ──────────────────────────────────────────────────

function buildExplanation(params: {
    matchScore: number;
    recommendedCareer: string | null;
    matchedSkills: string[];
    skillGaps: string[];
    careerMatchReason: string | undefined;
    confidence: ConfidenceLevel;
}): string {
    const { matchScore, recommendedCareer, matchedSkills, skillGaps, confidence } = params;

    const qualifier =
        matchScore >= 75 ? 'Strong match' :
        matchScore >= 55 ? 'Good match' :
        matchScore >= 35 ? 'Partial match' :
        'Weak match';

    const careerPart = recommendedCareer
        ? ` for ${recommendedCareer} because this role aligns with your recommended career`
        : '';

    const skillPart =
        matchedSkills.length > 0
            ? ` and several of your existing skills. ${matchedSkills.slice(0, 3).join(', ')} ${matchedSkills.length === 1 ? 'is a' : 'are'} relevant strength${matchedSkills.length === 1 ? '' : 's'}`
            : careerPart
            ? ''
            : ', though few of your listed skills were found in this job posting';

    const gapPart =
        skillGaps.length > 0
            ? `, while ${skillGaps.slice(0, 2).join(' and ')} appear${skillGaps.length === 1 ? 's' : ''} to be a gap`
            : '';

    const confidencePart =
        confidence === 'LOW'
            ? '. Limited job information reduced scoring confidence.'
            : confidence === 'MEDIUM'
            ? '.'
            : '.';

    return `${qualifier}${careerPart}${skillPart}${gapPart}${confidencePart}`;
}

// ─── Confidence Estimator ─────────────────────────────────────────────────

function estimateConfidence(
    jobSkillsFound: number,
    snippetLength: number,
    hasCareerMatch: boolean,
    hasLocation: boolean,
): ConfidenceLevel {
    let score = 0;
    if (jobSkillsFound >= 3) score += 3;
    else if (jobSkillsFound >= 1) score += 1;
    if (snippetLength > 80) score += 2;
    if (hasCareerMatch) score += 2;
    if (hasLocation) score += 1;

    if (score >= 6) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    return 'LOW';
}

// ─── Main Scoring Function ────────────────────────────────────────────────

/**
 * Scores a single job against a student's profile.
 *
 * Weights:
 *   Career Match:         40%
 *   Skill Match:          40%
 *   Education/Experience: 10%
 *   Location:             10%
 */
export function scoreJob(job: JobContext, student: StudentContext): MatchResult {
    const matchReasons: string[] = [];

    // ─── 1. Career Match (40%) ──────────────────────────────────────────
    const ranked =
        student.rankedCareers && student.rankedCareers.length > 0
            ? student.rankedCareers
            : student.recommendedCareers.map((name, i) => ({ name, rank: i + 1 }));

    const affinity = calculateCareerAffinity(job.title, job.careerIdentifiers, ranked);
    const careerScore = affinity.affinityScore;                   // 0–100
    const recommendedCareer = affinity.matchedCareer ?? null;

    if (affinity.matchReason) {
        matchReasons.push(affinity.matchReason);
    }

    // ─── 2. Skill Match (40%) ───────────────────────────────────────────
    const jobSkills = extractJobSkills(job.title, job.snippet);
    const studentSkillsLower = new Set(student.skillNames.map((s) => s.toLowerCase()));

    const matchedSkills: string[] = [];
    const skillGaps: string[] = [];

    for (const jobSkill of jobSkills) {
        const jobSkillLower = jobSkill.toLowerCase();
        // Match if student has this exact canonical, or if it's a substring alias
        const studentHas = studentSkillsLower.has(jobSkillLower)
            || [...studentSkillsLower].some(
                (s) =>
                    s === jobSkillLower ||
                    s.includes(jobSkillLower) ||
                    jobSkillLower.includes(s),
            );

        if (studentHas) {
            matchedSkills.push(jobSkill);
        } else {
            skillGaps.push(jobSkill);
        }
    }

    let skillScore: number;
    if (jobSkills.length === 0) {
        // No skill signals in job text → neutral (50), not 0 or 100
        skillScore = 50;
    } else {
        skillScore = Math.round((matchedSkills.length / jobSkills.length) * 100);
    }

    matchedSkills.slice(0, 4).forEach((s) => matchReasons.push(`${s} matches your skills`));
    if (skillGaps.length > 0) {
        matchReasons.push(`Skill gaps: ${skillGaps.slice(0, 3).join(', ')}`);
    }

    // ─── 3. Education / Experience (10%) ────────────────────────────────
    const { score: eduScore, match: eduExperienceMatch } = scoreEduExperience(job.snippet, student);

    // ─── 4. Location Match (10%) ─────────────────────────────────────────
    const { score: locationScore, match: locationMatch } = scoreLocation(job.location, student);

    if (locationMatch.status !== 'UNAVAILABLE') {
        matchReasons.push(locationMatch.detail);
    }

    // ─── Weighted Final Score ────────────────────────────────────────────
    const rawScore =
        careerScore  * 0.40 +
        skillScore   * 0.40 +
        eduScore     * 0.10 +
        locationScore * 0.10;

    const matchScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    // ─── Confidence ───────────────────────────────────────────────────────
    const confidence = estimateConfidence(
        jobSkills.length,
        (job.snippet ?? '').length,
        recommendedCareer !== null,
        !!job.location,
    );

    // ─── Explanation ──────────────────────────────────────────────────────
    const explanation = buildExplanation({
        matchScore,
        recommendedCareer,
        matchedSkills,
        skillGaps,
        careerMatchReason: affinity.matchReason,
        confidence,
    });

    return {
        matchScore,
        confidence,
        recommendedCareer,
        matchedSkills: [...new Set(matchedSkills)].slice(0, 8),
        skillGaps:     [...new Set(skillGaps)].slice(0, 8),
        eduExperienceMatch,
        locationMatch,
        explanation,
        matchReasons,
    };
}

// ─── Utility ─────────────────────────────────────────────────────────────

function capitalise(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
}
