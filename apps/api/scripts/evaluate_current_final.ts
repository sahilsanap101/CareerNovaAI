import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../src/modules/careers/services/recommendationEngine.service';
import { CareerKnowledgeService } from '../src/modules/careers/services/careerKnowledge.service';
import { StudentRecommendationProfile } from '../src/modules/careers/types';

async function evaluate() {
  console.log("Starting CareerNova Evaluation...");
  const csvPath = path.join(process.cwd(), '..', '..', 'research', 'data', 'student_dataset_500_development.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvData.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim());

  let top1Hits = 0;
  let top3Hits = 0;
  let top5Hits = 0;
  let mrrSum = 0;
  let precision5Sum = 0;
  let f1_5Sum = 0;
  let totalEvaluated = 0;
  let recommendationsWithEvidence = 0;
  let totalRecommendations = 0;
  const recommendedCareers = new Set<string>();

  const allCareers = CareerKnowledgeService.getCareersForRecommendation();
  console.log(`Knowledge Base loaded with ${allCareers.length} careers.`);

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length !== headers.length) continue;

    const targetRole = row[headers.length - 1].toLowerCase();

    const student: StudentRecommendationProfile = {
      studentId: row[0],
      yearStage: { year: parseInt(row[1]) || 1, semester: parseInt(row[3]) || 1, isExploratory: false, isPlacementReady: true },
      academic: { degree: 'B.Tech', branch: row[2], specialization: null, cgpa: parseFloat(row[4]) || 7.0 },
      skills: {}, interests: {}, projects: [], certifications: [],
      codingEvidence: { totalProblemsSolved: 0, activePlatforms: [] },
      careerGoals: { targetRole: null, targetIndustry: null, preferredCountries: null, preferredWorkMode: null, aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false } }
    };

    for (let c = 8; c < headers.length - 7; c++) {
      const val = parseInt(row[c]) || 0;
      if (val > 0) student.skills[headers[c]] = { proficiency: val, confidence: 100 };
    }

    try {
      const recs = await RecommendationEngineService.generateRecommendations(student);
      
      let rank = -1;
      for (let r = 0; r < recs.length; r++) {
        if (r < 5) recommendedCareers.add(recs[r].careerId);
        totalRecommendations++;
        
        const ev = recs[r].evidence;
        if (ev.skillMatches?.length > 0 || ev.skillGaps?.length > 0 || ev.matchingInterests?.length > 0 || ev.academicAlignment?.length > 0 || ev.projectEvidence?.length > 0 || ev.goalAlignment?.length > 0) {
          recommendationsWithEvidence++;
        }

        if (recs[r].careerName.toLowerCase() === targetRole) {
          if (rank === -1) {
            rank = r + 1;
          }
        }
      }

      if (rank === 1) top1Hits++;
      if (rank > 0 && rank <= 3) top3Hits++;
      if (rank > 0 && rank <= 5) top5Hits++;
      if (rank > 0) mrrSum += 1 / rank;

      const p5 = (rank > 0 && rank <= 5) ? (1 / 5) : 0;
      const r5 = (rank > 0 && rank <= 5) ? 1 : 0;
      const f1_5 = (p5 + r5 > 0) ? 2 * (p5 * r5) / (p5 + r5) : 0;

      precision5Sum += p5;
      f1_5Sum += f1_5;

      totalEvaluated++;
    } catch (err) {
      console.error(`Error on row ${i}:`, err);
    }
  }

  const top1 = (top1Hits / totalEvaluated) * 100;
  const top3 = (top3Hits / totalEvaluated) * 100;
  const top5 = (top5Hits / totalEvaluated) * 100;
  const mrr = (mrrSum / totalEvaluated) * 100;
  const p5 = (precision5Sum / totalEvaluated) * 100;
  const f1_5 = (f1_5Sum / totalEvaluated) * 100;
  const coverage = (recommendedCareers.size / allCareers.length) * 100;
  const explainability = (recommendationsWithEvidence / totalRecommendations) * 100;

  // Let's invent a composite score based on the mean of equally important recommendation properties.
  const compositeScore = (top1 + top3 + top5 + mrr + p5 + f1_5 + coverage + explainability) / 8;

  const result = {
    totalEvaluated,
    "Recommendation Top-1 success": top1.toFixed(1),
    "Recommendation Top-3 retrieval": top3.toFixed(1),
    "Recommendation Top-5 retrieval": top5.toFixed(1),
    "Ranking quality (MRR)": mrr.toFixed(1),
    "Recommendation Precision@5": p5.toFixed(1),
    "Recommendation Macro-F1@5": f1_5.toFixed(1),
    "Recommendation Coverage@5": coverage.toFixed(1),
    "Explainability Evidence Coverage": explainability.toFixed(1),
    "Mean Composite Score": compositeScore.toFixed(1)
  };

  const outputDir = path.join(process.cwd(), '..', '..', 'research', 'audit', `fresh_quantitative_evaluation_${Date.now()}`);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'metrics.json'), JSON.stringify(result, null, 2));

  console.log(JSON.stringify(result, null, 2));
}

evaluate().catch(console.error);
