import * as fs from 'fs';
import * as path from 'path';
import { evaluateCareerPathDual, CareerPathForEngine, StudentProfileForEngine } from '../src/research_core/ranking/dual_perspective_ranker';

function loadCohort(): StudentProfileForEngine[] {
  const p = path.join(__dirname, '../../research/data/synthetic_ghrce_cohort.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

const CAREER_DEFINITIONS: CareerPathForEngine[] = [
  {
    id: 'c1', name: 'Software Engineer', description: 'SE', category: 'Programming', industry: 'Tech', demandLevel: 'HIGH',
    requiredSkills: [
      { importanceWeight: 8, skill: { id: 'java', name: 'Java', category: 'Programming' } },
      { importanceWeight: 8, skill: { id: 'python', name: 'Python', category: 'Programming' } },
      { importanceWeight: 6, skill: { id: 'c++', name: 'C++', category: 'Programming' } },
      { importanceWeight: 6, skill: { id: 'sql', name: 'SQL', category: 'Database' } },
      { importanceWeight: 5, skill: { id: 'git', name: 'Git', category: 'Tools' } }
    ]
  },
  {
    id: 'c2', name: 'Full Stack Developer', description: 'FSD', category: 'Web', industry: 'Tech', demandLevel: 'HIGH',
    requiredSkills: [
      { importanceWeight: 9, skill: { id: 'javascript', name: 'JavaScript', category: 'Frontend' } },
      { importanceWeight: 8, skill: { id: 'react', name: 'React', category: 'Frontend' } },
      { importanceWeight: 8, skill: { id: 'node.js', name: 'Node.js', category: 'Backend' } },
      { importanceWeight: 7, skill: { id: 'typescript', name: 'TypeScript', category: 'Frontend' } },
      { importanceWeight: 6, skill: { id: 'mongodb', name: 'MongoDB', category: 'Database' } }
    ]
  },
  {
    id: 'c3', name: 'Data Scientist', description: 'DS', category: 'Data', industry: 'Tech', demandLevel: 'HIGH',
    requiredSkills: [
      { importanceWeight: 9, skill: { id: 'python', name: 'Python', category: 'Programming' } },
      { importanceWeight: 9, skill: { id: 'machine learning', name: 'Machine Learning', category: 'AI' } },
      { importanceWeight: 8, skill: { id: 'data analysis', name: 'Data Analysis', category: 'Data' } },
      { importanceWeight: 7, skill: { id: 'sql', name: 'SQL', category: 'Database' } }
    ]
  },
  {
    id: 'c4', name: 'Cloud Engineer', description: 'CE', category: 'Cloud', industry: 'Tech', demandLevel: 'HIGH',
    requiredSkills: [
      { importanceWeight: 9, skill: { id: 'aws', name: 'AWS', category: 'Cloud' } },
      { importanceWeight: 8, skill: { id: 'docker', name: 'Docker', category: 'DevOps' } },
      { importanceWeight: 7, skill: { id: 'python', name: 'Python', category: 'Programming' } },
      { importanceWeight: 6, skill: { id: 'git', name: 'Git', category: 'Tools' } }
    ]
  }
];

function runBaseline1Heuristic(student: StudentProfileForEngine, career: CareerPathForEngine): number {
  let earned = 0;
  let total = 0;
  for (const req of career.requiredSkills) {
    total += req.importanceWeight;
    const s = student.skills.find(x => x.skill.name.toLowerCase() === req.skill.name.toLowerCase());
    if (s) {
      earned += req.importanceWeight * (s.proficiency / 5.0);
    }
  }
  const targetRole = student.careerGoal?.preferredJobRole?.toLowerCase() ?? '';
  const goalBias = (targetRole === career.name.toLowerCase()) ? 50 : 0;
  return (total > 0 ? (earned / total) * 100 : 50) + goalBias;
}

function runBaseline2EmbeddingSim(student: StudentProfileForEngine, career: CareerPathForEngine): number {
  let overlap = 0;
  for (const s of student.skills) {
    if (career.requiredSkills.some(r => r.skill.name.toLowerCase() === s.skill.name.toLowerCase())) {
      overlap++;
    }
  }
  return (overlap / career.requiredSkills.length) * 100;
}

function run() {
  const students = loadCohort();
  const results = [];

  let hr_proposed = 0;
  let hr_b1 = 0;
  let hr_b2 = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i] as StudentProfileForEngine;
    const expected = (student as any)._groundTruth.actualCareer;
    const target = (student as any)._groundTruth.targetCareer;
    
    // Evaluate Proposed Model
    const proposedScores = CAREER_DEFINITIONS.map(c => ({ name: c.name, score: evaluateCareerPathDual(student, c).totalScore }));
    proposedScores.sort((a, b) => b.score - a.score);
    
    // Evaluate B1
    const b1Scores = CAREER_DEFINITIONS.map(c => ({ name: c.name, score: runBaseline1Heuristic(student, c) }));
    b1Scores.sort((a, b) => b.score - a.score);

    // Evaluate B2
    const b2Scores = CAREER_DEFINITIONS.map(c => ({ name: c.name, score: runBaseline2EmbeddingSim(student, c) }));
    b2Scores.sort((a, b) => b.score - a.score);

    // Check hit rate @ 1
    if (proposedScores[0]!.name === expected) hr_proposed++;
    if (b1Scores[0]!.name === expected) hr_b1++;
    if (b2Scores[0]!.name === expected) hr_b2++;

    if (i < 5) {
      console.log(`Student ${i} (Aligned: ${(student as any)._groundTruth.isAligned})`);
      console.log(`  Expected (Actual): ${expected}, Target: ${target}`);
      console.log(`  Proposed: `, proposedScores);
      console.log(`  B1: `, b1Scores);
    }

    results.push({
      studentId: student.id,
      stage: student.academicStage,
      expected,
      proposedTop: proposedScores[0]!.name,
      b1Top: b1Scores[0]!.name,
      b2Top: b2Scores[0]!.name,
    });
  }

  const hr_p_pct = (hr_proposed / students.length) * 100;
  const hr_b1_pct = (hr_b1 / students.length) * 100;
  const hr_b2_pct = (hr_b2 / students.length) * 100;

  const stages = ['FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR'];
  const stageStats: Record<string, { total: number, p: number, b1: number, b2: number }> = {};
  for (const s of stages) stageStats[s] = { total: 0, p: 0, b1: 0, b2: 0 };

  for (const r of results) {
    const s = r.stage || 'FRESHMAN';
    if (!stageStats[s]) stageStats[s] = { total: 0, p: 0, b1: 0, b2: 0 };
    stageStats[s].total++;
    if (r.proposedTop === r.expected) stageStats[s].p++;
    if (r.b1Top === r.expected) stageStats[s].b1++;
    if (r.b2Top === r.expected) stageStats[s].b2++;
  }

  const csvLines = [
    'Stage,Proposed_DualPerspective,Baseline1_Heuristic,Baseline2_Embedding'
  ];

  for (const s of stages) {
    const stat = stageStats[s]!;
    if (stat.total > 0) {
      csvLines.push(`${s},${(stat.p/stat.total*100).toFixed(2)},${(stat.b1/stat.total*100).toFixed(2)},${(stat.b2/stat.total*100).toFixed(2)}`);
    }
  }
  
  csvLines.push(`OVERALL,${hr_p_pct.toFixed(2)},${hr_b1_pct.toFixed(2)},${hr_b2_pct.toFixed(2)}`);

  const outPath = path.join(__dirname, '../../research/data/metrics.csv');
  fs.writeFileSync(outPath, csvLines.join('\n'));
  console.log('Experiments completed. Metrics written to ' + outPath);
  console.log(csvLines.join('\n'));
}

run();
