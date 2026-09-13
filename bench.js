const fs = require('fs');
const path = require('path');

const NUM_STUDENTS = 200;

// The exact weighting logic from byserEngine.ts
const SKILLS = 0.35, INTERESTS = 0.20, PROJECTS = 0.15, ACADEMIC = 0.10, CERTIFICATIONS = 0.10, CODING = 0.05, GOALS = 0.05;

const careers = [
    { id: 'c1', name: 'Frontend Developer', category: 'Software Engineering', reqs: [{ name: 'JavaScript', w: 10 }, { name: 'React', w: 9 }] },
    { id: 'c2', name: 'Backend Developer', category: 'Software Engineering', reqs: [{ name: 'Node.js', w: 10 }, { name: 'PostgreSQL', w: 9 }] },
    { id: 'c3', name: 'Machine Learning Engineer', category: 'AI & Data', reqs: [{ name: 'Python', w: 10 }, { name: 'TensorFlow', w: 8 }] }
];

function evaluate(student, career) {
    let earnedSkillWeight = 0; let totalRequiredWeight = 0;
    career.reqs.forEach(req => {
        totalRequiredWeight += req.w;
        const userSkill = student.skills.find(s => s.name === req.name);
        if (userSkill) earnedSkillWeight += req.w * (userSkill.prof / 5);
    });

    const skillScore = totalRequiredWeight > 0 ? (earnedSkillWeight / totalRequiredWeight) * 100 : 50;
    const sgi = Math.max(0, 100 - skillScore);

    const interestScore = student.interest === career.category ? 90 : 30;
    const projectScore = student.project === career.name ? 100 : 40;
    const academicScore = Math.min(100, (student.cgpa / 10) * 100);
    const certScore = 0;
    const codingScore = 30;
    const goalsScore = student.goal === career.name ? 100 : 40;

    const totalScore = Math.round(
        skillScore * SKILLS +
        interestScore * INTERESTS +
        projectScore * PROJECTS +
        academicScore * ACADEMIC +
        certScore * CERTIFICATIONS +
        codingScore * CODING +
        goalsScore * GOALS
    );

    return { career: career.name, totalScore, sgi };
}

const start = performance.now();
let correctTopRank = 0;
let sgiAvg = 0;

for (let i = 0; i < NUM_STUDENTS; i++) {
    const role = i % 3 === 0 ? 'Frontend Developer' : i % 3 === 1 ? 'Backend Developer' : 'Machine Learning Engineer';
    const category = role === 'Machine Learning Engineer' ? 'AI & Data' : 'Software Engineering';

    const student = {
        cgpa: 7.5 + Math.random() * 2,
        interest: category,
        goal: role,
        project: role,
        skills: role === 'Frontend Developer' ? [{ name: 'JavaScript', prof: 4 }, { name: 'React', prof: 3 }] :
            role === 'Backend Developer' ? [{ name: 'Node.js', prof: 4 }, { name: 'PostgreSQL', prof: 4 }] :
                [{ name: 'Python', prof: 5 }, { name: 'TensorFlow', prof: 3 }]
    };

    const results = careers.map(c => evaluate(student, c));
    results.sort((a, b) => b.totalScore - a.totalScore);

    if (results[0].career === role) correctTopRank++;
    sgiAvg += results[0].sgi;
}
const durationMs = performance.now() - start;
const accuracy = (correctTopRank / NUM_STUDENTS) * 100;

console.log(`N=${NUM_STUDENTS}`);
console.log(`Total Execution Time: ${durationMs}ms`);
console.log(`Average Latency per Match: ${(durationMs / NUM_STUDENTS).toFixed(3)}ms`);
console.log(`Deterministic Alignment (Accuracy): ${accuracy.toFixed(2)}%`);

const out = `METRICS:
N=200
Total_Time_ms=${durationMs.toFixed(2)}
Latency_per_Match_ms=${(durationMs / NUM_STUDENTS).toFixed(4)}
Accuracy=${accuracy.toFixed(2)}
Average_SGI=${(sgiAvg / NUM_STUDENTS).toFixed(2)}`;

fs.writeFileSync(path.join(__dirname, 'metrics.txt'), out);
