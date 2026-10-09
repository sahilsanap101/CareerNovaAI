import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { RecommendationEngineService } from '../modules/careers/services/recommendationEngine.service';
import { StudentRecommendationProfile } from '../modules/careers/types';

async function run() {
  const baseDir = path.resolve(__dirname, '../../../../');
  const conditions = ['A', 'B', 'C'];
  
  // Load Assessment Questions
  const questionsPath = path.join(baseDir, 'research/data/collection/career_assessment_questions_v1.json');
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  
  // Load Career Subset
  const subsetPath = path.join(baseDir, 'research/data/synthetic_v3/synthetic_v3_career_subset_v1.json');
  const subset = JSON.parse(fs.readFileSync(subsetPath, 'utf-8'));
  const subsetNames = subset.map((c: any) => c.career_name);
  
  const likertMultipliers: Record<string, number> = {
    "1": 0.0,
    "2": 0.25,
    "3": 0.5,
    "4": 0.75,
    "5": 1.0
  };
  
  const allResults = [];
  
  for (const c of conditions) {
    console.log(`Processing condition ${c}...`);
    const csvPath = path.join(baseDir, `research/data/synthetic_v3/synthetic_v3_${c}_split.csv`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true });
    
    for (const rec of records as any) {
      const profile: StudentRecommendationProfile = JSON.parse(rec.profile_json);
      const studentId = rec.student_id;
      const split = rec.split;
      const target = rec.career_suitability;
      
      // Calculate Profile Scores P(u,c)
      const pResults = await RecommendationEngineService.generateRecommendations(profile);
      const pScoreMap = new Map();
      for (const res of pResults) {
        if (subsetNames.includes(res.careerName)) {
          pScoreMap.set(res.careerName, res.finalScore);
        }
      }
      
      // Calculate Assessment Scores Q(u,c)
      const qScoreMap = new Map();
      for (const careerName of subsetNames) {
        let rawScore = 0;
        let maxScore = 0;
        
        for (let qIdx = 0; qIdx < 20; qIdx++) {
            const qKey = `assessment_q${String(qIdx+1).padStart(2, '0')}`;
            const userResp = String(rec[qKey]);
            const qDef = questions[qIdx];
            
            const mult = likertMultipliers[userResp] ?? 0.0;
            const w = (qDef.career_weights || qDef.careerWeights)[careerName] || 0.0;
            
            rawScore += mult * w;
            maxScore += 1.0;
        }
        const finalQ = maxScore > 0 ? (rawScore / maxScore) * 100 : 0;
        qScoreMap.set(careerName, finalQ);
      }
      
      // Save all career scores for this user
      for (const careerName of subsetNames) {
        const pScore = pScoreMap.get(careerName) || 0;
        const qScore = qScoreMap.get(careerName) || 0;
        allResults.push({
          student_id: studentId,
          condition: c,
          split: split,
          career_name: careerName,
          ground_truth: target === careerName ? 1 : 0,
          p_score: pScore,
          q_score: qScore
        });
      }
    }
  }
  
  // Dump to CSV
  const header = "student_id,condition,split,career_name,ground_truth,p_score,q_score\n";
  const body = allResults.map(r => `${r.student_id},${r.condition},${r.split},"${r.career_name}",${r.ground_truth},${r.p_score},${r.q_score}`).join('\n');
  fs.writeFileSync(path.join(baseDir, 'scratch/synthetic_v3_raw_scores.csv'), header + body);
  console.log("Dumped raw scores.");
}

run().catch(console.error);
