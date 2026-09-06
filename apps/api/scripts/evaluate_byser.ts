import * as path from 'path';
import * as fs from 'fs';
import { evaluateCareerPath, StudentProfileForEngine, CareerPathForEngine } from '../src/modules/recommendations/engine/byserEngine';

// --- MOCK CAREER PATHS ---
const CAREER_PATHS: CareerPathForEngine[] = [
    {
        id: 'c1', name: 'Frontend Engineer', category: 'Software Engineering', industry: 'Technology',
        averageSalary: '12 LPA', growthRate: '15%', demandLevel: 'HIGH', description: '',
        requiredSkills: [
            { importanceWeight: 10, skill: { id: 's1', name: 'React', category: 'Frontend' } },
            { importanceWeight: 8, skill: { id: 's2', name: 'TypeScript', category: 'Language' } },
            { importanceWeight: 5, skill: { id: 's3', name: 'CSS', category: 'Frontend' } }
        ]
    },
    {
        id: 'c2', name: 'Backend Engineer', category: 'Software Engineering', industry: 'Technology',
        averageSalary: '14 LPA', growthRate: '18%', demandLevel: 'HIGH', description: '',
        requiredSkills: [
            { importanceWeight: 10, skill: { id: 's4', name: 'Node.js', category: 'Backend' } },
            { importanceWeight: 9, skill: { id: 's5', name: 'PostgreSQL', category: 'Database' } },
            { importanceWeight: 7, skill: { id: 's2', name: 'TypeScript', category: 'Language' } }
        ]
    },
    {
        id: 'c3', name: 'Data Scientist', category: 'AI & Data', industry: 'Technology',
        averageSalary: '16 LPA', growthRate: '22%', demandLevel: 'EXTREME', description: '',
        requiredSkills: [
            { importanceWeight: 10, skill: { id: 's6', name: 'Python', category: 'Language' } },
            { importanceWeight: 9, skill: { id: 's7', name: 'Machine Learning', category: 'AI' } },
            { importanceWeight: 6, skill: { id: 's8', name: 'SQL', category: 'Database' } }
        ]
    },
    {
        id: 'c4', name: 'Cyber Security Analyst', category: 'Security', industry: 'Technology',
        averageSalary: '15 LPA', growthRate: '20%', demandLevel: 'VERY_HIGH', description: '',
        requiredSkills: [
            { importanceWeight: 10, skill: { id: 's9', name: 'Network Security', category: 'Security' } },
            { importanceWeight: 8, skill: { id: 's6', name: 'Python', category: 'Language' } },
            { importanceWeight: 7, skill: { id: 's10', name: 'Linux', category: 'OS' } }
        ]
    },
    {
        id: 'c5', name: 'DevOps Engineer', category: 'Cloud & DevOps', industry: 'Technology',
        averageSalary: '18 LPA', growthRate: '25%', demandLevel: 'EXTREME', description: '',
        requiredSkills: [
            { importanceWeight: 10, skill: { id: 's11', name: 'Docker', category: 'DevOps' } },
            { importanceWeight: 9, skill: { id: 's12', name: 'AWS', category: 'Cloud' } },
            { importanceWeight: 8, skill: { id: 's10', name: 'Linux', category: 'OS' } }
        ]
    }
];

const ALL_SKILLS = [
    { id: 's1', name: 'React', category: 'Frontend' },
    { id: 's2', name: 'TypeScript', category: 'Language' },
    { id: 's3', name: 'CSS', category: 'Frontend' },
    { id: 's4', name: 'Node.js', category: 'Backend' },
    { id: 's5', name: 'PostgreSQL', category: 'Database' },
    { id: 's6', name: 'Python', category: 'Language' },
    { id: 's7', name: 'Machine Learning', category: 'AI' },
    { id: 's8', name: 'SQL', category: 'Database' },
    { id: 's9', name: 'Network Security', category: 'Security' },
    { id: 's10', name: 'Linux', category: 'OS' },
    { id: 's11', name: 'Docker', category: 'DevOps' },
    { id: 's12', name: 'AWS', category: 'Cloud' }
];

// --- GENERATOR ---
function generateSyntheticProfiles(count: number): StudentProfileForEngine[] {
    const profiles: StudentProfileForEngine[] = [];
    for (let i = 0; i < count; i++) {
        // Randomly select 2 to 6 skills
        const numSkills = Math.floor(Math.random() * 5) + 2;
        const shuffledSkills = [...ALL_SKILLS].sort(() => 0.5 - Math.random());
        const userSkills = shuffledSkills.slice(0, numSkills).map(s => ({
            proficiency: Math.floor(Math.random() * 5) + 1, // 1 to 5
            experienceMonths: Math.floor(Math.random() * 24),
            confidence: Math.floor(Math.random() * 100),
            skill: s
        }));

        // Random CGPA between 6.0 and 10.0
        const cgpa = 6.0 + Math.random() * 4.0;

        // Pick target role
        const targetCareer = CAREER_PATHS[Math.floor(Math.random() * CAREER_PATHS.length)];

        profiles.push({
            id: `u${i}`,
            fullName: `Student ${i}`,
            profile: { cgpa },
            skills: userSkills,
            interests: [
                { priority: 5, interest: { id: `i${i}`, name: targetCareer.category } }
            ],
            careerGoal: {
                preferredJobRole: targetCareer.name
            },
            projects: Math.random() > 0.5 ? [{ title: 'Project 1', description: 'desc', technologies: userSkills[0]?.skill.name || 'React' }] : [],
            certifications: Math.random() > 0.7 ? [{ title: 'Cert', issuer: 'Coursera' }] : [],
            codingPlatforms: [{ platform: 'LeetCode', problemsSolved: Math.floor(Math.random() * 300) }]
        });
    }
    return profiles;
}

// --- EVALUATOR ---
function evaluateRecommendation() {
    const NUM_PROFILES = 1000;
    console.log(`Generating ${NUM_PROFILES} synthetic profiles...`);
    const profiles = generateSyntheticProfiles(NUM_PROFILES);

    let ndcgSumBYSER = 0;
    let ndcgSumJaccard = 0;

    profiles.forEach(profile => {
        // 1. Ground Truth Generation (Proxy): based on the maximum theoretically possible score for this specific profile
        // We treat the highest BYSER score as 'ideal' ground truth target (since we generated random skills, we want to know if BYSER floats the best match vs Jaccard). 
        // Actually, to make it fair, Ground Truth = 1 if user's goal role = career role, 0 otherwise, OR based on raw skill overlap.
        const groundTruthScores = CAREER_PATHS.map(c => {
            // Relevance = 3 if goal matches + skills overlap
            const hasGoal = profile.careerGoal?.preferredJobRole === c.name ? 1 : 0;
            const skillOverlap = c.requiredSkills.filter(req => profile.skills.some(ps => ps.skill.id === req.skill.id)).length;
            return { id: c.id, rel: hasGoal * 2 + (skillOverlap > 0 ? 1 : 0) };
        });

        // 2. BYSER Ranking
        const byserResults = CAREER_PATHS.map(c => evaluateCareerPath(profile, c));
        byserResults.sort((a, b) => b.totalScore - a.totalScore);
        const top3BYSER = byserResults.slice(0, 3).map(r => r.careerPathId);

        // 3. Jaccard Baseline (Skill Overlap only)
        const jaccardResults = CAREER_PATHS.map(c => {
            const overlap = c.requiredSkills.filter(req => profile.skills.some(ps => ps.skill.id === req.skill.id)).length;
            const union = new Set([...c.requiredSkills.map(r => r.skill.id), ...profile.skills.map(s => s.skill.id)]).size;
            return { id: c.id, score: overlap / union };
        });
        jaccardResults.sort((a, b) => b.score - a.score);
        const top3Jaccard = jaccardResults.slice(0, 3).map(r => r.id);

        // 4. Calculate NDCG@3
        const calcDCG = (ranking: string[]) => {
            let dcg = 0;
            for (let i = 0; i < ranking.length; i++) {
                const rel = groundTruthScores.find(g => g.id === ranking[i])?.rel || 0;
                dcg += rel / Math.log2(i + 2);
            }
            return dcg;
        };

        const idealRanking = [...groundTruthScores].sort((a, b) => b.rel - a.rel).map(r => r.id).slice(0, 3);
        const idcg = calcDCG(idealRanking);

        const ndcgByser = idcg > 0 ? calcDCG(top3BYSER) / idcg : 0;
        const ndcgJaccard = idcg > 0 ? calcDCG(top3Jaccard) / idcg : 0;

        ndcgSumBYSER += ndcgByser;
        ndcgSumJaccard += ndcgJaccard;
    });

    console.log("=== RESULTS ===");
    console.log(`BYSER NDCG@3: ${(ndcgSumBYSER / NUM_PROFILES).toFixed(4)}`);
    console.log(`Jaccard NDCG@3: ${(ndcgSumJaccard / NUM_PROFILES).toFixed(4)}`);
    console.log(`Dataset Size: ${NUM_PROFILES}`);

    // Save to JSON for the LLM to read
    fs.writeFileSync('research_results.json', JSON.stringify({
        experiment: 'Recommendation Performance',
        datasetSize: NUM_PROFILES,
        metrics: {
            BYSER_NDCG3: ndcgSumBYSER / NUM_PROFILES,
            JACCARD_NDCG3: ndcgSumJaccard / NUM_PROFILES
        }
    }, null, 2));
}

evaluateRecommendation();
