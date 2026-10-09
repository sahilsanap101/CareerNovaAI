export interface StudentRecommendationProfile {
  studentId: string;
  yearStage: {
    year: number; // 1, 2, 3, 4
    semester: number;
    isExploratory: boolean; // True if Year 1 or 2
    isPlacementReady: boolean; // True if Year 3 or 4
  };
  academic: {
    degree: string | null;
    branch: string | null;
    specialization: string | null;
    cgpa: number | null;
  };
  skills: Record<string, { // mapped by canonicalName
    proficiency: number; // normalized 1-5
    confidence: number;
  }>;
  interests: Record<string, { // mapped by interest ID
    priority: number;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
  }>;
  codingEvidence: {
    totalProblemsSolved: number;
    activePlatforms: string[];
  };
  careerGoals: {
    targetRole: string | null;
    targetIndustry: string | null;
    preferredCountries: string | null;
    preferredWorkMode: string | null;
    aspirations: {
      higherStudies: boolean;
      entrepreneurship: boolean;
      governmentJobs: boolean;
      startup: boolean;
      research: boolean;
    };
  };
}

export interface CareerDemandProfile {
  careerId: string;
  skill: string;
  demandScore: number; // normalized market demand (e.g. 0 to 100)
  source: 'DEVELOPMENT_CSV' | 'MARKET_API'; // To trace where the data came from
  timePeriod: string; // e.g. "Q3 2026"
}
