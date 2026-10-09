import * as aiRepo from '@/modules/ai/repositories/ai.repository';
import { generateAiCompletion } from '@/modules/ai/gateway/aiGateway';
export type AgentType =
  | 'CAREER_MENTOR'
  | 'RESUME'
  | 'GITHUB'
  | 'INTERVIEW'
  | 'LEARNING'
  | 'RESEARCH';

export async function processChatRequest(
  userId: string,
  userMessage: string,
  conversationId?: string,
  agentType: AgentType = 'CAREER_MENTOR',
) {
  let convId = conversationId;
  if (!convId) {
    const newConv = await aiRepo.createConversation(userId, userMessage.slice(0, 40), agentType);
    convId = newConv.id;
  }

  // Save user message
  await aiRepo.saveMessage(convId, 'user', userMessage);

  // Orchestrate AI completion
  const aiResult = await generateAiCompletion({ userId, prompt: userMessage, agentType });

  // Save assistant message
  const assistantMsg = await aiRepo.saveMessage(
    convId,
    'assistant',
    aiResult.text,
    aiResult.sources,
    aiResult.tokensOutput,
  );

  // Log metrics
  await aiRepo.logAiMetric({
    userId,
    agentType,
    model: aiResult.model,
    tokensInput: aiResult.tokensInput,
    tokensOutput: aiResult.tokensOutput,
    durationMs: aiResult.durationMs,
  });

  return {
    conversationId: convId,
    message: assistantMsg,
    meta: {
      provider: aiResult.provider,
      model: aiResult.model,
      durationMs: aiResult.durationMs,
    },
  };
}

export async function getUserConversations(userId: string) {
  return aiRepo.getUserConversations(userId);
}


