export function isJobRelevantForCareer(jobTitle: string, jobSnippet: string | null, career: string): boolean {
    const title = jobTitle.toLowerCase();
    const snippet = (jobSnippet || '').toLowerCase();
    const c = career.toLowerCase();

    // 1. Strict Seniority Exclusions
    const seniorKeywords = [
        'director', 'vice president', 'vp ', 'head of', 'chief', 
        'principal', 'staff', 'senior manager', 'engineering manager', 
        'lead', 'vp,'
    ];
    for (const kw of seniorKeywords) {
        if (title.includes(kw) || title.startsWith('vp') || title.endsWith(' lead') || title.includes('manager')) {
            return false;
        }
    }

    // 2. Career Aliases Map
    const aliases = [c];
    if (c.includes('full stack')) {
        aliases.push('fullstack', 'full-stack', 'full stack engineer', 'full stack web developer', 'full stack software developer');
    }
    if (c.includes('frontend') || c.includes('front end') || c.includes('front-end')) {
        aliases.push('frontend', 'front-end', 'front end', 'ui developer', 'react developer', 'angular developer', 'vue developer');
    }
    if (c.includes('backend') || c.includes('back end') || c.includes('back-end')) {
        aliases.push('backend', 'back-end', 'back end', 'api developer', 'server-side', 'node.js developer', 'java developer');
    }
    if (c.includes('software engineer') || c.includes('software development')) {
        aliases.push('sde', 'programmer', 'software development engineer');
    }
    if (c.includes('data sci')) {
        aliases.push('machine learning', 'ml engineer', 'ai engineer', 'data analyst');
    }
    
    // Check direct title match
    let titleMatches = false;
    for (const alias of aliases) {
        if (title.includes(alias)) {
            titleMatches = true;
            break;
        }
    }
    if (titleMatches) return true;

    // 3. Generic Software Roles + Snippet Evidence
    const genericTitles = ['software engineer', 'developer', 'engineer', 'programmer', 'member of technical staff'];
    let isGeneric = false;
    for (const gt of genericTitles) {
        // If it's a generic title BUT it's something highly specific like "AI/ML Engineer", we shouldn't treat it as generic Full Stack.
        // We ensure it is just "Software Engineer" or "Software Developer" without other specialized words
        if (title.includes(gt)) {
            const nonGenericSpecializations = ['ai', 'ml', 'machine learning', 'data', 'security', 'cyber', 'soc', 'ios', 'android', 'mobile', 'embedded', 'hardware', 'devops', 'cloud', 'salesforce', 'commerce', 'qa', 'test'];
            let hasSpecialization = false;
            for (const spec of nonGenericSpecializations) {
                if (title.includes(spec) && !c.includes(spec)) {
                    hasSpecialization = true;
                    break;
                }
            }
            if (!hasSpecialization) {
                isGeneric = true;
                break;
            }
        }
    }

    if (isGeneric) {
        // Require strong evidence in snippet
        if (c.includes('full stack')) {
            if ((snippet.includes('frontend') || snippet.includes('ui') || snippet.includes('react') || snippet.includes('angular') || snippet.includes('vue')) &&
                (snippet.includes('backend') || snippet.includes('api') || snippet.includes('server') || snippet.includes('database') || snippet.includes('sql') || snippet.includes('node'))) {
                return true;
            }
        } else if (c.includes('frontend')) {
            if (snippet.includes('frontend') || snippet.includes('ui') || snippet.includes('react') || snippet.includes('javascript') || snippet.includes('css')) return true;
        } else if (c.includes('backend')) {
            if (snippet.includes('backend') || snippet.includes('api') || snippet.includes('server') || snippet.includes('database')) return true;
        } else {
            if (snippet.includes(c)) return true;
        }
    }

    return false;
}
