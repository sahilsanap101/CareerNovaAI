import type { Request, Response, NextFunction } from 'express';

import * as roadmapService from '@/modules/roadmap/services/roadmap.service';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@pathforge/shared-constants';

// ─── Roadmap APIs ─────────────────────────────────────────────────

export async function getRoadmap(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await roadmapService.getActiveUserRoadmap(req.user!.sub);
    sendSuccess(res, { message: 'Active adaptive roadmap retrieved.', data });
  } catch (err) {
    next(err);
  }
}

export async function generateRoadmap(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { learningPace } = req.body as { learningPace?: 'FAST' | 'MEDIUM' | 'SLOW' };
    const data = await roadmapService.generateAdaptiveRoadmap(req.user!.sub, learningPace);
    sendSuccess(res, { message: 'Adaptive learning roadmap generated.', data, statusCode: HTTP_STATUS.CREATED });
  } catch (err) {
    next(err);
  }
}

export async function completeTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { taskId } = req.params as { taskId: string };
    const data = await roadmapService.completeUserTask(req.user!.sub, taskId);
    sendSuccess(res, { message: 'Task completed.', data });
  } catch (err) {
    next(err);
  }
}

export async function logStudySession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { durationMinutes, module } = req.body as { durationMinutes: number; module?: string };
    const data = await roadmapService.logStudyTime(req.user!.sub, durationMinutes, module);
    sendSuccess(res, { message: 'Study session logged.', data, statusCode: HTTP_STATUS.CREATED });
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyPlanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await roadmapService.getWeeklyPlanner(req.user!.sub);
    sendSuccess(res, { message: 'Weekly planner retrieved.', data });
  } catch (err) {
    next(err);
  }
}

export async function getRoadmapAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await roadmapService.getRoadmapAnalytics(req.user!.sub);
    sendSuccess(res, { message: 'Roadmap analytics retrieved.', data });
  } catch (err) {
    next(err);
  }
}
