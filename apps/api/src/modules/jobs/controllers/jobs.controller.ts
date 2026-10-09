/**
 * Live Jobs Controller
 *
 * Security rules enforced here:
 *   - userId is ALWAYS derived from req.user!.sub (JWT payload).
 *     It is NEVER read from req.body, req.params, or req.query.
 *   - All mutation bodies are validated by Zod before reaching here
 *     (via the validate() middleware applied in jobs.routes.ts).
 *   - The sync endpoint is admin-only (enforce at route level with authorize('ADMIN')).
 *
 * Architecture:
 *   - Controller handles HTTP concerns only: parse query, call service, format response.
 *   - Business logic lives exclusively in jobs.service.ts.
 *   - Error handling is delegated to globalErrorHandler via next(err).
 */

import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@pathforge/shared-constants';
import * as jobsService from '../services/jobs.service';
import type { AppStatus, LiveJobFilters } from '../types/jobs.types';
import type { UpdateApplicationInput, CreateApplicationInput } from '../validators/jobs.validator';

// ─── Response helpers ─────────────────────────────────────────────────────

const ok = (res: Response, data: unknown, message = 'Success') =>
    res.json({
        success: true,
        message,
        data,
        meta: null,
        errors: null,
        timestamp: new Date().toISOString(),
    });

const created = (res: Response, data: unknown, message: string) =>
    res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message,
        data,
        meta: null,
        errors: null,
        timestamp: new Date().toISOString(),
    });

// ─── GET /live-jobs/recommended ───────────────────────────────────────────

/**
 * Returns personalized jobs scored against the authenticated user's
 * CareerNova recommendations, skills, and profile data.
 * User identity is always taken from req.user!.sub.
 */
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

// ─── GET /live-jobs ───────────────────────────────────────────────────────

/**
 * Browse all cached live jobs with optional filters.
 * Still match-scored for the authenticated user.
 */
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

// ─── GET /live-jobs/saved ─────────────────────────────────────────────────

/**
 * Returns all jobs saved by the authenticated user, with current match scores.
 */
export async function getSavedJobs(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const jobs = await jobsService.getSavedJobs(userId);
        ok(res, jobs, 'Saved jobs retrieved');
    } catch (err) {
        next(err);
    }
}

// ─── GET /live-jobs/:id ───────────────────────────────────────────────────

/**
 * Returns a single job's full details and personalised match breakdown
 * for the authenticated user.
 */
export async function getJobById(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const jobId = req.params['id']!;
        const job = await jobsService.getLiveJobById(userId, jobId);
        ok(res, job, 'Job detail retrieved');
    } catch (err) {
        next(err);
    }
}

// ─── POST /live-jobs/:id/save ─────────────────────────────────────────────

/**
 * Saves a job for the authenticated user.
 * Idempotent — calling multiple times has no effect beyond the first save.
 */
export async function saveJob(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const jobId = req.params['id']!;
        const result = await jobsService.saveJob(userId, jobId);
        created(res, result, 'Job saved');
    } catch (err) {
        next(err);
    }
}

// ─── DELETE /live-jobs/:id/save ───────────────────────────────────────────

/**
 * Removes a saved job for the authenticated user.
 * Idempotent — safe to call even if job was not saved.
 */
export async function unsaveJob(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const jobId = req.params['id']!;
        await jobsService.unsaveJob(userId, jobId);
        ok(res, null, 'Job unsaved');
    } catch (err) {
        next(err);
    }
}

// ─── POST /live-jobs/:id/application ─────────────────────────────────────

/**
 * Creates an application tracking record for the authenticated user.
 * Body is validated by createApplicationSchema (Zod) before this runs.
 * notes is the only accepted body field — userId is NEVER read from body.
 */
export async function createApplication(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const jobId = req.params['id']!;
        const { status, notes } = req.body as CreateApplicationInput;
        const result = await jobsService.createApplication(userId, jobId, status as AppStatus | undefined, notes);
        created(res, result, 'Application tracked');
    } catch (err) {
        next(err);
    }
}

// ─── GET /live-jobs/applications ──────────────────────────────────────────

/**
 * Returns all application tracking records for the authenticated user.
 */
export async function getApplications(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const apps = await jobsService.getApplications(userId);
        ok(res, apps, 'Applications retrieved');
    } catch (err) {
        next(err);
    }
}

// ─── PATCH /live-jobs/applications/:id ───────────────────────────────────

/**
 * Updates the status and/or notes of an application tracking record.
 * Ownership is verified in the service layer (the record must belong to the
 * authenticated user — never accepts userId from the request body).
 * Body is validated by updateApplicationSchema (Zod) before this runs.
 */
export async function updateApplication(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const applicationId = req.params['id']!;
        const { status, notes } = req.body as UpdateApplicationInput;
        const result = await jobsService.updateApplication(
            userId,
            applicationId,
            status as AppStatus,
            notes,
        );
        ok(res, result, 'Application updated');
    } catch (err) {
        next(err);
    }
}

// ─── POST /live-jobs/sync  (ADMIN ONLY) ──────────────────────────────────

/**
 * Triggers a Jooble synchronisation for the authenticated admin user's
 * career recommendations.
 *
 * SECURITY:
 *   - This endpoint is protected at the route level by authorize('ADMIN').
 *   - Students cannot call this endpoint.
 *   - userId is derived from req.user!.sub — never from the request body.
 *   - Jooble quota is enforced inside jobSync.service.ts.
 */
export async function triggerSync(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.sub;
        const result = await jobsService.triggerSync(userId);
        ok(res, result, result.message);
    } catch (err) {
        next(err);
    }
}

// ─── Query filter builder ─────────────────────────────────────────────────

/**
 * Converts raw Express query params into a typed LiveJobFilters object.
 * All numeric values are coerced and clamped defensively.
 * Invalid / missing values fall back to safe defaults — they are NOT
 * propagated as NaN to the service layer.
 */
function buildFilters(req: Request): LiveJobFilters {
    const q = req.query;

    const rawPage = Number(q['page']);
    const rawLimit = Number(q['limit']);
    const rawMin = q['minMatch'] != null ? Number(q['minMatch']) : undefined;

    return {
        career:       typeof q['career']   === 'string' ? q['career']   : undefined,
        location:     typeof q['location'] === 'string' ? q['location'] : undefined,
        type:         typeof q['type']     === 'string' ? q['type']     : undefined,
        search:       typeof q['search']   === 'string' ? q['search']   : undefined,
        minMatchScore: rawMin != null && !Number.isNaN(rawMin)
            ? Math.max(0, Math.min(100, rawMin))
            : undefined,
        page:  !Number.isNaN(rawPage)  && rawPage  >= 1 ? rawPage  : 1,
        limit: !Number.isNaN(rawLimit) && rawLimit >= 1 ? Math.min(rawLimit, 100) : 20,
    };
}
