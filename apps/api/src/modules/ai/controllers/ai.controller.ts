import type { Request, Response, NextFunction } from 'express';

import * as aiService from '@/modules/ai/services/ai.service';
import { sendSuccess } from '@/utils/response';
import type { AgentType } from '../orchestrator/multiAgentOrchestrator';

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, conversationId, agentType } = req.body as {
      message: string;
      conversationId?: string;
      agentType?: AgentType;
    };
    const data = await aiService.processChatRequest(req.user!.sub, message, conversationId, agentType);
    sendSuccess(res, { message: 'AI response generated.', data });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await aiService.getUserConversations(req.user!.sub);
    sendSuccess(res, { message: 'AI conversation history retrieved.', data });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await aiService.getAiAnalytics(req.user!.sub);
    sendSuccess(res, { message: 'AI analytics retrieved.', data });
  } catch (err) {
    next(err);
  }
}
