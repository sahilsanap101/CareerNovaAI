import { api } from '@/api/axiosInstance';
import type { ApiResponse } from '@pathforge/shared-types';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string[];
  createdAt: string;
}

export interface AiConversation {
  id: string;
  title: string;
  agentType: string;
  messages: AiChatMessage[];
  updatedAt: string;
}

export interface AiAnalyticsData {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgLatencyMs: number;
}

export interface ResumeAnalysisResult {
  matchScore: number;
  categoryScores: {
    requiredSkills: number;
    preferredSkills: number;
    experience: number;
    projects: number;
    education: number;
    atsReadiness: number;
  };
  skillsYouHave: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  partialMatches: string[];
  resumeIssues: string[];
  top5Changes: string[];
  improvedBulletSuggestions: {
    original: string;
    improved: string;
    reason: string;
  }[];
  isDeterministicOnly?: boolean;
  aiModelUsed?: string;
}

export const aiApi = {
  analyzeResume: async (resumeText: string, jobDescription?: string): Promise<ResumeAnalysisResult> => {
    const res = await api.post<ApiResponse<ResumeAnalysisResult>>('/ai/resume-analyze', {
      resumeText,
      jobDescription,
    }, {
      timeout: 120_000,
    });
    return res.data.data!;
  },

  sendChatMessage: async (
    message: string,
    conversationId?: string,
    agentType = 'CAREER_MENTOR',
  ): Promise<{ conversationId: string; message: AiChatMessage }> => {
    const res = await api.post<ApiResponse<{ conversationId: string; message: AiChatMessage }>>('/ai/chat', {
      message,
      conversationId,
      agentType,
    });
    return res.data.data!;
  },

  getHistory: async (): Promise<AiConversation[]> => {
    const res = await api.get<ApiResponse<AiConversation[]>>('/ai/history');
    return res.data.data!;
  },

  getAnalytics: async (): Promise<AiAnalyticsData> => {
    const res = await api.get<ApiResponse<AiAnalyticsData>>('/ai/analytics');
    return res.data.data!;
  },
};
