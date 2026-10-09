// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../modules/careers/services/recommendationEngine.service';
import { StudentRecommendationProfile } from '../modules/careers/types';

const CSV_PATH = path.resolve(__dirname, '../../../../research/data/student_dataset_500_development.csv');

// Define Ablation Experiments
const EXPERIMENTS = [
  { id: 'A', name: 'Interest Only', weights: { SKILLS: 0, INTERESTS: 1, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
  { id: 'B', name: 'Skills Only', weights: { SKILLS: 1, INTERESTS: 0, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
  { id: 'C', name: 'Skills + Interests', weights: { SKILLS: 0.6, INTERESTS: 0.4, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
  { id: 'D', name: 'Skills + Interests + Academics', weights: { SKILLS: 0.5, INTERESTS: 0.3, ACADEMIC: 0.2, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
  { id: 'E', name: 'Skills + Interests + Academics + Projects', weights: { SKILLS: 0.4, INTERESTS: 0.3, ACADEMIC: 0.15, PROJECTS: 0.15, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 } },
  { id: 'F', name: 'Full Proposed Model', weights: {} }
];

function parseCSVLine(headers: string[], line: string) {
  const values = line.split(',');
  const row: Record<string, string> = {};
  headers.forEach((h, i) => { row[h.trim()] = values[i]?.trim(); });
  return row;
}

function mapRowToProfile(row: Record<string, string>): { profile: StudentRecommendationProfile, targetLabel: string } {
  const targetLabel = row['career_preference'] || 'Unknown';
  const profile: StudentRecommendationProfile = {
    personal: { branch: row['branch'] || 'Unknown', degree: 'B.Tech', specialization: '' },
    academic: { cgpa: parseFloat(row['cgpa'] || '0') },
    yearStage: {
      year: parseInt(row['year'] || '1', 10), semester: parseInt(row['semester'] || '1', 10),
      isExploratory: parseInt(row['year'] || '1', 10) <= 2, isPlacementReady: parseInt(row['year'] || '1', 10) > 2
    },
    skills: {}, interests: {}, projects: [], certifications: [],
    codingEvidence: { platforms: [], totalProblemsSolved: 0, maxRating: 0 },
    careerGoals: { targetRole: targetLabel !== 'Unknown' ? targetLabel : '', targetIndustry: '' }
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

function normalize(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

function calculateMetrics(predictions: {target: string, top5: string[]}[]): any {
  let t1=0, t3=0, t5=0;
  const confusion: Record<string, {tp:number, fp:number, fn:number}> = {};
  
  for (const p of predictions) {
    if (!confusion[p.target]) confusion[p.target] = {tp:0, fp:0, fn:0};
    const pred1 = p.top5[0];
    if (!confusion[pred1]) confusion[pred1] = {tp:0, fp:0, fn:0};
    
    if (p.top5.slice(0,1).includes(p.target)) t1++;
    if (p.top5.slice(0,3).includes(p.target)) t3++;
    if (p.top5.slice(0,5).includes(p.target)) t5++;

    if (pred1 === p.target) confusion[p.target].tp++;
    else { confusion[pred1].fp++; confusion[p.target].fn++; }
  }

  let totalP=0, totalR=0, validClasses=0;
  for (const k in confusion) {
    const c = confusion[k];
    if (c.tp+c.fp+c.fn === 0) continue;
    totalP += c.tp+c.fp === 0 ? 0 : c.tp/(c.tp+c.fp);
    totalR += c.tp+c.fn === 0 ? 0 : c.tp/(c.tp+c.fn);
    validClasses++;
  }
  const macroP = validClasses ? totalP/validClasses : 0;
  const macroR = validClasses ? totalR/validClasses : 0;
  const macroF1 = (macroP+macroR)===0 ? 0 : 2*macroP*macroR/(macroP+macroR);

  return {
    top1: t1/predictions.length,
    top3: t3/predictions.length,
    top5: t5/predictions.length,
    macroP, macroR, macroF1,
    confusion
  };
}

async function run() {
  const csv = fs.readFileSync(CSV_PATH, 'utf-8').trim().split('\n');
  const headers = csv[0].split(',');
  const rows = csv.slice(1).map(l => parseCSVLine(headers, l)).filter(r => r.career_preference && r.career_preference !== 'Unknown');
  
  // Create 5 Folds
  const numFolds = 5;
  const foldSize = Math.floor(rows.length / numFolds);
  const folds = [];
  for(let i=0; i<numFolds; i++) {
    folds.push(rows.slice(i*foldSize, i===numFolds-1 ? rows.length : (i+1)*foldSize));
  }

  const results = { ablation: {}, perCareer: {}, runtime: 0, errors: [] };
  
  // Runtime tracking
  let totalTime = 0;
  let totalInf = 0;

  for (const exp of EXPERIMENTS) {
    console.log(`Evaluating ${exp.name}...`);
    const foldMetrics = [];
    let allPredictions = [];
    
    for (let f=0; f<numFolds; f++) {
      const foldData = folds[f];
      const preds = [];
      for (const row of foldData) {
        const { profile, targetLabel } = mapRowToProfile(row);
        const normTarget = normalize(targetLabel);
        
        const start = Date.now();
        const recs = await RecommendationEngineService.generateRecommendations(profile, exp.weights);
        totalTime += (Date.now() - start);
        totalInf++;

        const top5 = recs.slice(0,5).map(r => normalize(r.careerName));
        preds.push({ target: normTarget, top5 });
        allPredictions.push({ target: normTarget, top5, origTarget: targetLabel, origPred: recs[0]?.careerName });
      }
      foldMetrics.push(calculateMetrics(preds));
    }

    const getStats = (key: string) => {
      const vals = foldMetrics.map(m => m[key]);
      const mean = vals.reduce((a,b)=>a+b,0)/numFolds;
      const std = Math.sqrt(vals.reduce((a,b)=>a+Math.pow(b-mean,2),0)/numFolds);
      return { mean, std };
    };

    results.ablation[exp.id] = {
      name: exp.name,
      top1: getStats('top1'),
      top3: getStats('top3'),
      top5: getStats('top5'),
      macroP: getStats('macroP'),
      macroR: getStats('macroR'),
      macroF1: getStats('macroF1')
    };

    if (exp.id === 'F') {
      const careerStats = {};
      for (const p of allPredictions) {
        if (!careerStats[p.origTarget]) careerStats[p.origTarget] = { count: 0, hits: 0 };
        careerStats[p.origTarget].count++;
        if (normalize(p.origTarget) === p.top5[0]) careerStats[p.origTarget].hits++;
        else {
           results.errors.push({ actual: p.origTarget, predicted: p.origPred });
        }
      }
      results.perCareer = careerStats;
    }
  }

  results.runtime = totalTime / totalInf;
  fs.writeFileSync('research_results.json', JSON.stringify(results, null, 2));
  console.log('Done!');
}
run();
