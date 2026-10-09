import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../src/modules/careers/services/recommendationEngine.service';
import { CareerKnowledgeService } from '../src/modules/careers/services/careerKnowledge.service';

async function runInference() {
  console.log("Starting Fresh Inference on TEST set...");
  const baseDir = path.join(process.cwd(), '..', '..');
  
  // Load JSON inputs
  const inPath = path.join(baseDir, 'research', 'fresh_evaluation', 'data', 'test_inputs.json');
  const testRows = JSON.parse(fs.readFileSync(inPath, 'utf-8'));

  // Load Assessment Questions JSON
  const questionsPath = path.join(baseDir, 'research', 'data', 'collection', 'career_assessment_questions_v1.json');
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  
  const allCareers = CareerKnowledgeService.getCareersForRecommendation();
  const careerNames = allCareers.map((c: any) => c.name);

  const predictions = [];

  for (const row of testRows) {
    const profile = row.profile_json;
    
    // Evaluate Profile
    const profileRecs = await RecommendationEngineService.generateRecommendations(profile);
    const profileMap = new Map();
    for (const r of profileRecs) profileMap.set(r.careerName, r.finalScore);

    // Evaluate Assessment
    const assessmentMap = new Map();
    let maxPossibleScore = 0;
    
    const userAnswers: any[] = [];
    for (let q = 1; q <= 20; q++) {
        const val = row[`assessment_q${q.toString().padStart(2, '0')}`];
        userAnswers.push({ qId: `Q${q.toString().padStart(2, '0')}`, value: val });
    }

    for (let i = 0; i < 20; i++) {
        const qDef = questions.find((q: any) => q.question_id === userAnswers[i].qId);
        if (qDef) {
            maxPossibleScore += 1.0;
        }
    }

    for (const careerName of careerNames) {
        let rawScore = 0;
        for (let i = 0; i < 20; i++) {
            const qDef = questions.find((q: any) => q.question_id === userAnswers[i].qId);
            if (qDef) {
                const baseWeight = qDef.career_weights[careerName] || 0;
                // Map the 1-5 likert scale value to a multiplier just like assessment.service.ts
                const val = Number(userAnswers[i].value);
                const multiplier = isNaN(val) ? 0 : (val - 1) * 0.25; // 1 -> 0.0, 5 -> 1.0
                rawScore += baseWeight * multiplier;
            }
        }
        const aScore = maxPossibleScore > 0 ? (rawScore / maxPossibleScore) * 100 : 0;
        assessmentMap.set(careerName, aScore);
    }

    // Fusion
    const fusionMap = new Map();
    for (const careerName of careerNames) {
        const pScore = profileMap.get(careerName) || 0;
        const aScore = assessmentMap.get(careerName) || 0;
        fusionMap.set(careerName, pScore * 0.70 + aScore * 0.30);
    }

    // Ablations
    const ablations: Record<string, any> = {};
    const ab_weights = {
        'without_skills': { SKILLS: 0 },
        'without_interests': { INTERESTS: 0 },
        'without_projects': { PROJECTS: 0 },
        'without_academics': { ACADEMIC: 0 },
        'without_certifications': { CERTIFICATIONS: 0 },
        'without_coding': { CODING: 0 },
        'without_goals': { GOALS: 0 }
    };

    for (const [aName, aWeights] of Object.entries(ab_weights)) {
        const abRecs = await RecommendationEngineService.generateRecommendations(profile, aWeights);
        const abMap = new Map();
        for (const r of abRecs) abMap.set(r.careerName, r.finalScore);
        ablations[aName] = Object.fromEntries(abMap);
    }

    predictions.push({
        student_id: row.student_id,
        ground_truth: row.career_suitability,
        profile_scores: Object.fromEntries(profileMap),
        assessment_scores: Object.fromEntries(assessmentMap),
        fusion_scores: Object.fromEntries(fusionMap),
        ablations: ablations
    });
  }

  const outPath = path.join(baseDir, 'research', 'fresh_evaluation', '06_test_predictions.json');
  fs.writeFileSync(outPath, JSON.stringify(predictions));
  console.log(`Saved predictions to ${outPath}`);
}

runInference().catch(console.error);
