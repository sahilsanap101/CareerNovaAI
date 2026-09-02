import { generateAiCompletion, type CompletionResult } from '../gateway/aiGateway';
import { executePlatformTool } from '../tools/platformTools';

export type AgentType =
  | 'CAREER_MENTOR'
  | 'RESUME'
  | 'GITHUB'
  | 'INTERVIEW'
  | 'LEARNING'
  | 'RESEARCH'
  | 'ROADMAP';

export async function orchestrateAiRequest(
  userId: string,
  userMessage: string,
  requestedAgentType: AgentType = 'CAREER_MENTOR',
): Promise<CompletionResult> {
  // 1. Fetch platform tools context
  const profileToolData = await executePlatformTool('getStudentProfile', userId);
  const recToolData = await executePlatformTool('getBYSERRecommendations', userId);
  const roadmapToolData = await executePlatformTool('getActiveRoadmap', userId);

  const systemPrompt = `You are PATHFORGE AIOS (${requestedAgentType}). 
Context Grounding:
- Student Profile: ${profileToolData}
- BYSER Top Recommendations: ${recToolData}
- Active Roadmap: ${roadmapToolData}`;

  // 2. Execute via AI Gateway
  return generateAiCompletion({
    prompt: userMessage,
    systemPrompt,
    agentType: requestedAgentType,
    userId,
  });
}
