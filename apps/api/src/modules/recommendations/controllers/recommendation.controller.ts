import type { Request, Response, NextFunction } from 'express';

import * as recService from '@/modules/recommendations/services/recommendation.service';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@pathforge/shared-constants';

// ─── Recommendations ──────────────────────────────────────────────

export async function getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await recService.getLatestUserRecommendations(req.user!.sub);
    sendSuccess(res, { message: 'Top 5 career recommendations retrieved successfully.', data });
  } catch (err) {
    next(err);
  }
}

export async function generateRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await recService.generateRecommendations(req.user!.sub);
    sendSuccess(res, { message: 'Fresh BYSER career recommendations generated.', data, statusCode: HTTP_STATUS.CREATED });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await recService.getUserRecommendationHistory(req.user!.sub);
    sendSuccess(res, { message: 'Recommendation history retrieved.', data });
  } catch (err) {
    next(err);
  }
}

// ─── Career Paths & Comparison ────────────────────────────────────

export async function getCareerPaths(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await recService.getAllCareerPaths();
    sendSuccess(res, { message: 'All career paths retrieved.', data });
  } catch (err) {
    next(err);
  }
}

export async function getCareerPathDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = await recService.getCareerPathDetails(id);
    sendSuccess(res, { message: 'Career path details retrieved.', data });
  } catch (err) {
    next(err);
  }
}

export async function compareCareerPaths(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { careerPathIds } = req.body as { careerPathIds: string[] };
    const data = await recService.compareCareerPaths(req.user!.sub, careerPathIds ?? []);
    sendSuccess(res, { message: 'Career paths comparison generated.', data });
  } catch (err) {
    next(err);
  }
}

// ─── Analytics ────────────────────────────────────────────────────

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await recService.getStudentAnalytics(req.user!.sub);
    sendSuccess(res, { message: 'Student analytics retrieved.', data });
  } catch (err) {
    next(err);
  }
}
