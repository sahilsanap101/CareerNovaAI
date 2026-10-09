import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../modules/careers/services/recommendationEngine.service';
import { StudentRecommendationProfile } from '../modules/careers/types';

const CSV_PATH = path.resolve(__dirname, '../../../../research/data/student_dataset_500_development.csv');
const RESULTS_DIR = path.resolve(__dirname, '../../../../evaluation/results');

function normalize(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

function parseCSVLine(headers: string[], line: string) {
  const values = line.split(',');
  const row: Record<string, string> = {};
  headers.forEach((h, i) => { row[h.trim()] = values[i]?.trim(); });
  return row;
}

function mapRowToProfile(row: Record<string, string>): { profile: StudentRecommendationProfile, targetLabel: string, raw: Record<string, string> } {
  const targetLabel = row['career_preference'] || 'Unknown';
  
  // LEAKAGE FIX: Empty career goals
  const profile: StudentRecommendationProfile = {
    personal: { branch: row['branch'] || 'Unknown', degree: 'B.Tech', specialization: '' },
    academic: { cgpa: parseFloat(row['cgpa'] || '0') },
    yearStage: {
      year: parseInt(row['year'] || '1', 10), semester: parseInt(row['semester'] || '1', 10),
      isExploratory: parseInt(row['year'] || '1', 10) <= 2, isPlacementReady: parseInt(row['year'] || '1', 10) > 2
    },
    skills: {}, interests: {}, projects: [], certifications: [],
    codingEvidence: { platforms: [], totalProblemsSolved: 0, maxRating: 0 },
    careerGoals: { targetRole: '', targetIndustry: '' }
  };

  const metaColumns = ['student_id', 'year', 'branch', 'semester', 'cgpa', 'projects_count', 'certifications_count', 'internship_experience', 'career_preference', 'interest_ai_ml', 'interest_data', 'interest_web', 'interest_software', 'interest_cloud', 'interest_cybersecurity'];
  for (const [key, value] of Object.entries(row)) {
    if (!metaColumns.includes(key) && value) {
      const prof = parseInt(value, 10);
      if (prof > 0) {
        const canonical = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        profile.skills[canonical] = { proficiency: prof, confidence: prof * 20 };
      }
    }
  }

  if (parseInt(row['interest_ai_ml'] || '0') > 0) profile.interests['Artificial Intelligence'] = { strength: parseInt(row['interest_ai_ml']) };
  if (parseInt(row['interest_data'] || '0') > 0) profile.interests['Data'] = { strength: parseInt(row['interest_data']) };
  if (parseInt(row['interest_web'] || '0') > 0) profile.interests['Web'] = { strength: parseInt(row['interest_web']) };
  if (parseInt(row['interest_software'] || '0') > 0) profile.interests['Software Engineering'] = { strength: parseInt(row['interest_software']) };
  if (parseInt(row['interest_cloud'] || '0') > 0) profile.interests['Cloud'] = { strength: parseInt(row['interest_cloud']) };
  if (parseInt(row['interest_cybersecurity'] || '0') > 0) profile.interests['Cybersecurity'] = { strength: parseInt(row['interest_cybersecurity']) };

  for (let i = 0; i < parseInt(row['projects_count'] || '0'); i++) profile.projects.push({ title: `Synthetic Project ${i+1}`, domain: 'General', technologies: [] });
  for (let i = 0; i < parseInt(row['certifications_count'] || '0'); i++) profile.certifications.push({ title: `Synthetic Cert ${i+1}` });

  return { profile, targetLabel, raw: row };
}

function computeMetrics(predictions: {target: string, ranking: string[]}[]) {
  let h1 = 0, h3 = 0, h5 = 0, h10 = 0, mrrSum = 0;
  let ndcg5Sum = 0, ndcg10Sum = 0;
  let ranks = [];

  for (const p of predictions) {
    const rank = p.ranking.indexOf(p.target);
    if (rank >= 0) {
      ranks.push(rank + 1);
      if (rank < 1) h1++;
      if (rank < 3) h3++;
      if (rank < 5) h5++;
      if (rank < 10) h10++;
      mrrSum += 1.0 / (rank + 1);
      if (rank < 5) ndcg5Sum += 1.0 / Math.log2(rank + 2);
      if (rank < 10) ndcg10Sum += 1.0 / Math.log2(rank + 2);
    } else {
      ranks.push(p.ranking.length + 1); // Worst rank if not found
    }
  }

  ranks.sort((a,b) => a - b);
  const medianRank = ranks[Math.floor(ranks.length / 2)] || 0;
  const meanRank = ranks.reduce((a, b) => a + b, 0) / (ranks.length || 1);
  const n = predictions.length;

  return {
    hit1: h1/n, hit3: h3/n, hit5: h5/n, hit10: h10/n,
    mrr: mrrSum/n, ndcg5: ndcg5Sum/n, ndcg10: ndcg10Sum/n,
    meanRank, medianRank
  };
}

function computeBootstrap(predictions: {target: string, ranking: string[]}[], iterations: number = 1000) {
  const n = predictions.length;
  const metrics = { hit1: [] as number[], hit3: [] as number[], hit5: [] as number[], mrr: [] as number[] };
  
  for (let i = 0; i < iterations; i++) {
    const sample = [];
    for (let j = 0; j < n; j++) {
      sample.push(predictions[Math.floor(Math.random() * n)]);
    }
    const res = computeMetrics(sample);
    metrics.hit1.push(res.hit1);
    metrics.hit3.push(res.hit3);
    metrics.hit5.push(res.hit5);
    metrics.mrr.push(res.mrr);
  }

  const getCI = (arr: number[]) => {
    arr.sort((a,b) => a - b);
    return { low: arr[Math.floor(iterations * 0.025)], high: arr[Math.floor(iterations * 0.975)] };
  };

  return {
    hit1: getCI(metrics.hit1),
    hit3: getCI(metrics.hit3),
    hit5: getCI(metrics.hit5),
    mrr: getCI(metrics.mrr)
  };
}

async function run() {
  const csv = fs.readFileSync(CSV_PATH, 'utf-8').trim().split('\n');
  const headers = csv[0].split(',');
  const rows = csv.slice(1).map(l => parseCSVLine(headers, l)).filter(r => r.career_preference && r.career_preference !== 'Unknown');

  // Audit
  const careers = new Set(rows.map(r => r.career_preference));
  console.log(`Loaded ${rows.length} records. Found ${careers.size} careers.`);

  // Get All Candidates
  const dummyProfile = mapRowToProfile(rows[0]).profile;
  const initialRecs = await RecommendationEngineService.generateRecommendations(dummyProfile);
  const candidateCareers = initialRecs.map(r => normalize(r.careerName));
  const numCandidates = candidateCareers.length;

  const dataset: { profile: StudentRecommendationProfile, targetLabel: string, raw: Record<string, string> }[] = [];
  rows.forEach(r => dataset.push(mapRowToProfile(r)));

  const results: any = { baselines: {}, ablations: {}, robustness: {}, academicYear: {}, perCareer: {}, bootstrap: {} };

  // Phase 7: Random Baseline
  const randomPreds = dataset.map(d => {
    const shuffled = [...candidateCareers].sort(() => 0.5 - Math.random());
    return { target: normalize(d.targetLabel), ranking: shuffled };
  });
  results.baselines['Random'] = computeMetrics(randomPreds);

  // Define Experiements
  const EXPERIMENTS = [
    { id: 'skills_only', name: 'Skills Only', weights: { SKILLS: 1, INTERESTS: 0, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
    { id: 'interests_only', name: 'Interests Only', weights: { SKILLS: 0, INTERESTS: 1, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
    { id: 'academic_only', name: 'Academics Only', weights: { SKILLS: 0, INTERESTS: 0, ACADEMIC: 1, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
    { id: 'skills_interests', name: 'Skills + Interests', weights: { SKILLS: 0.6, INTERESTS: 0.4, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
    { id: 'skills_academics', name: 'Skills + Academics', weights: { SKILLS: 0.7, INTERESTS: 0, ACADEMIC: 0.3, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
    { id: 'skills_projects', name: 'Skills + Projects', weights: { SKILLS: 0.7, INTERESTS: 0, ACADEMIC: 0, PROJECTS: 0.3, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
    { id: 'skills_interests_academics', name: 'Skills + Interests + Academics', weights: { SKILLS: 0.5, INTERESTS: 0.3, ACADEMIC: 0.2, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
    { id: 'full_proposed', name: 'Full PathForge (Clean)', weights: undefined } // Default weights
  ];

  let fullPreds: {target: string, ranking: string[], origLabel: string}[] = [];
  const startLatency = Date.now();
  let totalInf = 0;

  for (const exp of EXPERIMENTS) {
    const preds = [];
    for (const d of dataset) {
      const recs = await RecommendationEngineService.generateRecommendations(d.profile, exp.weights);
      totalInf++;
      const ranking = recs.map(r => normalize(r.careerName));
      preds.push({ target: normalize(d.targetLabel), ranking, origLabel: d.targetLabel });
    }
    const metrics = computeMetrics(preds);
    
    if (exp.id === 'full_proposed') {
       results.baselines[exp.name] = metrics;
       fullPreds = preds;
    } else {
       results.ablations[exp.id] = metrics;
    }
  }
  const latency = (Date.now() - startLatency) / totalInf;
  results.latency = latency;

  // Confidence Intervals on Full
  results.bootstrap['Full'] = computeBootstrap(fullPreds);

  // Robustness Tests
  const ROB_TESTS = [0.1, 0.25, 0.5, 0.75];
  for (const p of ROB_TESTS) {
    const preds = [];
    for (const d of dataset) {
      // Clone profile deep
      const profStr = JSON.stringify(d.profile);
      const prof: StudentRecommendationProfile = JSON.parse(profStr);
      
      const skillKeys = Object.keys(prof.skills);
      const toRemove = Math.floor(skillKeys.length * p);
      for (let i = 0; i < toRemove; i++) {
        delete prof.skills[skillKeys[i]];
      }
      const recs = await RecommendationEngineService.generateRecommendations(prof);
      preds.push({ target: normalize(d.targetLabel), ranking: recs.map(r => normalize(r.careerName)) });
    }
    results.robustness[`remove_${p*100}`] = computeMetrics(preds);
  }

  // Academic Year
  const yearGroups = { 1: [], 2: [], 3: [], 4: [] };
  dataset.forEach((d, i) => {
    const y = d.profile.yearStage.year;
    if (y >= 1 && y <= 4) yearGroups[y].push(fullPreds[i]);
  });
  for (let y = 1; y <= 4; y++) {
    if (yearGroups[y].length > 0) {
      results.academicYear[`Year ${y}`] = { ...computeMetrics(yearGroups[y]), count: yearGroups[y].length };
    }
  }

  // Per Career
  const careerStats: Record<string, any> = {};
  fullPreds.forEach(p => {
    if (!careerStats[p.origLabel]) careerStats[p.origLabel] = { count: 0, hit1: 0, hit3: 0, hit5: 0 };
    careerStats[p.origLabel].count++;
    if (p.ranking[0] === p.target) careerStats[p.origLabel].hit1++;
    if (p.ranking.indexOf(p.target) >= 0 && p.ranking.indexOf(p.target) < 3) careerStats[p.origLabel].hit3++;
    if (p.ranking.indexOf(p.target) >= 0 && p.ranking.indexOf(p.target) < 5) careerStats[p.origLabel].hit5++;
  });
  for (const c in careerStats) {
    careerStats[c].hit1 /= careerStats[c].count;
    careerStats[c].hit3 /= careerStats[c].count;
    careerStats[c].hit5 /= careerStats[c].count;
  }
  results.perCareer = careerStats;

  fs.writeFileSync(path.join(RESULTS_DIR, 'raw', 'comprehensive_metrics.json'), JSON.stringify(results, null, 2));

  // Output Student Predictions
  let csvOut = "student_id,ground_truth,predicted,hit1,hit5\n";
  dataset.forEach((d, i) => {
    const p = fullPreds[i];
    csvOut += `${d.raw['student_id']},${d.targetLabel},${p.ranking[0]},${p.ranking[0]===p.target?1:0},${p.ranking.indexOf(p.target)<5?1:0}\n`;
  });
  fs.writeFileSync(path.join(RESULTS_DIR, 'student_level_predictions.csv'), csvOut);

  console.log('Comprehensive Evaluation Complete!');
}

run().catch(console.error);
