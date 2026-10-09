/**
 * Career-to-Job Query and Taxonomy Mapping Service.
 *
 * Connects CareerNova recommended careers to Jooble search queries and job aliases.
 *
 * Concept:
 *   CareerNova recommended career
 *   ↓
 *   career-to-job query mapping
 *   ↓
 *   cached Jooble jobs
 *   ↓
 *   job-career relationship (JobCareerMatch)
 *   ↓
 *   personalized job match score (weighted by recommendation rank)
 *
 * IMPORTANT:
 * - Does NOT modify BYSER recommendation logic or weights.
 * - Centralizes aliases in a controlled, maintainable structure.
 * - Prevents generating hundreds of speculative aliases.
 */

import type { RankedCareer } from '../types/jobs.types';

export interface CareerMappingDefinition {
    canonicalName: string;
    primaryQuery: string;
    searchAliases: string[];
}

export const CAREER_JOB_TAXONOMY: Record<string, CareerMappingDefinition> = {
    // Software Engineering
    'Software Developer': {
        canonicalName: 'Software Developer',
        primaryQuery: 'Software Developer',
        searchAliases: ['Software Developer', 'Software Engineer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer'],
    },
    'Software Engineer': {
        canonicalName: 'Software Engineer',
        primaryQuery: 'Software Engineer',
        searchAliases: ['Software Engineer', 'Software Developer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer'],
    },
    'Full Stack Developer': {
        canonicalName: 'Full Stack Developer',
        primaryQuery: 'Full Stack Developer',
        searchAliases: ['Full Stack Developer', 'Full Stack Engineer', 'Fullstack Developer', 'MERN Developer', 'Web Developer'],
    },
    'Backend Developer': {
        canonicalName: 'Backend Developer',
        primaryQuery: 'Backend Developer',
        searchAliases: ['Backend Developer', 'Backend Engineer', 'Node.js Developer', 'Java Developer', 'Python Developer'],
    },
    'Frontend Developer': {
        canonicalName: 'Frontend Developer',
        primaryQuery: 'Frontend Developer',
        searchAliases: ['Frontend Developer', 'Frontend Engineer', 'React Developer', 'UI Developer', 'Web Developer'],
    },
    'Mobile Developer': {
        canonicalName: 'Mobile Developer',
        primaryQuery: 'Mobile Developer',
        searchAliases: ['Mobile Developer', 'Android Developer', 'iOS Developer', 'Flutter Developer', 'React Native Developer'],
    },

    // Data & AI
    'Data Analyst': {
        canonicalName: 'Data Analyst',
        primaryQuery: 'Data Analyst',
        searchAliases: ['Data Analyst', 'Business Analyst', 'Junior Data Analyst', 'BI Analyst', 'Analytics Engineer'],
    },
    'Data Scientist': {
        canonicalName: 'Data Scientist',
        primaryQuery: 'Data Scientist',
        searchAliases: ['Data Scientist', 'Machine Learning Scientist', 'AI Scientist', 'Applied Scientist'],
    },
    'Data Engineer': {
        canonicalName: 'Data Engineer',
        primaryQuery: 'Data Engineer',
        searchAliases: ['Data Engineer', 'Big Data Engineer', 'ETL Developer', 'Data Platform Engineer'],
    },
    'AI Engineer': {
        canonicalName: 'AI Engineer',
        primaryQuery: 'AI Engineer',
        searchAliases: ['AI Engineer', 'Artificial Intelligence Engineer', 'Machine Learning Engineer', 'Deep Learning Engineer'],
    },
    'Machine Learning Engineer': {
        canonicalName: 'Machine Learning Engineer',
        primaryQuery: 'Machine Learning Engineer',
        searchAliases: ['Machine Learning Engineer', 'ML Engineer', 'MLOps Engineer', 'Applied ML Engineer'],
    },

    // QA & Testing
    'QA Engineer': {
        canonicalName: 'QA Engineer',
        primaryQuery: 'QA Engineer',
        searchAliases: ['QA Engineer', 'Software Tester', 'Automation Tester', 'SDET', 'Quality Assurance Engineer'],
    },

    // Cloud & DevOps
    'Cloud Engineer': {
        canonicalName: 'Cloud Engineer',
        primaryQuery: 'Cloud Engineer',
        searchAliases: ['Cloud Engineer', 'AWS Engineer', 'Azure Engineer', 'GCP Engineer', 'Cloud Architect'],
    },
    'DevOps Engineer': {
        canonicalName: 'DevOps Engineer',
        primaryQuery: 'DevOps Engineer',
        searchAliases: ['DevOps Engineer', 'Site Reliability Engineer', 'SRE', 'Platform Engineer', 'Build Engineer'],
    },
    'Site Reliability Engineer': {
        canonicalName: 'Site Reliability Engineer',
        primaryQuery: 'Site Reliability Engineer',
        searchAliases: ['Site Reliability Engineer', 'SRE', 'DevOps Engineer', 'Infrastructure Engineer'],
    },

    // Security
    'Cyber Security Analyst': {
        canonicalName: 'Cyber Security Analyst',
        primaryQuery: 'Cyber Security Analyst',
        searchAliases: ['Cyber Security Analyst', 'Cybersecurity Analyst', 'Security Analyst', 'Information Security Analyst'],
    },
    'Cybersecurity Engineer': {
        canonicalName: 'Cybersecurity Engineer',
        primaryQuery: 'Cybersecurity Engineer',
        searchAliases: ['Cybersecurity Engineer', 'Security Engineer', 'Security Analyst', 'Cyber Security Analyst'],
    },
    'SOC Analyst': {
        canonicalName: 'SOC Analyst',
        primaryQuery: 'SOC Analyst',
        searchAliases: ['SOC Analyst', 'Security Operations Center Analyst', 'SIEM Analyst', 'Tier 1 SOC Analyst'],
    },
    'Penetration Tester': {
        canonicalName: 'Penetration Tester',
        primaryQuery: 'Penetration Tester',
        searchAliases: ['Penetration Tester', 'Ethical Hacker', 'Pen Tester', 'Security Assessment Specialist'],
    },
    'Security Engineer': {
        canonicalName: 'Security Engineer',
        primaryQuery: 'Security Engineer',
        searchAliases: ['Security Engineer', 'Application Security Engineer', 'AppSec Engineer', 'Cloud Security Engineer'],
    },

    // Specialized Engineering
    'Blockchain Developer': {
        canonicalName: 'Blockchain Developer',
        primaryQuery: 'Blockchain Developer',
        searchAliases: ['Blockchain Developer', 'Web3 Developer', 'Smart Contract Developer', 'Solidity Developer'],
    },
    'IoT Engineer': {
        canonicalName: 'IoT Engineer',
        primaryQuery: 'IoT Engineer',
        searchAliases: ['IoT Engineer', 'Internet of Things Engineer', 'Embedded IoT Developer'],
    },
    'Embedded Engineer': {
        canonicalName: 'Embedded Engineer',
        primaryQuery: 'Embedded Engineer',
        searchAliases: ['Embedded Engineer', 'Embedded Software Engineer', 'Firmware Engineer', 'Microcontroller Developer'],
    },
    'Embedded Systems Engineer': {
        canonicalName: 'Embedded Systems Engineer',
        primaryQuery: 'Embedded Systems Engineer',
        searchAliases: ['Embedded Systems Engineer', 'Embedded Engineer', 'Firmware Engineer', 'Embedded Developer'],
    },

    // Product, Design & Research
    'Product Manager': {
        canonicalName: 'Product Manager',
        primaryQuery: 'Product Manager',
        searchAliases: ['Product Manager', 'Technical Product Manager', 'Associate Product Manager', 'Product Owner'],
    },
    'UI/UX Designer': {
        canonicalName: 'UI/UX Designer',
        primaryQuery: 'UI/UX Designer',
        searchAliases: ['UI/UX Designer', 'Product Designer', 'UX Designer', 'UI Designer', 'Interaction Designer'],
    },
    'Research Engineer': {
        canonicalName: 'Research Engineer',
        primaryQuery: 'Research Engineer',
        searchAliases: ['Research Engineer', 'Research Scientist', 'CS Researcher', 'Algorithm Engineer'],
    },
};

/**
 * Gets search queries for a given career name.
 * Uses the primary search query first, followed by key aliases up to maxQueries.
 */
export function getSearchQueriesForCareer(careerName: string, maxQueries = 1): string[] {
    const entry = CAREER_JOB_TAXONOMY[careerName];
    if (entry) {
        return entry.searchAliases.slice(0, maxQueries);
    }
    return [careerName];
}

/**
 * Gets all controlled aliases for a career name.
 */
export function getAliasesForCareer(careerName: string): string[] {
    return CAREER_JOB_TAXONOMY[careerName]?.searchAliases ?? [careerName];
}

/**
 * Given a job title, returns which careers it matches based on controlled aliases.
 */
export function inferMatchingCareers(jobTitle: string, candidateCareers: string[]): string[] {
    const lowerTitle = jobTitle.toLowerCase();

    return candidateCareers.filter((career) => {
        const aliases = getAliasesForCareer(career);
        return aliases.some((alias) => {
            const lowerAlias = alias.toLowerCase();
            return (
                lowerTitle.includes(lowerAlias) ||
                (lowerAlias.length > 5 && lowerTitle.replace(/[^a-z0-9]/g, '').includes(lowerAlias.replace(/[^a-z0-9]/g, '')))
            );
        });
    });
}

export interface CareerAffinityResult {
    affinityScore: number; // 0 to 100
    matchedCareer?: string;
    matchedAlias?: string;
    rank?: number;
    matchReason?: string;
}

/**
 * Calculates career affinity score based on the student's ranked recommendations.
 * Jobs matching Rank 1 career receive the highest affinity weight.
 */
export function calculateCareerAffinity(
    jobTitle: string,
    careerIdentifiers: string[],
    rankedCareers?: RankedCareer[],
): CareerAffinityResult {
    if (!rankedCareers || rankedCareers.length === 0) {
        return { affinityScore: 30 };
    }

    const titleLower = jobTitle.toLowerCase();

    // 1. Check direct link via JobCareerMatch against student's ranked careers
    for (const rc of rankedCareers) {
        const directMatch = careerIdentifiers.some(
            (ci) => ci.toLowerCase() === rc.name.toLowerCase(),
        );

        if (directMatch) {
            // Rank 1 -> 100, Rank 2 -> 92, Rank 3 -> 84, Rank 4 -> 76, Rank 5 -> 70
            const rankBonus = Math.max(70, 100 - (rc.rank - 1) * 8);
            return {
                affinityScore: rankBonus,
                matchedCareer: rc.name,
                rank: rc.rank,
                matchReason: `Matches your #${rc.rank} recommended career: ${rc.name}`,
            };
        }
    }

    // 2. Check alias match against student's ranked careers
    for (const rc of rankedCareers) {
        const aliases = getAliasesForCareer(rc.name);

        for (const alias of aliases) {
            const aliasLower = alias.toLowerCase();
            if (titleLower.includes(aliasLower)) {
                // Rank 1 alias -> 88, Rank 2 alias -> 80, Rank 3 alias -> 74
                const rankBonus = Math.max(60, 88 - (rc.rank - 1) * 7);
                return {
                    affinityScore: rankBonus,
                    matchedCareer: rc.name,
                    matchedAlias: alias,
                    rank: rc.rank,
                    matchReason: `Role "${alias}" aligns with your #${rc.rank} career: ${rc.name}`,
                };
            }
        }
    }

    // 3. Keyword word-level overlap
    for (const rc of rankedCareers) {
        const words = rc.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3 && w !== 'developer' && w !== 'engineer');
        const hasKeywordMatch = words.some((w) => titleLower.includes(w));
        if (hasKeywordMatch) {
            return {
                affinityScore: 45,
                matchedCareer: rc.name,
                rank: rc.rank,
                matchReason: `Related to your #${rc.rank} career: ${rc.name}`,
            };
        }
    }

    return {
        affinityScore: 15,
        matchReason: 'General job match',
    };
}
