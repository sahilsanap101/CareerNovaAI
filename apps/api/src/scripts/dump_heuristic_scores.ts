import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../modules/careers/services/recommendationEngine.service';
import { StudentRecommendationProfile } from '../modules/careers/types';

const CSV_PATH = path.resolve(__dirname, '../../../../research/data/evaluation/student_dataset_500_development.csv');
const OUTPUT_PATH = path.resolve(__dirname, '../../../../research/results/heuristic_scores.json');

const EXPERIMENTS = [
  { id: 'full', weights: {} },
  { id: 'equal', weights: { SKILLS: 0.1428, INTERESTS: 0.1428, ACADEMIC: 0.1428, PROJECTS: 0.1428, CERTIFICATIONS: 0.1428, CODING: 0.1428, GOALS: 0.1428 } },
  { id: 'no_skills', weights: { SKILLS: 0, INTERESTS: 0.166, ACADEMIC: 0.166, PROJECTS: 0.166, CERTIFICATIONS: 0.166, CODING: 0.166, GOALS: 0.166 } },
  { id: 'no_interests', weights: { SKILLS: 0.166, INTERESTS: 0, ACADEMIC: 0.166, PROJECTS: 0.166, CERTIFICATIONS: 0.166, CODING: 0.166, GOALS: 0.166 } },
  { id: 'no_projects', weights: { SKILLS: 0.166, INTERESTS: 0.166, ACADEMIC: 0.166, PROJECTS: 0, CERTIFICATIONS: 0.166, CODING: 0.166, GOALS: 0.166 } },
  { id: 'no_academics', weights: { SKILLS: 0.166, INTERESTS: 0.166, ACADEMIC: 0, PROJECTS: 0.166, CERTIFICATIONS: 0.166, CODING: 0.166, GOALS: 0.166 } },
  { id: 'no_certs', weights: { SKILLS: 0.166, INTERESTS: 0.166, ACADEMIC: 0.166, PROJECTS: 0.166, CERTIFICATIONS: 0, CODING: 0.166, GOALS: 0.166 } },
  { id: 'no_coding', weights: { SKILLS: 0.166, INTERESTS: 0.166, ACADEMIC: 0.166, PROJECTS: 0.166, CERTIFICATIONS: 0.166, CODING: 0, GOALS: 0.166 } },
  { id: 'no_goals', weights: { SKILLS: 0.166, INTERESTS: 0.166, ACADEMIC: 0.166, PROJECTS: 0.166, CERTIFICATIONS: 0.166, CODING: 0.166, GOALS: 0 } },
  { id: 'no_stage_weight', weights: {}, disableStageWeighting: true } // Handled manually below
];

function parseCSVLine(headers: string[], line: string) {
  const values = line.split(',');
  const row: Record<string, string> = {};
  headers.forEach((h, i) => { row[h.trim()] = values[i]?.trim(); });
  return row;
}

function mapRowToProfile(row: Record<string, string>): { profile: StudentRecommendationProfile, targetLabel: string } {
  const targetLabel = row['career_preference'] || 'Unknown';
  // FIXING THE LEAKAGE: targetRole is strictly an empty string
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

  return { profile, targetLabel };
}

async function run() {
  const csv = fs.readFileSync(CSV_PATH, 'utf-8').trim().split('\n');
  const headers = csv[0].split(',');
  const rows = csv.slice(1).map(l => parseCSVLine(headers, l)).filter(r => r.career_preference && r.career_preference !== 'Unknown');
  
  const allResults: any = {};
  
  for (const exp of EXPERIMENTS) {
    console.log(`Running experiment ${exp.id}...`);
    const expResults = [];
    
    for (const row of rows) {
      let { profile, targetLabel } = mapRowToProfile(row);
      
      if (exp.disableStageWeighting) {
        profile.yearStage.isExploratory = false;
        profile.yearStage.isPlacementReady = false;
      }
      
      const recs = await RecommendationEngineService.generateRecommendations(profile, exp.weights);
      expResults.push({
        studentId: row['student_id'],
        targetLabel: targetLabel.toLowerCase(),
        recommendations: recs.map(r => ({ careerName: r.careerName.toLowerCase(), score: r.finalScore }))
      });
    }
    allResults[exp.id] = expResults;
  }
  
  // Create results dir if not exists
  const resDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(resDir)) {
      fs.mkdirSync(resDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allResults, null, 2));
  console.log(`Scores dumped to ${OUTPUT_PATH}`);
}

run();
