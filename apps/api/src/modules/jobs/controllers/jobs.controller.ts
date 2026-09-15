import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@pathforge/shared-constants';
import * as jobsService from '../services/jobs.service';
import type { AppStatus, LiveJobFilters } from '../types/jobs.types';

const ok = (res: Response, data: unknown, message = 'Success') =>
    res.json({ success: true, message, data, meta: null, errors: null, timestamp: new Date().toISOString() });

// ─── GET /live-jobs/recommended ───────────────────────────────────
export async function getRecommendedJobs(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const filters = buildFilters(req);
        const jobs = await jobsService.getRecommendedJobsForUser(userId, filters);
        ok(res, jobs, 'Personalized job matches retrieved');
    } catch (err) {
        next(err);
    }
}

// ─── GET /live-jobs ───────────────────────────────────────────────
export async function getLiveJobs(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const filters = buildFilters(req);
        const jobs = await jobsService.getAllLiveJobs(userId, filters);
        ok(res, jobs, 'Live jobs retrieved');
    } catch (err) {
        next(err);
    }
}

// ─── GET /live-jobs/saved ─────────────────────────────────────────
export async function getSavedJobs(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const jobs = await jobsService.getSavedJobs(userId);
        ok(res, jobs, 'Saved jobs retrieved');
    } catch (err) {
        next(err);
    }
}

// ─── GET /live-jobs/:id ───────────────────────────────────────────
export async function getJobById(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const job = await jobsService.getLiveJobById(userId, req.params.id);
        ok(res, job, 'Job detail retrieved');
    } catch (err) {
        next(err);
    }
}

// ─── POST /live-jobs/:id/save ─────────────────────────────────────
export async function saveJob(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const result = await jobsService.saveJob(userId, req.params.id);
        res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Job saved', data: result, meta: null, errors: null, timestamp: new Date().toISOString() });
    } catch (err) {
        next(err);
    }
}

// ─── DELETE /live-jobs/:id/save ───────────────────────────────────
export async function unsaveJob(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        await jobsService.unsaveJob(userId, req.params.id);
        ok(res, null, 'Job unsaved');
    } catch (err) {
        next(err);
    }
}

// ─── POST /live-jobs/:id/application ─────────────────────────────
export async function createApplication(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const { notes } = req.body as { notes?: string };
        const result = await jobsService.createApplication(userId, req.params.id, notes);
        res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Application tracked', data: result, meta: null, errors: null, timestamp: new Date().toISOString() });
    } catch (err) {
        next(err);
    }
}

// ─── GET /live-jobs/applications ─────────────────────────────────
export async function getApplications(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const apps = await jobsService.getApplications(userId);
        ok(res, apps, 'Applications retrieved');
    } catch (err) {
        next(err);
    }
}

// ─── PATCH /live-jobs/applications/:id ───────────────────────────
export async function updateApplication(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const { status, notes } = req.body as { status: AppStatus; notes?: string };
        const result = await jobsService.updateApplication(userId, req.params.id, status, notes);
        ok(res, result, 'Application updated');
    } catch (err) {
        next(err);
    }
}

// ─── POST /live-jobs/sync (admin/dev) ────────────────────────────
export async function triggerSync(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const result = await jobsService.triggerSync(userId);
        ok(res, result, result.message);
    } catch (err) {
        next(err);
    }
}

// ─── Helpers ──────────────────────────────────────────────────────
function buildFilters(req: Request): LiveJobFilters {
    return {
        career: req.query['career'] as string | undefined,
        location: req.query['location'] as string | undefined,
        type: req.query['type'] as string | undefined,
        minMatchScore: req.query['minMatch'] ? Number(req.query['minMatch']) : undefined,
        search: req.query['search'] as string | undefined,
        page: req.query['page'] ? Number(req.query['page']) : 1,
        limit: req.query['limit'] ? Math.min(Number(req.query['limit']), 50) : 20,
    };
}
