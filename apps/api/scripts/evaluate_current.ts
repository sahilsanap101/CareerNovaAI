import fs from 'fs';
import path from 'path';
import { RecommendationEngineService, CareerRecommendationResult } from '../src/modules/careers/services/recommendationEngine.service';
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
  let totalEvaluated = 0;
  let recommendationsWithEvidence = 0;
  let totalRecommendations = 0;
  let requirementConsistencySum = 0;
  const recommendedCareers = new Set<string>();

  const allCareers = CareerKnowledgeService.getCareersForRecommendation();
  console.log(`Knowledge Base loaded with ${allCareers.length} careers.`);

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length !== headers.length) continue;

    const targetRole = row[headers.length - 1].toLowerCase();

    const student: StudentRecommendationProfile = {
      studentId: row[0],
      yearStage: {
        year: parseInt(row[1]) || 1,
        semester: parseInt(row[3]) || 1,
        isExploratory: (parseInt(row[1]) || 1) <= 2,
        isPlacementReady: (parseInt(row[1]) || 1) >= 3,
      },
      academic: {
        degree: 'B.Tech',
        branch: row[2],
        specialization: null,
        cgpa: parseFloat(row[4]) || 7.0,
      },
      skills: {},
      interests: {},
      projects: [],
      certifications: [],
      codingEvidence: { totalProblemsSolved: 0, activePlatforms: [] },
      careerGoals: {
        targetRole: null,
        targetIndustry: null,
        preferredCountries: null,
        preferredWorkMode: null,
        aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false }
      }
    };

    for (let c = 8; c < headers.length - 7; c++) {
      const skillName = headers[c];
      const val = parseInt(row[c]) || 0;
      if (val > 0) {
        student.skills[skillName] = { proficiency: val, confidence: 100 };
      }
    }

    try {
      const recs = await RecommendationEngineService.generateRecommendations(student);
      
      let rank = -1;
      for (let r = 0; r < recs.length; r++) {
        recommendedCareers.add(recs[r].careerId);
        totalRecommendations++;
        
        const ev = recs[r].evidence;
        if (ev.skillMatches?.length > 0 || ev.skillGaps?.length > 0 || ev.matchingInterests?.length > 0 || ev.academicAlignment?.length > 0) {
          recommendationsWithEvidence++;
        }

        if (recs[r].careerName.toLowerCase() === targetRole) {
          rank = r + 1;
        }
      }

      if (rank === 1) top1Hits++;
      if (rank > 0 && rank <= 3) top3Hits++;
      if (rank > 0 && rank <= 5) top5Hits++;
      if (rank > 0) mrrSum += 1 / rank;
      
      const topCareer = allCareers.find(c => c.id === recs[0].careerId);
      if (topCareer) {
        const totalReq = topCareer.requiredSkills.length;
        const totalMapped = (recs[0].evidence.skillMatches?.length || 0) + (recs[0].evidence.skillGaps?.length || 0);
        
        if (totalReq > 0) {
           requirementConsistencySum += (totalMapped / totalReq);
        }
      }

      totalEvaluated++;
    } catch (err) {
      console.error(`Failed on row ${i}:`, err);
    }
  }

  const top1 = (top1Hits / totalEvaluated) * 100;
  const top3 = (top3Hits / totalEvaluated) * 100;
  const top5 = (top5Hits / totalEvaluated) * 100;
  const mrr = (mrrSum / totalEvaluated) * 100;
  const coverage = (recommendedCareers.size / allCareers.length) * 100;
  const explainability = (recommendationsWithEvidence / totalRecommendations) * 100;
  const skillGapConsistency = (requirementConsistencySum / totalEvaluated) * 100;

  // Let's invent a composite score based on the mean of equally important recommendation properties.
  const compositeScore = (top1 + top3 + top5 + mrr + coverage + explainability + skillGapConsistency) / 7;

  console.log(JSON.stringify({
    totalEvaluated,
    "Recommendation Top-1 success": top1.toFixed(1),
    "Recommendation Top-3 retrieval": top3.toFixed(1),
    "Recommendation Top-5 retrieval": top5.toFixed(1),
    "Ranking quality (MRR)": mrr.toFixed(1),
    "Recommendation coverage": coverage.toFixed(1),
    "Explainability evidence coverage": explainability.toFixed(1),
    "Skill-gap consistency": skillGapConsistency.toFixed(1),
    "Mean Composite Score": compositeScore.toFixed(1)
  }, null, 2));

}

evaluate().catch(console.error);
