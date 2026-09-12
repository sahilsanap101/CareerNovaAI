import { api } from '@/api/axiosInstance';
import type { ApiResponse } from '@pathforge/shared-types';

export interface FactorBreakdown {
  id: string;
  factor: string;
  weight: number;
  score: number;
  explanation: string;
}

export interface RecommendationItem {
  id: string;
  careerPathId: string;
  totalScore: number;
  SGI: number;
  sgiCategory?: string;
  skillFit?: number;
  goalFit?: number;
  marketAlignment?: number;
  evidenceDate?: string;
  generatedAt: string;
  careerPath: {
    id: string;
    name: string;
    description: string;
    category: string;
    industry: string;
    icon?: string | null;
    color?: string | null;
    requiredSkills?: Array<{
      importanceWeight: number;
      skill: { id: string; name: string; category: string };
    }>;
  };
  factors?: FactorBreakdown[];
  explanation: {
    strengths: string[];
    areasToImprove: string[];
    missingSkills: Array<{
      id: string;
      name: string;
      category: string;
      importanceWeight: number;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  };
}

export interface AnalyticsData {
  readinessScore: number;
  totalSkillsCount: number;
  projectsCount: number;
  certificationsCount: number;
  skillCategories: Array<{ category: string; count: number }>;
  strengths: string[];
  weakAreas: string[];
  projectTechDistribution: Array<{ technology: string; count: number }>;
  interestsList: string[];
}

export const recommendationApi = {
  // Get Top 5 Recommendations
  getRecommendations: async (): Promise<RecommendationItem[]> => {
    const res = await api.get<ApiResponse<RecommendationItem[]>>('/recommendations');
    return res.data.data!;
  },

  // Generate fresh BYSER evaluation
  generateRecommendations: async (): Promise<RecommendationItem[]> => {
    const res = await api.post<ApiResponse<RecommendationItem[]>>('/recommendations/generate');
    return res.data.data!;
  },

  // Recommendation History
  getHistory: async () => {
    const res = await api.get<ApiResponse<RecommendationItem[]>>('/recommendations/history');
    return res.data.data!;
  },

  // Career Paths
  getCareerPaths: async () => {
    const res = await api.get<ApiResponse<Array<RecommendationItem['careerPath']>>>('/career-paths');
    return res.data.data!;
  },

  getCareerPathDetails: async (id: string) => {
    const res = await api.get<ApiResponse<RecommendationItem['careerPath']>>(`/career-paths/${id}`);
    return res.data.data!;
  },

  // Compare Career Paths
  compareCareerPaths: async (careerPathIds: string[]) => {
    const res = await api.post<ApiResponse<Array<{ careerPath: RecommendationItem['careerPath']; evaluation: RecommendationItem }>>>(
      '/career-paths/compare',
      { careerPathIds },
    );
    return res.data.data!;
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsData> => {
    const res = await api.get<ApiResponse<AnalyticsData>>('/analytics/profile');
    return res.data.data!;
  },
};
