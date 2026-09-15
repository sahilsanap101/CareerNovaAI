import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS, ERROR_MESSAGES } from '@pathforge/shared-constants';
import * as gateService from '../services/gate.service';
import { gateProfileSchema, gateTopicSchema, gateStudyTaskSchema, gateStudySessionSchema, gatePracticeAttemptSchema, gateMistakeSchema, gateRevisionItemSchema } from '../schemas/gate.schema';
import { AppError } from '@/middleware/error.middleware';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }
        const profile = await gateService.getGateProfileByUserId(userId);
        sendSuccess(res, { message: 'Profile retrieved successfully', data: profile });
    } catch (err) {
        next(err);
    }
}

export async function createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }
        const validatedData = gateProfileSchema.parse(req.body);
        const profile = await gateService.createGateProfile(userId, validatedData);
        sendSuccess(res, { message: 'Profile created successfully', data: profile, statusCode: HTTP_STATUS.CREATED });
    } catch (err) {
        next(err);
    }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }
        const validatedData = gateProfileSchema.parse(req.body);
        const profile = await gateService.updateGateProfile(userId, validatedData);
        sendSuccess(res, { message: 'Profile updated successfully', data: profile });
    } catch (err) {
        next(err);
    }
}

// ─── GATE Topics ──────────────────────────────────────────────────

export async function getTopics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const topics = await gateService.getGateTopics(userId);
        sendSuccess(res, { message: 'Success', data: topics });
    } catch (err) {
        next(err);
    }
}

export async function getTopicProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const progress = await gateService.getGateTopicProgress(userId);
        sendSuccess(res, { message: 'Success', data: progress });
    } catch (err) {
        next(err);
    }
}

export async function createTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const validatedData = gateTopicSchema.parse(req.body);
        const topic = await gateService.createGateTopic(userId, validatedData);
        sendSuccess(res, { message: 'Topic created successfully', data: topic, statusCode: HTTP_STATUS.CREATED });
    } catch (err) {
        next(err);
    }
}

export async function updateTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const topicId = req.params.id;
        if (!topicId) throw new AppError('Topic ID is required', HTTP_STATUS.BAD_REQUEST);
        const validatedData = gateTopicSchema.parse(req.body);
        const topic = await gateService.updateGateTopic(userId, topicId, validatedData);
        sendSuccess(res, { message: 'Topic updated successfully', data: topic });
    } catch (err) {
        next(err);
    }
}

export async function deleteTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const topicId = req.params.id;
        if (!topicId) throw new AppError('Topic ID is required', HTTP_STATUS.BAD_REQUEST);
        await gateService.deleteGateTopic(userId, topicId);
        sendSuccess(res, { message: 'Topic deleted successfully', data: null });
    } catch (err) {
        next(err);
    }
}

// ─── GATE Study Tasks ─────────────────────────────────────────────

export async function getStudyTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const { weekStart, weekEnd } = req.query;
        const tasks = await gateService.getGateStudyTasks(
            userId,
            weekStart ? new Date(weekStart as string) : undefined,
            weekEnd ? new Date(weekEnd as string) : undefined
        );
        sendSuccess(res, { message: 'Success', data: tasks });
    } catch (err) {
        next(err);
    }
}

export async function createStudyTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);

        const { gateStudyTaskSchema } = await import('../schemas/gate.schema');
        const validatedData = gateStudyTaskSchema.parse(req.body);

        const task = await gateService.createGateStudyTask(userId, validatedData);
        sendSuccess(res, { message: 'Task created successfully', data: task, statusCode: HTTP_STATUS.CREATED });
    } catch (err) {
        next(err);
    }
}

export async function updateStudyTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const taskId = req.params.id;
        if (!taskId) throw new AppError('Task ID is required', HTTP_STATUS.BAD_REQUEST);

        const { gateStudyTaskSchema } = await import('../schemas/gate.schema');
        const validatedData = gateStudyTaskSchema.partial().parse(req.body);

        const task = await gateService.updateGateStudyTask(userId, taskId, validatedData);
        sendSuccess(res, { message: 'Task updated successfully', data: task });
    } catch (err) {
        next(err);
    }
}

export async function deleteStudyTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const taskId = req.params.id;
        if (!taskId) throw new AppError('Task ID is required', HTTP_STATUS.BAD_REQUEST);

        await gateService.deleteGateStudyTask(userId, taskId);
        sendSuccess(res, { message: 'Task deleted successfully', data: null });
    } catch (err) {
        next(err);
    }
}

export async function getWeeklySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const { weekStart, weekEnd } = req.query;

        if (!weekStart || !weekEnd) throw new AppError('weekStart and weekEnd are required', HTTP_STATUS.BAD_REQUEST);

        const summary = await gateService.getWeeklyPlannerSummary(
            userId,
            new Date(weekStart as string),
            new Date(weekEnd as string)
        );
        sendSuccess(res, { message: 'Success', data: summary });
    } catch (err) {
        next(err);
    }
}

// ─── GATE Study Sessions ──────────────────────────────────────────

export async function getStudySessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);

        const { weekStart, weekEnd, sessionType, topicId } = req.query;

        const sessions = await gateService.getGateStudySessions(
            userId,
            weekStart ? new Date(weekStart as string) : undefined,
            weekEnd ? new Date(weekEnd as string) : undefined,
            sessionType as string,
            topicId as string
        );
        sendSuccess(res, { message: 'Success', data: sessions });
    } catch (err) {
        next(err);
    }
}

export async function createStudySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);

        const { gateStudySessionSchema } = await import('../schemas/gate.schema');
        const validatedData = gateStudySessionSchema.parse(req.body);

        const session = await gateService.createGateStudySession(userId, validatedData);
        sendSuccess(res, { message: 'Session created successfully', data: session, statusCode: HTTP_STATUS.CREATED });
    } catch (err) {
        next(err);
    }
}

export async function updateStudySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const sessionId = req.params.id;
        if (!sessionId) throw new AppError('Session ID is required', HTTP_STATUS.BAD_REQUEST);

        const { gateStudySessionSchema } = await import('../schemas/gate.schema');
        const validatedData = gateStudySessionSchema.partial().parse(req.body);

        const session = await gateService.updateGateStudySession(userId, sessionId, validatedData);
        sendSuccess(res, { message: 'Session updated successfully', data: session });
    } catch (err) {
        next(err);
    }
}

export async function deleteStudySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const sessionId = req.params.id;
        if (!sessionId) throw new AppError('Session ID is required', HTTP_STATUS.BAD_REQUEST);

        await gateService.deleteGateStudySession(userId, sessionId);
        sendSuccess(res, { message: 'Session deleted successfully', data: null });
    } catch (err) {
        next(err);
    }
}

export async function getStudySessionSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const { weekStart, weekEnd } = req.query;

        if (!weekStart || !weekEnd) throw new AppError('weekStart and weekEnd are required', HTTP_STATUS.BAD_REQUEST);

        const summary = await gateService.getStudySessionSummary(
            userId,
            new Date(weekStart as string),
            new Date(weekEnd as string)
        );
        sendSuccess(res, { message: 'Success', data: summary });
    } catch (err) {
        next(err);
    }
}

export async function getPracticePerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const summary = await gateService.getPracticeSummary(userId);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: summary });
    } catch (err) { next(err); }
}

export async function getMockSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const summary = await gateService.getMockSummary(userId);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: summary });
    } catch (err) { next(err); }
}

export async function getGatePracticeAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const { startDate, endDate, topicId, attemptType, paperCode, paperYear } = req.query;
        const attempts = await gateService.getGatePracticeAttempts(
            userId,
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined,
            topicId as string,
            attemptType as string,
            paperCode as string,
            paperYear ? parseInt(paperYear as string) : undefined
        );
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: attempts });
    } catch (err) { next(err); }
}

export async function createGatePracticeAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const validatedData = gatePracticeAttemptSchema.parse(req.body);
        const attempt = await gateService.createGatePracticeAttempt(userId, validatedData);
        res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: attempt });
    } catch (err) { next(err); }
}

export async function updateGatePracticeAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const validatedData = gatePracticeAttemptSchema.parse(req.body);
        const attempt = await gateService.updateGatePracticeAttempt(userId, req.params.id as string, validatedData);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: attempt });
    } catch (err) { next(err); }
}

export async function deleteGatePracticeAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        await gateService.deleteGatePracticeAttempt(userId, req.params.id as string);
        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) { next(err); }
}

export async function createGateMistake(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const validatedData = gateMistakeSchema.parse(req.body);
        const mistake = await gateService.createGateMistake(userId, validatedData);
        res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: mistake });
    } catch (err) { next(err); }
}

export async function getGateMistakes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const mistakes = await gateService.getGateMistakes(userId, req.query);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: mistakes });
    } catch (err) { next(err); }
}

export async function updateGateMistake(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const validatedData = gateMistakeSchema.partial().parse(req.body);
        const mistake = await gateService.updateGateMistake(userId, req.params.id as string, validatedData);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: mistake });
    } catch (err) { next(err); }
}

export async function deleteGateMistake(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        await gateService.deleteGateMistake(userId, req.params.id as string);
        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) { next(err); }
}

export async function getMistakeSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const summary = await gateService.getMistakeSummary(userId);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: summary });
    } catch (err) { next(err); }
}

// ─── GATE Revision Hub ──────────────────────────────────────────────

export async function createGateRevisionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const validatedData = gateRevisionItemSchema.parse(req.body);
        const item = await gateService.createGateRevisionItem(userId, validatedData);
        res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: item });
    } catch (err) { next(err); }
}

export async function getGateRevisionItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const items = await gateService.getGateRevisionItems(userId, req.query);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: items });
    } catch (err) { next(err); }
}

export async function updateGateRevisionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const validatedData = gateRevisionItemSchema.partial().parse(req.body);
        const item = await gateService.updateGateRevisionItem(userId, req.params.id as string, validatedData);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: item });
    } catch (err) { next(err); }
}

export async function deleteGateRevisionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        await gateService.deleteGateRevisionItem(userId, req.params.id as string);
        res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (err) { next(err); }
}

export async function getGateAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const data = await gateService.getComprehensiveAnalytics(userId);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data });
    } catch (err) { next(err); }
}

export async function reviewGateRevisionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const item = await gateService.reviewGateRevisionItem(userId, req.params.id as string);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: item });
    } catch (err) { next(err); }
}

export async function getGateReadiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const data = await gateService.getGateReadiness(userId);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data });
    } catch (err) { next(err); }
}

export async function completeGateRevisionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const item = await gateService.completeGateRevisionItem(userId, req.params.id as string);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: item });
    } catch (err) { next(err); }
}

export async function reopenGateRevisionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const item = await gateService.reopenGateRevisionItem(userId, req.params.id as string);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: item });
    } catch (err) { next(err); }
}

export async function rescheduleGateRevisionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const { scheduledDate } = req.body;
        if (!scheduledDate) throw new AppError('scheduledDate is required', HTTP_STATUS.BAD_REQUEST);
        const item = await gateService.rescheduleGateRevisionItem(userId, req.params.id as string, scheduledDate);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: item });
    } catch (err) { next(err); }
}

export async function getRevisionSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user?.sub;
        if (!userId) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        const summary = await gateService.getRevisionSummary(userId);
        res.status(HTTP_STATUS.OK).json({ status: 'success', data: summary });
    } catch (err) { next(err); }
}
