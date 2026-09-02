import { api } from '@/api/axiosInstance';
import type { ApiResponse } from '@pathforge/shared-types';

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  taskType: 'THEORY' | 'PRACTICE' | 'PROJECT' | 'QUIZ' | 'REVISION';
  estimatedMinutes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  resources: Array<{
    id: string;
    title: string;
    provider: string;
    url: string;
    resourceType: string;
    duration: string;
    free: boolean;
    rating: number;
  }>;
  userTasks?: Array<{ status: string }>;
}

export interface RoadmapModule {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  requiredSkills: string[];
  providedSkills: string[];
  tasks: RoadmapTask[];
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  estimatedWeeks: number;
  modules: RoadmapModule[];
}

export interface FullRoadmapData {
  userRoadmap: {
    id: string;
    progress: number;
    completionPercentage: number;
    learningPace: 'FAST' | 'MEDIUM' | 'SLOW';
    currentPhase: number;
  };
  roadmap: {
    id: string;
    title: string;
    description: string;
    version: number;
    careerPath: { name: string; category: string };
    milestones: Array<{ id: string; title: string; description: string; status: string }>;
    phases: RoadmapPhase[];
  };
}

export interface WeeklyPlannerData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  completedHours: number;
  days: Array<{ day: string; task: string; hours: number; status: string }>;
}

export interface RoadmapAnalyticsData {
  readinessScore: number;
  currentStreakDays: number;
  longestStreakDays: number;
  hoursStudiedThisWeek: number;
  weeklyGoalHours: number;
  completionPercentage: number;
  currentPace: string;
}

export const roadmapApi = {
  getRoadmap: async (): Promise<FullRoadmapData> => {
    const res = await api.get<ApiResponse<FullRoadmapData>>('/roadmaps');
    return res.data.data!;
  },

  generateRoadmap: async (learningPace: 'FAST' | 'MEDIUM' | 'SLOW' = 'MEDIUM'): Promise<FullRoadmapData> => {
    const res = await api.post<ApiResponse<FullRoadmapData>>('/roadmaps/generate', { learningPace });
    return res.data.data!;
  },

  completeTask: async (taskId: string) => {
    const res = await api.put<ApiResponse<unknown>>(`/tasks/${taskId}/complete`);
    return res.data.data;
  },

  getWeeklyPlanner: async (): Promise<WeeklyPlannerData> => {
    const res = await api.get<ApiResponse<WeeklyPlannerData>>('/planner/weekly');
    return res.data.data!;
  },

  getAnalytics: async (): Promise<RoadmapAnalyticsData> => {
    const res = await api.get<ApiResponse<RoadmapAnalyticsData>>('/analytics/roadmap');
    return res.data.data!;
  },

  logStudySession: async (durationMinutes: number, moduleName?: string) => {
    const res = await api.post<ApiResponse<unknown>>('/study-sessions', { durationMinutes, module: moduleName });
    return res.data.data;
  },
};
