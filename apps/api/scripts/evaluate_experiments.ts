import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../src/modules/careers/services/recommendationEngine.service';
import { CareerKnowledgeService } from '../src/modules/careers/services/careerKnowledge.service';
import { StudentRecommendationProfile } from '../src/modules/careers/types';

const CONTROLLED_CAREERS = new Set([
  'Data Analyst',
  'Full Stack Developer',
  'Cybersecurity Engineer',
  'Software Engineer',
  'QA Engineer',
  'NLP Engineer',
  'Frontend Developer',
  'DevOps Engineer',
  'Data Engineer',
  'Cloud Engineer',
  'Backend Developer',
  'Computer Vision Engineer',
  'Machine Learning Engineer',
  'MLOps Engineer',
  'Data Scientist'
].map(c => c.toLowerCase()));

async function evaluate() {
  console.log("Starting Dual-Experiment Evaluation...");
  const csvPath = path.join(process.cwd(), '..', '..', 'research', 'data', 'evaluation', 'student_dataset_500_development.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvData.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim());

  CareerKnowledgeService.initialize(path.join(process.cwd(), '..', '..', 'research', 'data', 'temp_15'));
  const allCareers = CareerKnowledgeService.getCareersForRecommendation();
  console.log(`Knowledge Base loaded with ${allCareers.length} careers.`);

  const expA = {
    top1Hits: 0, top3Hits: 0, top5Hits: 0, mrrSum: 0, ndcg5Sum: 0,
    classStats: {} as Record<string, { tp: number, fp: number, fn: number }>
  };

  const expB = {
    top1Hits: 0, top3Hits: 0, top5Hits: 0, mrrSum: 0
  };

  let totalEvaluated = 0;
  
  // For coverage and explainability (calculated on Experiment B to show full system traits)
  const recommendedCareersTop5 = new Set<string>();
  const recommendedCareersAll = new Set<string>();
  let totalRecsTop5 = 0;
  let totalRecsAll = 0;
  let evCountTop5 = 0;
  let evCountAll = 0;

  for (const c of CONTROLLED_CAREERS) {
    expA.classStats[c] = { tp: 0, fp: 0, fn: 0 };
  }

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length !== headers.length) continue;

    const targetRole = row[headers.length - 1].toLowerCase();

    // Verify target role is in our controlled set. If not, it's a data anomaly but we evaluate anyway.
    if (!expA.classStats[targetRole]) {
      expA.classStats[targetRole] = { tp: 0, fp: 0, fn: 0 };
    }

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
      const recs = await RecommendationEngineService.generateRecommendations(student, { SKILLS: 1, INTERESTS: 0, ACADEMIC: 0, PROJECTS: 0, CERTIFICATIONS: 0, CODING: 0, GOALS: 0 });
      
      // Experiment B (Open 60-career)
      let rankB = -1;
      for (let r = 0; r < recs.length; r++) {
        recommendedCareersAll.add(recs[r].careerId);
        totalRecsAll++;
        const ev = recs[r].evidence;
        const hasEv = ev.skillMatches?.length > 0 || ev.skillGaps?.length > 0 || ev.matchingInterests?.length > 0 || ev.academicAlignment?.length > 0;
        if (hasEv) evCountAll++;

        if (r < 5) {
          recommendedCareersTop5.add(recs[r].careerId);
          totalRecsTop5++;
          if (hasEv) evCountTop5++;
        }

        if (recs[r].careerName.toLowerCase() === targetRole) {
          if (rankB === -1) rankB = r + 1;
        }
      }

      if (rankB === 1) expB.top1Hits++;
      if (rankB > 0 && rankB <= 3) expB.top3Hits++;
      if (rankB > 0 && rankB <= 5) expB.top5Hits++;
      if (rankB > 0) expB.mrrSum += 1 / rankB;


      // Experiment A (Controlled 15-career)
      const controlledRecs = recs.filter(r => CONTROLLED_CAREERS.has(r.careerName.toLowerCase()));
      let rankA = -1;
      for (let r = 0; r < controlledRecs.length; r++) {
        if (controlledRecs[r].careerName.toLowerCase() === targetRole) {
          if (rankA === -1) rankA = r + 1;
        }
      }

      if (rankA === 1) expA.top1Hits++;
      if (rankA > 0 && rankA <= 3) expA.top3Hits++;
      if (rankA > 0 && rankA <= 5) expA.top5Hits++;
      if (rankA > 0) {
        expA.mrrSum += 1 / rankA;
        if (rankA <= 5) {
          expA.ndcg5Sum += 1 / Math.log2(rankA + 1);
        }
      }

      // Macro Stats (Top-1 classification for precision/recall)
      if (controlledRecs.length > 0) {
        const top1Pred = controlledRecs[0].careerName.toLowerCase();
        if (top1Pred === targetRole) {
          expA.classStats[targetRole].tp++;
        } else {
          expA.classStats[targetRole].fn++;
          if (expA.classStats[top1Pred]) {
            expA.classStats[top1Pred].fp++;
          }
        }
      } else {
        expA.classStats[targetRole].fn++;
      }

      totalEvaluated++;
    } catch (err) {
      console.error(`Error on row ${i}:`, err);
    }
  }

  // Calculate Macro Precision, Recall, F1
  let macroPrecisionSum = 0;
  let macroRecallSum = 0;
  let macroF1Sum = 0;
  let classCount = 0;

  for (const c in expA.classStats) {
    if (!CONTROLLED_CAREERS.has(c)) continue; // Only evaluate on the 15 classes
    const stats = expA.classStats[c];
    const p = stats.tp + stats.fp > 0 ? stats.tp / (stats.tp + stats.fp) : 0;
    const r = stats.tp + stats.fn > 0 ? stats.tp / (stats.tp + stats.fn) : 0;
    const f1 = p + r > 0 ? 2 * p * r / (p + r) : 0;
    macroPrecisionSum += p;
    macroRecallSum += r;
    macroF1Sum += f1;
    classCount++;
  }

  const macroPrecision = (macroPrecisionSum / classCount) * 100;
  const macroRecall = (macroRecallSum / classCount) * 100;
  const macroF1 = (macroF1Sum / classCount) * 100;

  const result = {
    expA: {
      "Top-1 Recommendation Hit Rate": ((expA.top1Hits / totalEvaluated) * 100).toFixed(1),
      "Top-3 Recommendation Hit Rate": ((expA.top3Hits / totalEvaluated) * 100).toFixed(1),
      "Top-5 Recommendation Hit Rate": ((expA.top5Hits / totalEvaluated) * 100).toFixed(1),
      "Mean Reciprocal Rank (MRR)": ((expA.mrrSum / totalEvaluated) * 100).toFixed(1),
      "NDCG@5": ((expA.ndcg5Sum / totalEvaluated) * 100).toFixed(1),
      "Macro Precision": macroPrecision.toFixed(1),
      "Macro Recall": macroRecall.toFixed(1),
      "Macro-F1": macroF1.toFixed(1)
    },
    expB: {
      "Top-1 Recommendation Hit Rate": ((expB.top1Hits / totalEvaluated) * 100).toFixed(1),
      "Top-3 Recommendation Hit Rate": ((expB.top3Hits / totalEvaluated) * 100).toFixed(1),
      "Top-5 Recommendation Hit Rate": ((expB.top5Hits / totalEvaluated) * 100).toFixed(1),
      "Mean Reciprocal Rank (MRR)": ((expB.mrrSum / totalEvaluated) * 100).toFixed(1)
    },
    system: {
      "Catalog Coverage (Top-5)": ((recommendedCareersTop5.size / allCareers.length) * 100).toFixed(1),
      "Catalog Coverage (All scored)": ((recommendedCareersAll.size / allCareers.length) * 100).toFixed(1),
      "Evidence Availability (Top-5)": ((evCountTop5 / totalRecsTop5) * 100).toFixed(1),
      "Evidence Availability (All scored)": ((evCountAll / totalRecsAll) * 100).toFixed(1)
    }
  };

  const outputDir = path.join(process.cwd(), '..', '..', 'research', 'audit', `fresh_dual_experiment_${Date.now()}`);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'metrics.json'), JSON.stringify(result, null, 2));

  console.log(JSON.stringify(result, null, 2));
}

evaluate().catch(console.error);
