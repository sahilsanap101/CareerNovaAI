import { FeatureExtractionService } from '../services/featureExtraction.service';

const baseUser = {
  id: 'test-user-id',
  fullName: 'Test User',
  email: 'test@example.com',
  password: 'hashed',
  role: 'STUDENT' as const,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const profiles = {
  empty: {
    ...baseUser,
    profile: null,
    skills: [],
    interests: [],
    projects: [],
    certifications: [],
    codingPlatforms: [],
    careerGoal: null,
  },
  firstYear: {
    ...baseUser,
    profile: {
      id: 'p1', userId: 'test-user-id', college: 'IIT', university: 'IIT', degree: 'B.Tech',
      branch: 'CS', specialization: null, currentYear: 1, currentSemester: 2, graduationYear: 2029,
      cgpa: 9.0, bio: null, profileImage: null, city: null, country: null, gender: null, category: null,
      createdAt: new Date(), updatedAt: new Date(),
    },
    skills: [
      { id: 'us1', userId: 'test-user-id', skillId: 's1', proficiency: 2, experienceMonths: 6, confidence: 60, lastUpdated: new Date(), skill: { id: 's1', name: 'Python', canonicalName: 'Python', category: 'General', aliases: [], difficulty: 2, description: null, createdAt: new Date() } }
    ],
    interests: [],
    projects: [],
    certifications: [],
    codingPlatforms: [],
    careerGoal: null,
  },
  fourthYear: {
    ...baseUser,
    profile: {
      id: 'p4', userId: 'test-user-id', college: 'IIT', university: 'IIT', degree: 'B.Tech',
      branch: 'CS', specialization: null, currentYear: 4, currentSemester: 8, graduationYear: 2026,
      cgpa: 8.5, bio: null, profileImage: null, city: null, country: null, gender: null, category: null,
      createdAt: new Date(), updatedAt: new Date(),
    },
    skills: [],
    interests: [],
    projects: [],
    certifications: [],
    codingPlatforms: [],
    careerGoal: null,
  },
  strongAI: {
    ...baseUser,
    profile: {
      id: 'p-ai', userId: 'test-user-id', college: 'IIT', university: 'IIT', degree: 'B.Tech',
      branch: 'CS', specialization: 'AI & Data Science', currentYear: 4, currentSemester: 7, graduationYear: 2026,
      cgpa: 9.2, bio: null, profileImage: null, city: null, country: null, gender: null, category: null,
      createdAt: new Date(), updatedAt: new Date(),
    },
    skills: [
      { id: 'us1', userId: 'test-user-id', skillId: 's1', proficiency: 4, experienceMonths: 24, confidence: 80, lastUpdated: new Date(), skill: { id: 's1', name: 'Python', canonicalName: 'Python', category: 'General', aliases: [], difficulty: 3, description: null, createdAt: new Date() } },
      { id: 'us2', userId: 'test-user-id', skillId: 's2', proficiency: 3, experienceMonths: 12, confidence: 70, lastUpdated: new Date(), skill: { id: 's2', name: 'TensorFlow', canonicalName: 'TensorFlow', category: 'General', aliases: [], difficulty: 4, description: null, createdAt: new Date() } },
      { id: 'us3', userId: 'test-user-id', skillId: 's3', proficiency: 4, experienceMonths: 18, confidence: 85, lastUpdated: new Date(), skill: { id: 's3', name: 'Machine Learning', canonicalName: 'Machine Learning', category: 'General', aliases: [], difficulty: 4, description: null, createdAt: new Date() } }
    ],
    interests: [],
    projects: [
      { id: 'proj1', userId: 'test-user-id', title: 'Cancer Detection CNN', description: 'Used PyTorch and ResNet', technologies: 'Python, PyTorch, CNN, Medical Imaging', githubUrl: null, demoUrl: null, completionStatus: 'COMPLETED', createdAt: new Date(), updatedAt: new Date() }
    ],
    certifications: [],
    codingPlatforms: [],
    careerGoal: {
      id: 'cg-ai', userId: 'test-user-id', preferredJobRole: 'Machine Learning Engineer', preferredIndustry: 'AI', preferredWorkMode: 'REMOTE' as const, preferredCountries: 'US', expectedSalary: '30 LPA', higherStudies: true, entrepreneurship: false, governmentJobs: false, startup: false, research: true, updatedAt: new Date()
    },
  },
  strongWeb: {
    ...baseUser,
    profile: {
      id: 'p-web', userId: 'test-user-id', college: 'IIT', university: 'IIT', degree: 'B.Tech',
      branch: 'IT', specialization: 'Software Eng', currentYear: 3, currentSemester: 6, graduationYear: 2027,
      cgpa: 8.8, bio: null, profileImage: null, city: null, country: null, gender: null, category: null,
      createdAt: new Date(), updatedAt: new Date(),
    },
    skills: [
      { id: 'us1', userId: 'test-user-id', skillId: 's4', proficiency: 5, experienceMonths: 36, confidence: 95, lastUpdated: new Date(), skill: { id: 's4', name: 'JavaScript', canonicalName: 'JavaScript', category: 'General', aliases: [], difficulty: 3, description: null, createdAt: new Date() } },
      { id: 'us2', userId: 'test-user-id', skillId: 's5', proficiency: 4, experienceMonths: 24, confidence: 90, lastUpdated: new Date(), skill: { id: 's5', name: 'React', canonicalName: 'React', category: 'General', aliases: [], difficulty: 4, description: null, createdAt: new Date() } },
      { id: 'us3', userId: 'test-user-id', skillId: 's6', proficiency: 4, experienceMonths: 24, confidence: 85, lastUpdated: new Date(), skill: { id: 's6', name: 'Node.js', canonicalName: 'Node.js', category: 'General', aliases: [], difficulty: 4, description: null, createdAt: new Date() } }
    ],
    interests: [],
    projects: [
      { id: 'proj2', userId: 'test-user-id', title: 'E-commerce platform', description: 'MERN stack app', technologies: 'MongoDB, Express, React, Node.js', githubUrl: null, demoUrl: null, completionStatus: 'COMPLETED', createdAt: new Date(), updatedAt: new Date() }
    ],
    certifications: [],
    codingPlatforms: [
      { id: 'cp1', userId: 'test-user-id', platform: 'LeetCode', username: 'webdev1', problemsSolved: 350, createdAt: new Date(), updatedAt: new Date() }
    ],
    careerGoal: null,
  }
};

async function runTests() {
  console.log('🧪 Running Feature Extraction Tests\n');

  for (const [name, profile] of Object.entries(profiles)) {
    console.log(`\n--- Test Case: ${name} ---`);
    const extracted = FeatureExtractionService.extractFeatures(profile as any);
    console.log(JSON.stringify(extracted, null, 2));
  }

  console.log('\n✅ All tests executed successfully.');
}

runTests();
