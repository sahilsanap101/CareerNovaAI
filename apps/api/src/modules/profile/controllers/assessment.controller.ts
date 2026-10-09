import type { Request, Response, NextFunction } from 'express';
import * as assessmentService from '../services/assessment.service';
import { sendSuccess } from '@/utils/response';
import { z } from 'zod';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '@pathforge/shared-constants';

export async function getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await assessmentService.getQuestions();
    sendSuccess(res, { message: 'Assessment questions retrieved successfully.', data });
  } catch (err) {
    next(err);
  }
}

export async function getResponses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await assessmentService.getUserResponses(req.user!.sub);
    sendSuccess(res, { message: 'Assessment responses retrieved successfully.', data });
  } catch (err) {
    next(err);
  }
}

export async function saveResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      questionId: z.string().min(1),
      selectedValue: z.string().min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid request body', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.SERVER_001);
    }

    const data = await assessmentService.saveResponse(req.user!.sub, parsed.data.questionId, parsed.data.selectedValue);
    sendSuccess(res, { message: 'Response saved.', data });
  } catch (err) {
    next(err);
  }
}

export async function getCompletionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await assessmentService.getAssessmentCompletion(req.user!.sub);
    sendSuccess(res, { message: 'Completion status retrieved.', data });
  } catch (err) {
    next(err);
  }
}

export async function submitAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await assessmentService.submitAssessment(req.user!.sub);
    sendSuccess(res, { message: 'Assessment submitted successfully.', data });
  } catch (err) {
    next(err);
  }
}
