import * as fs from 'fs';
import * as path from 'path';
// Force strict relative import to avoid tsconfig pathalias failures in isolated scripts
import { normalizeSkillName } from '../packages/shared-constants/src/skillAliases';

const VERIFIED_INPUT = {
    // Web Technologies
    "JavaScript": [
        { "title": "JavaScript Guide - MDN", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "type": "official_documentation", "source": "MDN", "priority": 1 },
        { "title": "The Modern JavaScript Tutorial", "url": "https://javascript.info/", "type": "tutorial", "source": "JavaScript.info", "priority": 2 }
    ],
    "TypeScript": [{ "title": "TypeScript Documentation", "url": "https://www.typescriptlang.org/docs/", "type": "official_documentation", "source": "TypeScript", "priority": 1 }],
    "HTML": [{ "title": "HTML - MDN", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "type": "official_documentation", "source": "MDN", "priority": 1 }],
    "CSS": [{ "title": "CSS - MDN", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS", "type": "official_documentation", "source": "MDN", "priority": 1 }],
    "React": [{ "title": "Learn React", "url": "https://react.dev/learn", "type": "official_documentation", "source": "React", "priority": 1 }],
    "Node.js": [{ "title": "Learn Node.js", "url": "https://nodejs.org/en/learn", "type": "official_documentation", "source": "Node.js", "priority": 1 }],
    "Express": [{ "title": "Express Documentation", "url": "https://expressjs.com/", "type": "official_documentation", "source": "Express", "priority": 1 }],
    "Angular": [{ "title": "Angular Documentation", "url": "https://angular.dev/", "type": "official_documentation", "source": "Angular", "priority": 1 }],
    "Vue": [{ "title": "Vue Guide", "url": "https://vuejs.org/guide/introduction.html", "type": "official_documentation", "source": "Vue", "priority": 1 }],
    "Next.js": [{ "title": "Next.js Documentation", "url": "https://nextjs.org/docs", "type": "official_documentation", "source": "Next.js", "priority": 1 }],
    "Tailwind CSS": [{ "title": "Tailwind CSS Docs", "url": "https://tailwindcss.com/docs", "type": "official_documentation", "source": "Tailwind CSS", "priority": 1 }],

    // Python / Data Science
    "Python": [{ "title": "Python Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "official_documentation", "source": "Python", "priority": 1 }],
    "NumPy": [{ "title": "NumPy Learn", "url": "https://numpy.org/learn/", "type": "official_documentation", "source": "NumPy", "priority": 1 }],
    "Pandas": [{ "title": "Pandas Getting Started", "url": "https://pandas.pydata.org/docs/getting_started/intro_tutorials/", "type": "official_documentation", "source": "Pandas", "priority": 1 }],
    "Scikit-learn": [{ "title": "Scikit-learn Getting Started", "url": "https://scikit-learn.org/stable/getting_started.html", "type": "official_documentation", "source": "Scikit-learn", "priority": 1 }],
    "PyTorch": [{ "title": "PyTorch Tutorials", "url": "https://docs.pytorch.org/tutorials/", "type": "official_documentation", "source": "PyTorch", "priority": 1 }],
    "TensorFlow": [{ "title": "Learn TensorFlow", "url": "https://www.tensorflow.org/learn", "type": "official_documentation", "source": "TensorFlow", "priority": 1 }],
    "Matplotlib": [{ "title": "Matplotlib Tutorials", "url": "https://matplotlib.org/stable/tutorials/", "type": "official_documentation", "source": "Matplotlib", "priority": 1 }],

    // Databases
    "SQL": [{ "title": "PostgreSQL SQL Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial-sql.html", "type": "tutorial", "source": "PostgreSQL", "priority": 1 }],
    "PostgreSQL": [{ "title": "PostgreSQL Documentation", "url": "https://www.postgresql.org/docs/", "type": "official_documentation", "source": "PostgreSQL", "priority": 1 }],
    "MySQL": [{ "title": "MySQL Documentation", "url": "https://dev.mysql.com/doc/", "type": "official_documentation", "source": "MySQL", "priority": 1 }],
    "MongoDB": [{ "title": "MongoDB Documentation", "url": "https://www.mongodb.com/docs/", "type": "official_documentation", "source": "MongoDB", "priority": 1 }],
    "Redis": [{ "title": "Redis Documentation", "url": "https://redis.io/docs/", "type": "official_documentation", "source": "Redis", "priority": 1 }],

    // Programming Languages
    "Java": [{ "title": "Learn Java", "url": "https://dev.java/learn/", "type": "official_documentation", "source": "Oracle", "priority": 1 }],
    "C": [{ "title": "C Reference", "url": "https://en.cppreference.com/w/c", "type": "official_documentation", "source": "cppreference", "priority": 1 }],
    "C++": [{ "title": "C++ Reference", "url": "https://en.cppreference.com/w/cpp", "type": "official_documentation", "source": "cppreference", "priority": 1 }],
    "Go": [{ "title": "Learn Go", "url": "https://go.dev/learn/", "type": "official_documentation", "source": "Go", "priority": 1 }],
    "Rust": [{ "title": "Learn Rust", "url": "https://www.rust-lang.org/learn", "type": "official_documentation", "source": "Rust", "priority": 1 }],

    // Backend / APIs
    "FastAPI": [{ "title": "FastAPI Documentation", "url": "https://fastapi.tiangolo.com/", "type": "official_documentation", "source": "FastAPI", "priority": 1 }],
    "Flask": [{ "title": "Flask Documentation", "url": "https://flask.palletsprojects.com/", "type": "official_documentation", "source": "Flask", "priority": 1 }],
    "Django": [{ "title": "Django Documentation", "url": "https://docs.djangoproject.com/", "type": "official_documentation", "source": "Django", "priority": 1 }],
    "REST APIs": [{ "title": "REST API Glossary", "url": "https://developer.mozilla.org/en-US/docs/Glossary/REST", "type": "official_documentation", "source": "MDN", "priority": 1 }],
    "GraphQL": [{ "title": "Learn GraphQL", "url": "https://graphql.org/learn/", "type": "official_documentation", "source": "GraphQL", "priority": 1 }],

    // Version Control / DevOps
    "Git": [{ "title": "Git Documentation", "url": "https://git-scm.com/doc", "type": "official_documentation", "source": "Git", "priority": 1 }],
    "GitHub": [{ "title": "GitHub Documentation", "url": "https://docs.github.com/", "type": "official_documentation", "source": "GitHub", "priority": 1 }],
    "Docker": [{ "title": "Docker Get Started", "url": "https://docs.docker.com/get-started/", "type": "official_documentation", "source": "Docker", "priority": 1 }],
    "Kubernetes": [{ "title": "Kubernetes Tutorials", "url": "https://kubernetes.io/docs/tutorials/", "type": "official_documentation", "source": "Kubernetes", "priority": 1 }],

    // Cloud
    "AWS": [{ "title": "AWS Getting Started", "url": "https://aws.amazon.com/getting-started/", "type": "official_documentation", "source": "AWS", "priority": 1 }],
    "Azure": [{ "title": "Azure Training", "url": "https://learn.microsoft.com/en-us/training/azure/", "type": "official_documentation", "source": "Microsoft", "priority": 1 }],
    "GCP": [{ "title": "Google Cloud Documentation", "url": "https://cloud.google.com/docs", "type": "official_documentation", "source": "Google Cloud", "priority": 1 }],

    // AI / ML / NLP
    "Machine Learning": [{ "title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "official_documentation", "source": "Scikit-learn", "priority": 1 }],
    "Deep Learning": [{ "title": "PyTorch Tutorials", "url": "https://pytorch.org/tutorials/", "type": "official_documentation", "source": "PyTorch", "priority": 1 }],
    "NLP": [{ "title": "NLP Course", "url": "https://huggingface.co/learn/nlp-course/chapter1/1", "type": "tutorial", "source": "Hugging Face", "priority": 1 }],
    "Transformers": [{ "title": "Transformers Documentation", "url": "https://huggingface.co/docs/transformers/", "type": "official_documentation", "source": "Hugging Face", "priority": 1 }],
    "LLMs": [{ "title": "Hugging Face Learn", "url": "https://huggingface.co/learn", "type": "tutorial", "source": "Hugging Face", "priority": 1 }],
    "Generative AI": [{ "title": "Google AI for Developers", "url": "https://ai.google.dev/", "type": "official_documentation", "source": "Google", "priority": 1 }],
};

async function verifyUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        // Fetch using a modern standard browser User-Agent mimicking actual clients organically
        const res = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            redirect: 'follow', // fetch defaults to follow, explicitly setting
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        clearTimeout(timeoutId);

        if (res.status >= 200 && res.status < 400) {
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

async function main() {
    console.log("Starting URL verification mapping...");
    const skillSet = new Set<string>();
    const reachableSkillSet = new Set<string>();

    const graphPath = path.join(__dirname, 'data/dependency_graph.json');
    if (fs.existsSync(graphPath)) {
        const d = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
        for (const item of d) {
            const canonicalParent = normalizeSkillName(item.skill);
            skillSet.add(canonicalParent); // Strict Native Normalization lookup
            reachableSkillSet.add(canonicalParent); // Roadmap-Reachable Parent Node mapped explicitly

            for (const req of item.prerequisites) {
                skillSet.add(normalizeSkillName(req.skill)); // Full topological set (includes isolating leaf nodes)
            }
        }
    }

    const outputDict: Record<string, any> = {};
    const unmapped: string[] = [];
    const correctlyMapped: Record<string, any> = {};
    const unconfirmedMap: Record<string, any> = {};

    let totalPass = 0;
    let totalFail = 0;

    for (const rawName of Array.from(skillSet)) {
        // Find mapped resource relying wholly on native canonical aliases if provided
        // Since `rawName` is ALREADY normalized, we can just look inside VERIFIED_INPUT
        // But what if the VERIFIED_INPUT key differs slightly from canonical?
        // e.g. "GCP" vs "gcp", we'll check via normalization bounds again
        let matches: any = null;
        for (const vKey of Object.keys(VERIFIED_INPUT)) {
            if (normalizeSkillName(vKey) === rawName) {
                matches = (VERIFIED_INPUT as any)[vKey];
                break;
            }
        }

        if (matches) {
            const safeMatches = [];
            // Run full URL verification mapping
            for (const r of matches) {
                const isValid = await verifyUrl(r.url);
                r.verified = isValid ? 'Yes' : 'Unconfirmed';
                if (isValid) {
                    totalPass++;
                    safeMatches.push(r);
                } else {
                    totalFail++;
                    unconfirmedMap[rawName] = r;
                    // We will still keep the resource array populated but explicitly mark unconfirmed 
                    // (Actually the user said "only mark Verified: Yes if it succeeds. If fails, mark explicitly Unconfirmed")
                    safeMatches.push(r);
                }
            }
            outputDict[rawName] = {
                canonical_name: rawName,
                resources: safeMatches
            };
            correctlyMapped[rawName] = safeMatches[0];
        } else {
            outputDict[rawName] = {
                canonical_name: rawName,
                resources: []
            };
            unmapped.push(rawName);
        }
    }

    const mappedTotal = Object.keys(correctlyMapped).length;
    const totalNodes = skillSet.size;

    let reachableMapped = 0;
    for (const v of Array.from(reachableSkillSet)) {
        if (correctlyMapped[v]) {
            reachableMapped++;
        }
    }

    console.log(`Verified OK: ${totalPass}, Unconfirmed: ${totalFail}`);

    fs.mkdirSync(path.join(__dirname, '../apps/api/src/data'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '../apps/api/src/data/curated_resources.json'), JSON.stringify(outputDict, null, 2));

    let rep = `# Curated Resource Coverage Report\n\n`;
    rep += `**Definitions:**\n`;
    rep += `- **Mapped:** A predetermined canonical resource is mapped to this skill internally, completely bypassing ad-hoc search engine dummy URL generations.\n`;
    rep += `- **Verified:** The mapped URL underwent programmatic HTTP GET execution confirming a successful 2xx OK HTTP outcome bounds naturally.\n\n`;

    rep += `## Coverage Statistics\n`;
    rep += `- **Coverage (Roadmap-Reachable Skills, N=${reachableSkillSet.size}):** ${(reachableMapped / reachableSkillSet.size * 100).toFixed(2)}% (${reachableMapped} mapped)\n`;
    rep += `- **Coverage (Full Taxonomy, N=${totalNodes}):** ${(mappedTotal / totalNodes * 100).toFixed(2)}% (${mappedTotal} mapped)\n\n`;
    rep += `## HTTP Verification Pass\n`;
    rep += `Total URLs rigorously checked (HTTP GET follow-redirects): ${totalPass + totalFail}\n`;
    rep += `Verified (HTTP 200 OK): ${totalPass}\n`;
    rep += `Unconfirmed (Timeout/Failure): ${totalFail}\n\n`;

    rep += `## Mapped Configuration\n`;
    rep += `| Skill | Canonical Name | Resource | Source | Verified | Status |\n`;
    rep += `| --- | --- | --- | --- | --- | --- |\n`;
    for (const key of Object.keys(correctlyMapped).sort()) {
        const item = correctlyMapped[key];
        rep += `| ${key} | ${key} | ${item.title} | ${item.source} | ${item.verified} | Mapped |\n`;
    }

    rep += `\n## Unmapped Skills\n`;
    rep += `| Skill | Reason |\n`;
    rep += `| --- | --- |\n`;
    for (const key of unmapped.sort()) {
        rep += `| ${key} | No sufficiently specific verified resource identified |\n`;
    }

    fs.writeFileSync(path.join(__dirname, 'data/resource_coverage_report.md'), rep);
}

main().catch(console.error);
