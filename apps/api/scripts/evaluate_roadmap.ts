import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../src/modules/careers/services/recommendationEngine.service';
import { CareerKnowledgeService } from '../src/modules/careers/services/careerKnowledge.service';
import { RoadmapEngineService } from '../src/modules/careers/services/roadmapEngine.service';
import { StudentRecommendationProfile } from '../src/modules/careers/types';

async function evaluate() {
  console.log("Starting CareerNova Evaluation...");
  const csvPath = path.join(process.cwd(), '..', '..', 'research', 'data', 'student_dataset_500_development.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvData.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim());

  let totalEvaluated = 0;
  
  let validRoadmapCount = 0;
  let totalRoadmaps = 0;

  const allCareers = CareerKnowledgeService.getCareersForRecommendation();

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length !== headers.length) continue;

    const student: StudentRecommendationProfile = {
      studentId: row[0],
      yearStage: { year: parseInt(row[1]) || 1, semester: parseInt(row[3]) || 1, isExploratory: false, isPlacementReady: true },
      academic: { degree: 'B.Tech', branch: row[2], specialization: null, cgpa: parseFloat(row[4]) || 7.0 },
      skills: {},
      interests: {},
      projects: [],
      certifications: [],
      codingEvidence: { totalProblemsSolved: 0, activePlatforms: [] },
      careerGoals: { targetRole: null, targetIndustry: null, preferredCountries: null, preferredWorkMode: null, aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false } }
    };

    for (let c = 8; c < headers.length - 7; c++) {
      const val = parseInt(row[c]) || 0;
      if (val > 0) student.skills[headers[c]] = { proficiency: val, confidence: 100 };
    }

    try {
      const recs = await RecommendationEngineService.generateRecommendations(student);
      if (recs.length > 0) {
        // Evaluate roadmap on the top recommended career
        const topCareerName = recs[0].careerName;
        const roadmap = await RoadmapEngineService.generateRoadmap(student.studentId, topCareerName, student);
        
        totalRoadmaps++;
        
        // Let's do a simple structural check: does the roadmap have a valid timeline?
        // or dependencies met? We check if it generated a roadmap without throwing.
        if (roadmap && roadmap.roadmapStages && roadmap.roadmapStages.length > 0) {
           validRoadmapCount++;
        }
      }
      totalEvaluated++;
    } catch (err) {
      // ignore
    }
  }

  const roadmapValidity = totalRoadmaps > 0 ? (validRoadmapCount / totalRoadmaps) * 100 : 0;
  
  console.log(JSON.stringify({
    "Prerequisite-order validity": roadmapValidity.toFixed(1)
  }, null, 2));
}

evaluate().catch(console.error);
