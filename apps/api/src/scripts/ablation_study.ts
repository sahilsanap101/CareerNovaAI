// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { RecommendationEngineService } from '../modules/careers/services/recommendationEngine.service';
import { StudentRecommendationProfile } from '../modules/careers/types';
import { ByserWeights } from '../../config/byserWeights';

const prisma = new PrismaClient();
const CSV_PATH = path.resolve(__dirname, '../../../../research/data/student_dataset_500_development.csv');
const OUTPUT_PATH = path.resolve(__dirname, '../../../../research/evaluation/results/ablation_study_summary.md');

// Define Ablation Experiments
const EXPERIMENTS: { id: string; name: string; weights: Partial<ByserWeights> }[] = [
  {
    id: 'A',
    name: 'Interest Only',
    weights: { SKILLS: 0, INTERESTS: 1, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 }
  },
  {
    id: 'B',
    name: 'Skills Only',
    weights: { SKILLS: 1, INTERESTS: 0, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 }
  },
  {
    id: 'C',
    name: 'Skills + Interests',
    weights: { SKILLS: 0.6, INTERESTS: 0.4, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 }
  },
  {
    id: 'D',
    name: 'Skills + Interests + Academics',
    weights: { SKILLS: 0.5, INTERESTS: 0.3, ACADEMIC: 0.2, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 }
  },
  {
    id: 'E',
    name: 'Skills + Interests + Academics + Projects',
    weights: { SKILLS: 0.4, INTERESTS: 0.3, ACADEMIC: 0.15, PROJECTS: 0.15, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 }
  },
  {
    id: 'F',
    name: 'Full Proposed Model',
    weights: {} // Uses default BYSER_WEIGHTS which includes Certs, Coding, Goals
  }
];

function parseCSVLine(headers: string[], line: string) {
  const values = line.split(',');
  const row: Record<string, string> = {};
  headers.forEach((h, i) => {
    row[h.trim()] = values[i]?.trim();
  });
  return row;
}

function mapRowToProfile(row: Record<string, string>): { profile: StudentRecommendationProfile, targetLabel: string } {
  const targetLabel = row['career_preference'] || 'Unknown';
  const profile: StudentRecommendationProfile = {
    personal: { branch: row['branch'] || 'Unknown', degree: 'B.Tech', specialization: '' },
    academic: { cgpa: parseFloat(row['cgpa'] || '0') },
    yearStage: {
      year: parseInt(row['year'] || '1', 10),
      semester: parseInt(row['semester'] || '1', 10),
      isExploratory: parseInt(row['year'] || '1', 10) <= 2,
      isPlacementReady: parseInt(row['year'] || '1', 10) > 2
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

  const pCount = parseInt(row['projects_count'] || '0');
  for (let i = 0; i < pCount; i++) profile.projects.push({ title: `Synthetic Project ${i+1}`, domain: 'General', technologies: [] });
  const cCount = parseInt(row['certifications_count'] || '0');
  for (let i = 0; i < cCount; i++) profile.certifications.push({ title: `Synthetic Cert ${i+1}` });

  return { profile, targetLabel };
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function runAblationStudy() {
  console.log('Loading dataset...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8').trim().split('\n');
  const headers = csvContent[0].split(',');
  const rows = csvContent.slice(1).map(line => parseCSVLine(headers, line));
  
  let markdownReport = `# PATHFORGE Career Recommendation: Ablation Study\n\n`;
  markdownReport += `> [!WARNING]\n> **DEVELOPMENT / SYNTHETIC DATA**\n> This evaluation uses a synthetic target label (\`career_preference\`). It does not represent empirical human ground-truth hiring data.\n\n`;
  
  markdownReport += `## Reproducibility Context\n`;
  markdownReport += `- **Dataset:** \`student_dataset_500_development.csv\` (${rows.length} profiles)\n`;
  markdownReport += `- **Algorithm Version:** v1.0.0 (Weighted Hybrid)\n`;
  markdownReport += `- **Knowledge-Base Version:** v1.0.0 (15 Careers)\n`;
  markdownReport += `- **Timestamp:** ${new Date().toISOString()}\n\n`;
  
  for (const exp of EXPERIMENTS) {
    console.log(`\nRunning Experiment ${exp.id}: ${exp.name}`);
    
    let top1Hits = 0, top3Hits = 0, top5Hits = 0, totalValid = 0;
    
    // For Precision/Recall we look at Top-1 prediction as the "Classified" label
    // Maps: CareerName -> { TP, FP, FN }
    const confusion: Record<string, { tp: number, fp: number, fn: number }> = {};
    const scoreDistribution: Record<string, number> = { '90-100': 0, '70-89': 0, '50-69': 0, '<50': 0 };

    for (let i = 0; i < rows.length; i++) {
      const { profile, targetLabel } = mapRowToProfile(rows[i]);
      if (targetLabel === 'Unknown') continue;
      
      const normTarget = normalize(targetLabel);
      if (!confusion[normTarget]) confusion[normTarget] = { tp: 0, fp: 0, fn: 0 };
      
      totalValid++;
      const results = await RecommendationEngineService.generateRecommendations(profile, exp.weights);
      
      const isHit = (rankLimit: number) => results.slice(0, rankLimit).some(r => normalize(r.careerName) === normTarget);

      if (isHit(1)) top1Hits++;
      if (isHit(3)) top3Hits++;
      if (isHit(5)) top5Hits++;

      // Confusion Matrix Math based on Top-1
      const topPrediction = results[0];
      const normPred = normalize(topPrediction.careerName);
      if (!confusion[normPred]) confusion[normPred] = { tp: 0, fp: 0, fn: 0 };

      if (normPred === normTarget) {
        confusion[normTarget].tp++;
      } else {
        confusion[normPred].fp++;
        confusion[normTarget].fn++;
      }

      // Score distribution
      const s = topPrediction.finalScore;
      if (s >= 90) scoreDistribution['90-100']++;
      else if (s >= 70) scoreDistribution['70-89']++;
      else if (s >= 50) scoreDistribution['50-69']++;
      else scoreDistribution['<50']++;
    }

    // Global Metrics
    const t1 = ((top1Hits / totalValid) * 100).toFixed(1);
    const t3 = ((top3Hits / totalValid) * 100).toFixed(1);
    const t5 = ((top5Hits / totalValid) * 100).toFixed(1);

    // Macro Average Precision, Recall, F1
    let totalPrecision = 0, totalRecall = 0, validClasses = 0;
    for (const key of Object.keys(confusion)) {
      const { tp, fp, fn } = confusion[key];
      if (tp + fp + fn === 0) continue;
      
      const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
      const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
      
      totalPrecision += precision;
      totalRecall += recall;
      validClasses++;
    }
    
    const macroPrecision = validClasses ? totalPrecision / validClasses : 0;
    const macroRecall = validClasses ? totalRecall / validClasses : 0;
    const macroF1 = (macroPrecision + macroRecall) === 0 ? 0 : 2 * (macroPrecision * macroRecall) / (macroPrecision + macroRecall);

    markdownReport += `### Experiment ${exp.id}: ${exp.name}\n`;
    markdownReport += `**Weights:** \`${JSON.stringify(exp.weights)}\`\n\n`;
    markdownReport += `#### Global Metrics\n`;
    markdownReport += `- **Top-1 Accuracy:** ${t1}%\n`;
    markdownReport += `- **Top-3 Accuracy:** ${t3}%\n`;
    markdownReport += `- **Top-5 Accuracy:** ${t5}%\n`;
    markdownReport += `- **Macro Precision:** ${(macroPrecision*100).toFixed(1)}%\n`;
    markdownReport += `- **Macro Recall:** ${(macroRecall*100).toFixed(1)}%\n`;
    markdownReport += `- **Macro F1 Score:** ${(macroF1*100).toFixed(1)}%\n\n`;
    
    markdownReport += `#### Top-1 Score Distribution\n`;
    markdownReport += `- 90-100: ${scoreDistribution['90-100']} profiles\n`;
    markdownReport += `- 70-89: ${scoreDistribution['70-89']} profiles\n`;
    markdownReport += `- 50-69: ${scoreDistribution['50-69']} profiles\n`;
    markdownReport += `- <50: ${scoreDistribution['<50']} profiles\n\n`;
  }
  
  fs.writeFileSync(OUTPUT_PATH, markdownReport);
  console.log(`\nAblation Study complete! Report written to ${OUTPUT_PATH}`);
  process.exit(0);
}

runAblationStudy().catch(e => {
  console.error(e);
  process.exit(1);
});
