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

function mapRowToProfile(row: Record<string, string>, applyLeak: boolean = false): { profile: StudentRecommendationProfile, targetLabel: string } {
  const targetLabel = row['career_preference'] || 'Unknown';
  
  // FIX FOR LEAKAGE AUDIT: DO NOT INJECT TARGET LABEL INTO GOALS UNLESS applyLeak is true
  const profile: StudentRecommendationProfile = {
    personal: { branch: row['branch'] || 'Unknown', degree: 'B.Tech', specialization: '' },
    academic: { cgpa: parseFloat(row['cgpa'] || '0') },
    yearStage: {
      year: parseInt(row['year'] || '1', 10), semester: parseInt(row['semester'] || '1', 10),
      isExploratory: parseInt(row['year'] || '1', 10) <= 2, isPlacementReady: parseInt(row['year'] || '1', 10) > 2
    },
    skills: {}, interests: {}, projects: [], certifications: [],
    codingEvidence: { platforms: [], totalProblemsSolved: 0, maxRating: 0 },
    careerGoals: { targetRole: applyLeak && targetLabel !== 'Unknown' ? targetLabel : '', targetIndustry: '' }
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

  return { profile, targetLabel };
}

function calculateMetrics(predictions: {target: string, top5: string[]}[]) {
  let t1=0, t3=0, t5=0, mrrSum=0;
  
  for (const p of predictions) {
    const rank = p.top5.indexOf(p.target);
    if (rank === 0) t1++;
    if (rank >= 0 && rank < 3) t3++;
    if (rank >= 0 && rank < 5) t5++;
    if (rank >= 0) mrrSum += 1.0 / (rank + 1);
  }

  return {
    top1: t1/predictions.length,
    top3: t3/predictions.length,
    top5: t5/predictions.length,
    mrr: mrrSum/predictions.length
  };
}

async function runEvaluations() {
  const csv = fs.readFileSync(CSV_PATH, 'utf-8').trim().split('\n');
  const headers = csv[0].split(',');
  const rows = csv.slice(1).map(l => parseCSVLine(headers, l)).filter(r => r.career_preference && r.career_preference !== 'Unknown');

  // Get all careers from a dummy run for baseline
  const dummyProfile = mapRowToProfile(rows[0], false).profile;
  const initialRecs = await RecommendationEngineService.generateRecommendations(dummyProfile);
  const allCareerNames = initialRecs.map(r => normalize(r.careerName));

  const results = { baselines: {}, ablations: {}, proposed: {}, robustness: {} };

  console.log('Running Baseline: Random');
  const randomPreds = [];
  for (const row of rows) {
    const { targetLabel } = mapRowToProfile(row);
    const shuffled = [...allCareerNames].sort(() => 0.5 - Math.random());
    randomPreds.push({ target: normalize(targetLabel), top5: shuffled.slice(0, 5) });
  }
  results.baselines['Random'] = calculateMetrics(randomPreds);

  console.log('Running Proposed Model (Leaked)...');
  const leakPreds = [];
  for (const row of rows) {
    const { profile, targetLabel } = mapRowToProfile(row, true);
    const recs = await RecommendationEngineService.generateRecommendations(profile);
    leakPreds.push({ target: normalize(targetLabel), top5: recs.slice(0,5).map(r => normalize(r.careerName)) });
  }
  results.baselines['Leaked (Previous Script)'] = calculateMetrics(leakPreds);

  console.log('Running Proposed Model (Clean - NO LEAK)...');
  const cleanPreds = [];
  let start = Date.now();
  for (const row of rows) {
    const { profile, targetLabel } = mapRowToProfile(row, false);
    const recs = await RecommendationEngineService.generateRecommendations(profile);
    cleanPreds.push({ target: normalize(targetLabel), top5: recs.slice(0,5).map(r => normalize(r.careerName)) });
  }
  const latency = (Date.now() - start) / rows.length;
  results.proposed = { ...calculateMetrics(cleanPreds), latency_ms: latency };

  const ABLATIONS = [
    { id: 'skills_only', name: 'Skills Only', weights: { SKILLS: 1, INTERESTS: 0, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
    { id: 'interests_only', name: 'Interests Only', weights: { SKILLS: 0, INTERESTS: 1, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
    { id: 'skills_interests', name: 'Skills + Interests', weights: { SKILLS: 0.6, INTERESTS: 0.4, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } }
  ];

  for (const exp of ABLATIONS) {
    console.log(`Running Ablation: ${exp.name}`);
    const preds = [];
    for (const row of rows) {
      const { profile, targetLabel } = mapRowToProfile(row, false);
      const recs = await RecommendationEngineService.generateRecommendations(profile, exp.weights);
      preds.push({ target: normalize(targetLabel), top5: recs.slice(0,5).map(r => normalize(r.careerName)) });
    }
    results.ablations[exp.id] = calculateMetrics(preds);
  }

  console.log('Running Robustness Test (Drop 1 Skill)...');
  const robPreds = [];
  let overlapCount = 0;
  for (let i = 0; i < rows.length; i++) {
    const { profile, targetLabel } = mapRowToProfile(rows[i], false);
    const keys = Object.keys(profile.skills);
    if (keys.length > 0) {
      delete profile.skills[keys[0]]; // Perturbation: remove first skill
    }
    const recs = await RecommendationEngineService.generateRecommendations(profile);
    const top5 = recs.slice(0,5).map(r => normalize(r.careerName));
    
    // Calculate Overlap with Clean Preds
    const origTop5 = cleanPreds[i].top5;
    const overlap = top5.filter(c => origTop5.includes(c)).length;
    overlapCount += (overlap / 5);

    robPreds.push({ target: normalize(targetLabel), top5 });
  }
  results.robustness['drop_1_skill'] = { ...calculateMetrics(robPreds), overlap_rate: overlapCount / rows.length };

  fs.writeFileSync(path.join(RESULTS_DIR, 'processed', 'evaluation_metrics.json'), JSON.stringify(results, null, 2));
  console.log('Evaluation complete! Results saved to evaluation_metrics.json');
}

runEvaluations().catch(console.error);
