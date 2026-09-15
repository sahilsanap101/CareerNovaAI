import { evaluateCareerPath, StudentProfileForEngine, CareerPathForEngine, EvaluationResult } from '../../modules/recommendations/engine/byserEngine';
import * as fs from 'fs';
import * as path from 'path';

const NUM_STUDENTS = 200;

const sampleCareers: CareerPathForEngine[] = [
    {
        id: 'c1', name: 'Frontend Developer', description: 'Builds web frontends', category: 'Software Engineering', industry: 'Tech', demandLevel: 'HIGH',
        requiredSkills: [
            { importanceWeight: 10, skill: { id: 's1', name: 'JavaScript', category: 'Language' } },
            { importanceWeight: 9, skill: { id: 's2', name: 'React', category: 'Framework' } },
            { importanceWeight: 7, skill: { id: 's3', name: 'CSS', category: 'Language' } }
        ]
    },
    {
        id: 'c2', name: 'Backend Developer', description: 'Builds backend APIs', category: 'Software Engineering', industry: 'Tech', demandLevel: 'HIGH',
        requiredSkills: [
            { importanceWeight: 10, skill: { id: 's4', name: 'Node.js', category: 'Framework' } },
            { importanceWeight: 9, skill: { id: 's5', name: 'PostgreSQL', category: 'Database' } },
            { importanceWeight: 7, skill: { id: 's1', name: 'JavaScript', category: 'Language' } },
            { importanceWeight: 6, skill: { id: 's6', name: 'Docker', category: 'DevOps' } }
        ]
    },
    {
        id: 'c3', name: 'Machine Learning Engineer', description: 'Builds AI models', category: 'AI & Data', industry: 'Tech', demandLevel: 'HIGH',
        requiredSkills: [
            { importanceWeight: 10, skill: { id: 's7', name: 'Python', category: 'Language' } },
            { importanceWeight: 9, skill: { id: 's8', name: 'TensorFlow', category: 'Framework' } },
            { importanceWeight: 8, skill: { id: 's9', name: 'Machine Learning', category: 'Concept' } }
        ]
    }
];

function generateStudents(n: number): StudentProfileForEngine[] {
    const students: StudentProfileForEngine[] = [];
    const roles = ['Frontend', 'Backend', 'AI'];

    for (let i = 0; i < n; i++) {
        const roleFocus = roles[i % 3];

        // Create baseline skills
        let skills: any[] = [];
        if (roleFocus === 'Frontend') {
            skills = [
                { proficiency: Math.floor(Math.random() * 3) + 3, experienceMonths: 12, confidence: 4, skill: { id: 's1', name: 'JavaScript', category: 'Language' } },
                { proficiency: Math.floor(Math.random() * 3) + 3, experienceMonths: 12, confidence: 4, skill: { id: 's2', name: 'React', category: 'Framework' } }
            ];
        } else if (roleFocus === 'Backend') {
            skills = [
                { proficiency: Math.floor(Math.random() * 3) + 3, experienceMonths: 12, confidence: 4, skill: { id: 's4', name: 'Node.js', category: 'Framework' } },
                { proficiency: Math.floor(Math.random() * 3) + 3, experienceMonths: 12, confidence: 4, skill: { id: 's5', name: 'PostgreSQL', category: 'Database' } }
            ];
        } else {
            skills = [
                { proficiency: Math.floor(Math.random() * 3) + 3, experienceMonths: 12, confidence: 4, skill: { id: 's7', name: 'Python', category: 'Language' } },
                { proficiency: Math.floor(Math.random() * 3) + 3, experienceMonths: 12, confidence: 4, skill: { id: 's8', name: 'TensorFlow', category: 'Framework' } }
            ];
        }

        students.push({
            id: `u${i}`,
            fullName: `User ${i}`,
            profile: {
                cgpa: 6.0 + Math.random() * 4.0, // 6.0 to 10.0
            },
            skills,
            interests: [
                { priority: 1, interest: { id: 'i1', name: roleFocus === 'AI' ? 'AI & Data' : 'Software Engineering' } }
            ],
            careerGoal: {
                preferredJobRole: roleFocus === 'Frontend' ? 'frontend developer' : null
            },
            projects: [
                { title: 'Test Project', description: 'Built an app', technologies: skills.map(s => s.skill.name).join(', ') }
            ],
            certifications: [],
            codingPlatforms: [{ platform: 'LeetCode', problemsSolved: Math.floor(Math.random() * 200) }]
        });
    }
    return students;
}

function runExperiments() {
    console.log("Starting Benchmark Sequence...");
    const students = generateStudents(NUM_STUDENTS);

    // 1. Latency & Ranking Experiment
    const startMs = Date.now();
    let correctTopRank = 0;

    const resultsData: any[] = [];

    students.forEach((student, index) => {
        const evals = sampleCareers.map(c => evaluateCareerPath(student, c));
        evals.sort((a, b) => b.totalScore - a.totalScore);

        // Verification: Did Frontend focused student get frontend top?
        const topName = evals[0].careerPathName;
        const focus = (index % 3 === 0) ? 'Frontend Developer' : (index % 3 === 1) ? 'Backend Developer' : 'Machine Learning Engineer';

        if (topName === focus) correctTopRank++;

        resultsData.push({
            userId: student.id,
            assignedFocus: focus,
            topRecommended: topName,
            topScore: evals[0].totalScore,
            sgi: evals[0].SGI
        });
    });

    const durationMs = Date.now() - startMs;
    const accuracy = (correctTopRank / NUM_STUDENTS) * 100;
    const avgLatencyPerStudent = durationMs / NUM_STUDENTS;

    console.log(`\n=== EXPERIMENT 1: HEURISTIC RANKING (N=${NUM_STUDENTS}) ===`);
    console.log(`Total Execution Time: ${durationMs}ms`);
    console.log(`Average Latency per Match: ${avgLatencyPerStudent.toFixed(3)}ms`);
    console.log(`Deterministic Alignment Accuracy: ${accuracy.toFixed(2)}%`);

    // Write log to FS for LaTeX reading/verification
    const resultStr = `N=${NUM_STUDENTS}\nDuration(ms)=${durationMs}\nLatency(ms/req)=${avgLatencyPerStudent.toFixed(4)}\nAccuracy=${accuracy}%`;

    const outDir = path.join(__dirname, 'results');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outDir, 'exp1_performance.txt'), resultStr);
    console.log('Results written to', path.join(outDir, 'exp1_performance.txt'));
}

runExperiments();
