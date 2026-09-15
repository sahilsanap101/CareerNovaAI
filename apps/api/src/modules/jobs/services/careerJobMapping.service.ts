/**
 * Career-to-Jooble search query mapping.
 *
 * Maps a canonical CareerNova careerPath.name to an ordered list of search
 * queries. The queries are ranked by relevance — the first entry is always
 * the canonical title itself. Only the top N queries (configurable via
 * JOOBLE_MAX_QUERIES_PER_SYNC) are actually sent to Jooble per sync.
 *
 * IMPORTANT: Do NOT add queries speculatively. Each maps 1-to-1 to a real
 * Jooble API call and the account has a 500-request lifetime limit.
 */

const careerSearchMap: Record<string, string[]> = {
    // Software Engineering
    'Software Engineer': ['Software Engineer', 'Software Developer', 'Application Developer'],
    'Backend Developer': ['Backend Developer', 'Backend Engineer', 'Node.js Developer'],
    'Frontend Developer': ['Frontend Developer', 'Frontend Engineer', 'React Developer'],
    'Full Stack Developer': ['Full Stack Developer', 'Full Stack Engineer', 'MERN Developer'],
    'Mobile Developer': ['Mobile Developer', 'Android Developer', 'iOS Developer', 'Flutter Developer', 'React Native Developer'],

    // Data & AI
    'Data Scientist': ['Data Scientist', 'ML Engineer', 'Data Analyst'],
    'AI Engineer': ['AI Engineer', 'Artificial Intelligence Engineer', 'ML Engineer'],
    'Machine Learning Engineer': ['Machine Learning Engineer', 'ML Engineer', 'AI Engineer'],
    'Data Analyst': ['Data Analyst', 'Business Analyst', 'Data Engineer'],

    // Security & Cloud
    'Cybersecurity Engineer': ['Cybersecurity Engineer', 'Security Analyst', 'SOC Analyst'],
    'Cloud Engineer': ['Cloud Engineer', 'AWS Engineer', 'Azure Engineer', 'GCP Engineer'],
    'DevOps Engineer': ['DevOps Engineer', 'SRE', 'Platform Engineer'],

    // Specialized
    'Embedded Systems Engineer': ['Embedded Systems Engineer', 'Embedded Developer', 'Firmware Engineer'],
    'IoT Engineer': ['IoT Engineer', 'IoT Developer', 'Embedded IoT Engineer'],
    'Blockchain Developer': ['Blockchain Developer', 'Web3 Developer', 'Smart Contract Developer'],
    'AR/VR Developer': ['AR/VR Developer', 'Unity Developer', 'XR Developer'],

    // QA & Testing
    'QA Engineer': ['QA Engineer', 'Software Tester', 'Test Engineer', 'Automation Tester'],
    'Test Automation Engineer': ['Test Automation Engineer', 'SDET', 'QA Automation Engineer'],

    // Other
    'Product Manager': ['Product Manager', 'Technical Product Manager', 'Associate PM'],
    'UI/UX Designer': ['UI/UX Designer', 'Product Designer', 'UX Designer'],
    'Database Administrator': ['Database Administrator', 'DBA', 'Database Engineer'],
    'Network Engineer': ['Network Engineer', 'Network Administrator', 'Network Architect'],
};

/**
 * Gets search queries for a given career name.
 * Falls back gracefully to the career name itself if not found in the map.
 */
export function getSearchQueriesForCareer(careerName: string, maxQueries: number): string[] {
    const mapped = careerSearchMap[careerName];
    if (mapped && mapped.length > 0) {
        return mapped.slice(0, maxQueries);
    }
    // Fallback: use the career name directly (still useful for unknown careers)
    return [careerName];
}

/**
 * Given a job title, returns which careers (from the supplied list) it could
 * be relevant to. Used for back-populating JobCareerMatch when one job
 * appears relevant to multiple careers.
 */
export function inferMatchingCareers(jobTitle: string, candidateCareers: string[]): string[] {
    const lowerTitle = jobTitle.toLowerCase();
    return candidateCareers.filter((career) => {
        const queries = careerSearchMap[career] ?? [career];
        return queries.some((q) => {
            const lowerQ = q.toLowerCase();
            return (
                lowerTitle.includes(lowerQ) ||
                lowerQ.split(' ').some((word) => word.length > 3 && lowerTitle.includes(word))
            );
        });
    });
}
