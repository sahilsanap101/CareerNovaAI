import { api } from './axiosInstance';

export interface CareerRecommendation {
  careerId: string;
  careerName: string;
  domain: string;
  profileScore: number;
  assessmentScore: number;
  combinedScore: number;
  rank: number;
  matchedProfileEvidence: string[];
  matchedAssessmentEvidence: string[];
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
}

export interface CareerRecommendationResponse {
  recommendations: CareerRecommendation[];
  strategyMessage: string;
  generatedAt: string;
  profileCompleteness: number;
}

export interface HistoryTimelineItem {
  id: string;
  createdAt: string;
  version: string;
  topCareerName: string;
  topCareerScore: number;
}

export interface RecommendationSnapshot {
  id: string;
  createdAt: string;
  profile: any; // Simplified for typing
  recommendations: CareerRecommendation[];
}

export const careerRecommendationApi = {
  getRecommendations: async (): Promise<CareerRecommendationResponse> => {
    const { data } = await api.get('/career-recommendation/recommendations');
    return data.data; // PATHFORGE sends response inside `data` property of `sendSuccess`
  },
  getHistory: async (): Promise<HistoryTimelineItem[]> => {
    const { data } = await api.get('/career-recommendation/history');
    return data.data;
  },
  getSnapshot: async (id: string): Promise<RecommendationSnapshot> => {
    const { data } = await api.get(`/career-recommendation/history/${id}`);
    return data.data;
  },
  getRoadmap: async (careerId: string): Promise<any> => {
    const { data } = await api.get(`/career-recommendation/${encodeURIComponent(careerId)}/roadmap`);
    return data.data;
  },
  getUserRoadmaps: async (): Promise<any[]> => {
    const { data } = await api.get('/career-recommendation/my-roadmaps');
    return data.data;
  }
};
