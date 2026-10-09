import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../src/modules/careers/services/recommendationEngine.service';
import { StudentRecommendationProfile } from '../src/modules/careers/types';

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const CONTROLLED_CAREERS = new Set([
  'Data Analyst', 'Full Stack Developer', 'Cybersecurity Engineer', 'Software Engineer',
  'QA Engineer', 'NLP Engineer', 'Frontend Developer', 'DevOps Engineer', 'Data Engineer',
  'Cloud Engineer', 'Backend Developer', 'Computer Vision Engineer', 'Machine Learning Engineer',
  'MLOps Engineer', 'Data Scientist'
].map(c => c.toLowerCase()));

async function run() {
  const csvPath = path.join(process.cwd(), '..', '..', 'research', 'data', 'student_dataset_500_development.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvData.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim());

  let outCsv = 'student_id,ground_truth_career,Top-1 prediction,Top-3 predictions,Top-5 predictions,full ranked career list,full score list\n';
  
  let top1Hits = 0, top3Hits = 0, top5Hits = 0, mrrSum = 0, ndcg5Sum = 0, totalValid = 0;
  const confusion: Record<string, { tp: number, fp: number, fn: number }> = {};
  for (const c of CONTROLLED_CAREERS) confusion[c] = { tp: 0, fp: 0, fn: 0 };

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length !== headers.length) continue;

    const targetRole = row[headers.length - 1];
    const normTarget = normalize(targetRole);
    if (!CONTROLLED_CAREERS.has(targetRole.toLowerCase())) continue;

    const profile: StudentRecommendationProfile = {
      studentId: row[0],
      yearStage: { year: parseInt(row[1]) || 1, semester: parseInt(row[3]) || 1, isExploratory: parseInt(row[1]) <= 2, isPlacementReady: parseInt(row[1]) > 2 },
      academic: { degree: 'B.Tech', branch: row[2], specialization: null, cgpa: parseFloat(row[4]) || 7.0 },
      skills: {}, interests: {}, projects: [], certifications: [],
      codingEvidence: { totalProblemsSolved: 0, activePlatforms: [] },
      careerGoals: { targetRole: null, targetIndustry: null, preferredCountries: null, preferredWorkMode: null, aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false } }
    };

    // Correct skill mapping
    for (let c = 8; c < headers.length - 7; c++) {
      const val = parseInt(row[c]) || 0;
      if (val > 0) {
        const canonical = headers[c].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        profile.skills[canonical] = { proficiency: val, confidence: val * 20 };
      }
    }

    // Correct interest mapping
    const interestMapping: Record<string, string> = {
      'interest_ai_ml': 'Artificial Intelligence',
      'interest_data': 'Data',
      'interest_web': 'Web',
      'interest_software': 'Software Engineering',
      'interest_cloud': 'Cloud',
      'interest_cybersecurity': 'Cybersecurity'
    };
    for (const [col, intName] of Object.entries(interestMapping)) {
      const idx = headers.indexOf(col);
      if (idx !== -1 && (parseInt(row[idx]) || 0) > 0) {
        profile.interests[intName] = { strength: parseInt(row[idx]) };
      }
    }

    const pCount = parseInt(row[headers.indexOf('projects_count')] || '0');
    for (let j = 0; j < pCount; j++) profile.projects.push({ title: `Synthetic Project`, domain: 'General', technologies: [] });
    
    const cCount = parseInt(row[headers.indexOf('certifications_count')] || '0');
    for (let j = 0; j < cCount; j++) profile.certifications.push({ title: `Synthetic Cert` });

    const recs = await RecommendationEngineService.generateRecommendations(profile);
    // Filter to exactly 15 candidate classes
    const controlledRecs = recs.filter(r => CONTROLLED_CAREERS.has(r.careerName.toLowerCase()));
    
    const top1 = controlledRecs[0];
    const top3 = controlledRecs.slice(0, 3).map(r => r.careerName).join('|');
    const top5 = controlledRecs.slice(0, 5).map(r => r.careerName).join('|');
    const fullRank = controlledRecs.map(r => r.careerName).join('|');
    const fullScore = controlledRecs.map(r => r.finalScore).join('|');

    outCsv += `${row[0]},${targetRole},${top1.careerName},${top3},${top5},${fullRank},${fullScore}\n`;

    const rank = controlledRecs.findIndex(r => normalize(r.careerName) === normTarget) + 1;
    if (rank === 1) top1Hits++;
    if (rank > 0 && rank <= 3) top3Hits++;
    if (rank > 0 && rank <= 5) top5Hits++;
    if (rank > 0) {
      mrrSum += 1 / rank;
      if (rank <= 5) ndcg5Sum += 1 / Math.log2(rank + 1);
    }

    const normPred = normalize(top1.careerName);
    if (normPred === normTarget) {
      confusion[targetRole.toLowerCase()].tp++;
    } else {
      confusion[targetRole.toLowerCase()].fn++;
      if (confusion[top1.careerName.toLowerCase()]) confusion[top1.careerName.toLowerCase()].fp++;
    }

    totalValid++;
  }

  const outDir = path.join(process.cwd(), '..', '..', 'research', 'audit', `fresh_reproduction_final_${Date.now()}`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'predictions.csv'), outCsv);

  let totalPrecision = 0, totalRecall = 0, totalF1 = 0, validClasses = 0;
  for (const c of CONTROLLED_CAREERS) {
    const { tp, fp, fn } = confusion[c];
    const p = tp + fp > 0 ? tp / (tp + fp) : 0;
    const r = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = p + r > 0 ? 2 * p * r / (p + r) : 0;
    totalPrecision += p; totalRecall += r; totalF1 += f1;
    validClasses++;
  }

  const results = {
    top1: ((top1Hits / totalValid) * 100).toFixed(1),
    top3: ((top3Hits / totalValid) * 100).toFixed(1),
    top5: ((top5Hits / totalValid) * 100).toFixed(1),
    mrr: ((mrrSum / totalValid) * 100).toFixed(1),
    ndcg: ((ndcg5Sum / totalValid) * 100).toFixed(1),
    macroP: ((totalPrecision / validClasses) * 100).toFixed(1),
    macroR: ((totalRecall / validClasses) * 100).toFixed(1),
    macroF1: ((totalF1 / validClasses) * 100).toFixed(1),
    confusionMatrix: confusion
  };

  fs.writeFileSync(path.join(outDir, 'metrics.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
