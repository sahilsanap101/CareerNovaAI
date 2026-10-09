/**
 * Live Jobs Routes
 *
 * Base path: /api/v1/live-jobs  (mounted in src/routes/index.ts)
 *
 * All routes require a valid JWT (enforced by the router-level authenticate middleware).
 * The sync endpoint additionally requires ADMIN role (enforced by authorize('ADMIN')).
 *
 * Route ordering is deliberate:
 *   Named static segments (/recommended, /saved, /applications, /sync) are
 *   registered BEFORE the dynamic /:id segment to prevent Express from
 *   treating them as job IDs.
 */

import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import * as jobsController from '../controllers/jobs.controller';
import {
    createApplicationSchema,
    updateApplicationSchema,
} from '../validators/jobs.validator';

const router = Router();

// ─── All routes require a valid JWT ──────────────────────────────────────
router.use(authenticate);

// ─── GET /api/v1/live-jobs/recommended ───────────────────────────────────
// Returns personalized jobs scored against the user's CareerNova profile.
// Supports query filters: career, location, type, search, page, limit, minMatch
router.get('/recommended', jobsController.getRecommendedJobs);

// ─── GET /api/v1/live-jobs/saved ─────────────────────────────────────────
// Returns all jobs the authenticated user has saved.
router.get('/saved', jobsController.getSavedJobs);

// ─── GET /api/v1/live-jobs/applications ──────────────────────────────────
// Returns all application tracking records for the authenticated user.
router.get('/applications', jobsController.getApplications);

// ─── PATCH /api/v1/live-jobs/applications/:id ────────────────────────────
// Updates the status/notes of a specific application tracking record.
// Ownership is enforced in the service layer (must belong to req.user.sub).
router.patch(
    '/applications/:id',
    validate(updateApplicationSchema),
    jobsController.updateApplication,
);

// ─── POST /api/v1/live-jobs/sync  (ADMIN ONLY) ───────────────────────────
// Triggers a Jooble cache synchronisation for the admin user's career list.
// Restricted to ADMIN role — students cannot call this endpoint.
// This is an internal/development/admin operation. It is NOT a student action.
router.post(
    '/sync',
    authorize('ADMIN'),
    jobsController.triggerSync,
);

// ─── GET /api/v1/live-jobs ───────────────────────────────────────────────
// Browse all cached live jobs with optional filters.
// Still match-scored for the authenticated user.
// Supports: career, location, type, search, page, limit, minMatch
router.get('/', jobsController.getLiveJobs);

// ─── GET /api/v1/live-jobs/:id ───────────────────────────────────────────
// Returns full job details with personalised match breakdown.
router.get('/:id', jobsController.getJobById);

// ─── POST /api/v1/live-jobs/:id/save ─────────────────────────────────────
// Saves a job for the authenticated user (idempotent).
router.post('/:id/save', jobsController.saveJob);

// ─── DELETE /api/v1/live-jobs/:id/save ───────────────────────────────────
// Removes a saved job (idempotent — safe to call even if not saved).
router.delete('/:id/save', jobsController.unsaveJob);

// ─── POST /api/v1/live-jobs/:id/application ──────────────────────────────
// Creates an application tracking record (marks job as applied).
// notes (optional, max 1000 chars) is the only accepted body field.
// userId is NEVER read from request body — always from req.user.sub.
router.post(
    '/:id/application',
    validate(createApplicationSchema),
    jobsController.createApplication,
);

export default router;
