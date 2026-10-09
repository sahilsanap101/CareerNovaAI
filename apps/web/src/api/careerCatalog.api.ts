import { api } from './axiosInstance';

export interface CatalogSkill {
  name: string;
  canonical: string;
}

export interface CatalogCareer {
  id: string;
  name: string;
  domain: string;
  description: string;
  coreSkills: CatalogSkill[];
  importantSkills: CatalogSkill[];
  interests: string[];
  suitableStages: string[];
  prerequisites: string;
}

export interface TrendingJob {
  jobName: string;
  demand: string;
  openings: string;
  averageSalary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  whyTrending: string;
  whyCompaniesHire: string;
  whatToLearn: string;
  recommendedProjects: string;
  interviewPreparation: string;
  relevantPathforgeCareer: string;
  sources: string[];
  experienceLevel: string;
  topLocations: string[];
  relevanceToUser: string;
}

export const careerCatalogApi = {
  getCatalog: async (): Promise<CatalogCareer[]> => {
    const { data } = await api.get('/career-recommendation/catalog');
    return data.data; // PATHFORGE sends response inside `data` property of `sendSuccess`
  },
  getTrendingJobs: async (): Promise<TrendingJob[]> => {
    const { data } = await api.get('/career-recommendation/trending', {
      timeout: 120_000, // 2 minutes for AI generation
    });
    return data.data;
  }
};
