import { ResearchDataRepository } from './src/research_core/data/research_data_repository';
import { SkillResolver } from './src/research_core/data/skill_resolver';
import { CompetencyFitEngine } from './src/research_core/evaluation/competency_fit_engine';
import { PreferenceFitEngine } from './src/research_core/evaluation/preference_fit_engine';
import { CareerRecommendationEngine } from './src/research_core/engine/career_recommendation_engine';
import { SkillGapEngine } from './src/research_core/evaluation/skill_gap_engine';
import { RoadmapEngine } from './src/research_core/engine/roadmap_engine';
import { DependencyEngine } from './src/research_core/data/dependency_engine';
import { StudentEvidence } from './src/research_core/evidence/student_evidence';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Loading system data...");
  const loader = ResearchDataRepository.getInstance();
  loader.load();
  const rawSkills = loader.getAllSkills();
  const resolver = new SkillResolver(rawSkills);
  const careers = loader.getAllCareers();

  console.log(`Loaded ${careers.length} careers and ${rawSkills.length} skills.`);

  const compEngine = new CompetencyFitEngine(resolver);
  const prefEngine = new PreferenceFitEngine(resolver);
  const wC = 0.7;
  const wP = 0.3;
  const engine = new CareerRecommendationEngine(compEngine, prefEngine, rawSkills, wC, wP);
  const gapEngine = new SkillGapEngine(resolver);
  const depEngine = new DependencyEngine(loader);
  const roadmapEngine = new RoadmapEngine();

  // Load CSV
  const csvPath = path.join(__dirname, '..', '..', 'research', 'data', 'student_dataset_500_development.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvData.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',');

  let top1Hits = 0;
  let top3Hits = 0;
  let top5Hits = 0;
  let mrrSum = 0;
  let totalEvaluated = 0;
  
  const recommendedCareers = new Set<string>();
  let totalValidReqs = 0;
  let totalValidDeps = 0;
  let validOrderCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length !== headers.length) continue;

    const evidence: StudentEvidence = {
      userId: row[0],
      context: {
        branch: row[2]
      },
      primaryCompetencies: [],
      preferences: {
        preferredRoles: [row[headers.length - 1].trim()], // career_preference
        preferredIndustries: [],
        interests: []
      },
      supportingEvidence: { projects: [], certifications: [], codingProfiles: [] },
      provenance: { generatedAt: new Date().toISOString(), source: 'CSV' }
    };

    // Add skills
    for (let c = 8; c < headers.length - 7; c++) {
      const skillName = headers[c];
      const val = parseInt(row[c], 10);
      if (val > 0) {
        let prof: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" = "BEGINNER";
        if (val === 2 || val === 3) prof = "INTERMEDIATE";
        if (val === 4) prof = "ADVANCED";
        if (val === 5) prof = "EXPERT";
        evidence.primaryCompetencies.push({
          skillName,
          proficiency: prof,
          experienceMonths: val * 6,
          confidence: 100
        });
      }
    }

    const recs = engine.rankCareers(careers, evidence, 10);
    const targetCareerName = row[headers.length - 1].trim().toLowerCase();
    
    let rank = -1;
    for (let r = 0; r < recs.length; r++) {
      recommendedCareers.add(recs[r].careerId);
      if (recs[r].careerName.toLowerCase() === targetCareerName) {
        rank = r + 1;
        break;
      }
    }

    if (rank === 1) top1Hits++;
    if (rank > 0 && rank <= 3) top3Hits++;
    if (rank > 0 && rank <= 5) top5Hits++;
    if (rank > 0) mrrSum += 1 / rank;

    totalEvaluated++;

    // Evaluate Roadmap on top-1 recommendation
    if (recs.length > 0) {
      const topCareer = careers.find(c => c.careerId === recs[0].careerId);
      if (topCareer) {
        const gapReport = gapEngine.analyzeGap(topCareer, evidence);
        const graph = depEngine.buildGraph(topCareer);
        const roadmap = roadmapEngine.generateRoadmap(topCareer, evidence, gapReport.traces, graph);
        totalValidReqs += roadmap.validation.dependencyViolations === 0 ? 1 : 0;
        totalValidDeps++;
      }
    }
  }

  const top1 = (top1Hits / totalEvaluated) * 100;
  const top3 = (top3Hits / totalEvaluated) * 100;
  const top5 = (top5Hits / totalEvaluated) * 100;
  const mrr = (mrrSum / totalEvaluated) * 100;
  const cov = (recommendedCareers.size / careers.length) * 100;
  const roadmapValidity = (totalValidReqs / totalValidDeps) * 100;

  const comp = (top1 + top3 + top5 + mrr + cov + roadmapValidity) / 6;

  console.log(JSON.stringify({
    totalEvaluated,
    top1,
    top3,
    top5,
    mrr,
    cov,
    roadmapValidity,
    comp
  }, null, 2));

}

main().catch(console.error);
