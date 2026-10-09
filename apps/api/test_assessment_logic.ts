import { CombinedRecommendationService } from './src/modules/careers/services/combinedRecommendation.service';
import { assessmentData } from './src/modules/profile/services/assessment.data';

const student = {
  studentId: 'test1',
  skills: { 'SK_net_asp_net_core': { proficiency: 4, confidence: 90 } },
  interests: {},
  academic: { degree: 'B.Tech', branch: 'CSE', cgpa: 8.5 },
  projects: [],
  certifications: [],
  codingEvidence: { totalProblemsSolved: 50, activePlatforms: [] },
  yearStage: { year: 4, semester: 8, isExploratory: false, isPlacementReady: true },
  careerGoals: { targetRole: 'Backend Developer', targetIndustry: 'Tech', preferredCountries: 'India', preferredWorkMode: 'REMOTE', aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false } }
};

const assessmentResponses = [
  { questionId: 'Q1', selectedValue: 'Q1_O2' },
  { questionId: 'Q2', selectedValue: 'Q2_O1' }
];

async function run() {
  const q1 = assessmentData.find((q: any) => q.id === 'Q1');
  const option = q1?.options.find((o: any) => o.value === 'Q1_O2');
  
  const recs = await CombinedRecommendationService.recommendCareers(student, assessmentResponses);
  const backendRec = recs.find(r => r.careerName === 'Backend Developer');
  
  console.log("Question ID: Q1");
  console.log("Selected Option: Q1_O2");
  console.log("Option Career Weights:", option?.careerWeights);
  console.log("Assessment Score for Backend Developer:", backendRec?.assessmentScore);
  console.log("Final Combined Score:", backendRec?.finalScore);
}

run().catch(console.error);
