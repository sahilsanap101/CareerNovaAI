import { RecommendationEngineService } from '../services/recommendationEngine.service';
import { StudentRecommendationProfile } from '../types';

const baseProfile: StudentRecommendationProfile = {
  studentId: 'test',
  yearStage: { year: 3, semester: 5, isExploratory: false, isPlacementReady: true },
  academic: { degree: 'B.Tech', branch: 'Computer Science', specialization: null, cgpa: 8.5 },
  skills: {},
  interests: {},
  projects: [],
  certifications: [],
  codingEvidence: { totalProblemsSolved: 0, activePlatforms: [] },
  careerGoals: { targetRole: null, targetIndustry: null, preferredCountries: null, preferredWorkMode: null, aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false } }
};

const profiles: Record<string, StudentRecommendationProfile> = {
  perfectAI: {
    ...baseProfile,
    skills: {
      'Python': { proficiency: 5, confidence: 90 },
      'Machine Learning': { proficiency: 5, confidence: 90 },
      'PyTorch': { proficiency: 4, confidence: 80 },
      'TensorFlow': { proficiency: 4, confidence: 80 }
    },
    projects: [
      { title: 'AI Model', description: 'Deep learning', technologies: ['Python', 'PyTorch', 'CNN'] }
    ],
    codingEvidence: { totalProblemsSolved: 400, activePlatforms: ['LeetCode'] },
    careerGoals: { ...baseProfile.careerGoals, targetRole: 'AI Engineer' }
  },
  perfectWeb: {
    ...baseProfile,
    skills: {
      'JavaScript': { proficiency: 5, confidence: 90 },
      'React': { proficiency: 5, confidence: 90 },
      'Node.js': { proficiency: 5, confidence: 90 },
      'HTML/CSS': { proficiency: 4, confidence: 80 },
      'TypeScript': { proficiency: 4, confidence: 80 }
    },
    projects: [
      { title: 'E-commerce', description: 'Full stack app', technologies: ['React', 'Node.js', 'MongoDB'] }
    ],
    codingEvidence: { totalProblemsSolved: 350, activePlatforms: ['LeetCode'] },
    careerGoals: { ...baseProfile.careerGoals, targetRole: 'Full Stack Developer' }
  },
  perfectData: {
    ...baseProfile,
    skills: {
      'Python': { proficiency: 5, confidence: 90 },
      'SQL': { proficiency: 5, confidence: 90 },
      'Statistics': { proficiency: 4, confidence: 80 },
      'Data Analysis': { proficiency: 4, confidence: 80 }
    },
    projects: [
      { title: 'Data Dashboard', description: 'Analytics', technologies: ['Python', 'SQL', 'Pandas'] }
    ],
    careerGoals: { ...baseProfile.careerGoals, targetRole: 'Data Scientist' }
  },
  weakStudent: {
    ...baseProfile,
    academic: { ...baseProfile.academic, cgpa: 5.5 },
    skills: {
      'Python': { proficiency: 1, confidence: 10 }
    }
  },
  firstYear: {
    ...baseProfile,
    yearStage: { year: 1, semester: 2, isExploratory: true, isPlacementReady: false },
    academic: { ...baseProfile.academic, cgpa: 9.0 },
    skills: {
      'Python': { proficiency: 2, confidence: 50 }
    }
  },
  fourthYear: {
    ...baseProfile,
    yearStage: { year: 4, semester: 8, isExploratory: false, isPlacementReady: true },
    academic: { ...baseProfile.academic, cgpa: 8.0 },
    skills: {
      'Java': { proficiency: 4, confidence: 80 },
      'Spring Boot': { proficiency: 3, confidence: 70 }
    },
    codingEvidence: { totalProblemsSolved: 200, activePlatforms: ['HackerRank'] }
  },
  noInterests: {
    ...baseProfile,
    interests: {}
  },
  noProjects: {
    ...baseProfile,
    projects: []
  },
  unknownSkills: {
    ...baseProfile,
    skills: {
      'SomeRandomSkill': { proficiency: 5, confidence: 90 }
    }
  }
};

async function runTests() {
  console.log('🚀 Running Career Recommendation Engine Tests...\n');

  for (const [name, profile] of Object.entries(profiles)) {
    console.log(`\n========================================`);
    console.log(`Test Case: ${name}`);
    console.log(`========================================`);
    
    const recommendations = await RecommendationEngineService.generateRecommendations(profile);
    
    if (recommendations.length > 0) {
      console.log(`Top 3 Recommendations:`);
      for (let i = 0; i < 3; i++) {
        const r = recommendations[i];
        if (r) {
          console.log(`  #${r.rank} ${r.careerName} (Score: ${r.finalScore})`);
          if (r.evidence.skillMatches.length > 0) console.log(`    Top Skills: ${r.evidence.skillMatches.map(s => s.skill).slice(0, 3).join(', ')}`);
          if (r.evidence.skillGaps.length > 0) console.log(`    Missing: ${r.evidence.skillGaps.map(g => g.skill).slice(0, 3).join(', ')}`);
        }
      }
    } else {
      console.log('No recommendations found.');
    }
  }

  console.log('\n✅ All Engine Tests Completed.');
  process.exit(0);
}

runTests();
