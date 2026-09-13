export const SKILL_ALIASES: Record<string, string[]> = {
    // Programming
    'C': ['c language'],
    'C++': ['cpp', 'c plus plus'],
    'Java': ['java 8', 'core java'],
    'Python': ['python 3', 'py', 'python3'],
    'JavaScript': ['js', 'javascript', 'vanilla js', 'ecmascript', 'es6'],
    'TypeScript': ['ts', 'typescript'],
    'Go': ['golang', 'go language'],
    'Rust': ['rustlang'],

    // Frontend
    'HTML': ['html5'],
    'CSS': ['css3', 'cascading style sheets'],
    'React': ['reactjs', 'react.js'],
    'Angular': ['angularjs', 'angular.js', 'angular 2+'],
    'Vue': ['vuejs', 'vue.js'],

    // Backend
    'Node.js': ['nodejs', 'node', 'node js'],
    'Express': ['expressjs', 'express.js'],
    'Spring Boot': ['springboot', 'spring'],
    'Django': ['django framework'],

    // Database
    'MySQL': ['my sql'],
    'PostgreSQL': ['postgres', 'postgre sql'],
    'MongoDB': ['mongo', 'mongo db'],
    'Redis': [],

    // Cloud & DevOps
    'AWS': ['amazon web services'],
    'Azure': ['microsoft azure'],
    'GCP': ['google cloud platform', 'google cloud'],
    'Docker': ['docker containers'],
    'Kubernetes': ['k8s'],
    'GitHub Actions': ['github actions', 'gh actions'],

    // Cyber Security
    'Linux': ['linux os', 'ubuntu', 'kali linux'],
    'Networking': ['computer networks', 'network fundamentals'],
    'Burp Suite': ['burpsuite', 'burp'],
    'Wireshark': [],
    'Metasploit': [],

    // AI & Data
    'Machine Learning': ['ml'],
    'TensorFlow': ['tf'],
    'PyTorch': ['pytorch'],
    'Pandas': ['pandas library'],
    'NumPy': ['numpy array'],
    'Scikit-learn': ['sklearn'],
    'Matplotlib': ['matplotlib library'],
    'Deep Learning': ['dl'],
    'NLP': ['natural language processing'],
    'Transformers': ['hf transformers'],
    'LLMs': ['large language models'],
    'Generative AI': ['gen ai'],

    // Backend Additions
    'FastAPI': ['fast api'],
    'Flask': ['flask framework'],
    'REST APIs': ['restful api', 'rest api'],
    'GraphQL': ['graph ql'],

    // Web Extensions
    'Next.js': ['nextjs', 'next js'],
    'Tailwind CSS': ['tailwindcss', 'tailwind'],

    // DevOps Extensions
    'GitHub': ['git hub'],
    'Git': ['git version control'],

    // Others matching dependencies
    'SQL': ['sql query', 'structured query language']
};

/**
 * Normalizes a user-input skill name directly to its canonical format used in CareerPath data.
 * @param input The raw skill string to normalize (e.g. "JS", "NodeJS", "React.js")
 * @returns The canonical canonical string (e.g. "JavaScript", "Node.js", "React")
 */
export function normalizeSkillName(input: string): string {
    if (!input) return '';
    const cleaned = input.trim().toLowerCase();

    // First, check if the lowercased input exactly matches a canonical key's lowercase
    for (const canonical of Object.keys(SKILL_ALIASES)) {
        if (canonical.toLowerCase() === cleaned) {
            return canonical;
        }
    }

    // Second, check the alias lists
    for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
        if (aliases.some(alias => alias.toLowerCase() === cleaned)) {
            return canonical;
        }
    }

    // Fallback: return the trimmed lowercased string if no canonical match found
    // (In the engines, they usually do `.toLowerCase()` comparison anyway, so this preserves behavior for unknown skills)
    return cleaned;
}
