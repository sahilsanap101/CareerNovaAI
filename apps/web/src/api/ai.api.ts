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

export const aiApi = {
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
