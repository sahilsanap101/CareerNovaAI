import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../src/modules/careers/services/recommendationEngine.service';
import { CareerKnowledgeService } from '../src/modules/careers/services/careerKnowledge.service';
import { StudentRecommendationProfile } from '../src/modules/careers/types';

const CONTROLLED_CAREERS = new Set([
  'Data Analyst', 'Full Stack Developer', 'Cybersecurity Engineer', 'Software Engineer',
  'QA Engineer', 'NLP Engineer', 'Frontend Developer', 'DevOps Engineer', 'Data Engineer',
  'Cloud Engineer', 'Backend Developer', 'Computer Vision Engineer', 'Machine Learning Engineer',
  'MLOps Engineer', 'Data Scientist'
].map(c => c.toLowerCase()));

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function audit() {
  const csvPath = path.join(process.cwd(), '..', '..', 'research', 'data', 'student_dataset_500_development.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvData.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim());

  let correctMappingTop1 = 0;
  let leakedMappingTop1 = 0;
  let totalEvaluated = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length !== headers.length) continue;

    const targetRole = row[headers.length - 1]; // e.g. "Software Engineer"
    const targetNorm = normalize(targetRole);

    // Profile 1: Correct Mapping (No label leak)
    const prof1: StudentRecommendationProfile = {
      studentId: row[0],
      yearStage: { year: parseInt(row[1]) || 1, semester: parseInt(row[3]) || 1, isExploratory: false, isPlacementReady: true },
      academic: { degree: 'B.Tech', branch: row[2], specialization: null, cgpa: parseFloat(row[4]) || 7.0 },
      skills: {}, interests: {}, projects: [], certifications: [],
      codingEvidence: { totalProblemsSolved: 0, activePlatforms: [] },
      careerGoals: { targetRole: null, targetIndustry: null, preferredCountries: null, preferredWorkMode: null, aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false } }
    };

    // Profile 2: Leaked Label Mapping (Like ablation_study.ts)
    const prof2 = JSON.parse(JSON.stringify(prof1));
    prof2.careerGoals.targetRole = targetRole;

    // Map skills correctly for BOTH!
    for (let c = 8; c < headers.length - 7; c++) {
      const val = parseInt(row[c]) || 0;
      if (val > 0) {
        const key = headers[c];
        const canonical = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        prof1.skills[canonical] = { proficiency: val, confidence: 100 };
        prof2.skills[canonical] = { proficiency: val, confidence: 100 };
      }
    }

    const recs1 = await RecommendationEngineService.generateRecommendations(prof1);
    const recs2 = await RecommendationEngineService.generateRecommendations(prof2);

    if (normalize(recs1[0].careerName) === targetNorm) correctMappingTop1++;
    if (normalize(recs2[0].careerName) === targetNorm) leakedMappingTop1++;
    
    totalEvaluated++;
  }

  console.log(`Correct Mapping Top-1: ${((correctMappingTop1 / totalEvaluated) * 100).toFixed(1)}%`);
  console.log(`Leaked Mapping Top-1: ${((leakedMappingTop1 / totalEvaluated) * 100).toFixed(1)}%`);
}

audit().catch(console.error);
