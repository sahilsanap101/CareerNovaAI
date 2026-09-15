import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import * as jobsController from '../controllers/jobs.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Recommended jobs (primary Live Jobs endpoint) ────────────────
router.get('/recommended', jobsController.getRecommendedJobs);

// ─── Saved jobs ───────────────────────────────────────────────────
router.get('/saved', jobsController.getSavedJobs);

// ─── Application tracking ─────────────────────────────────────────
router.get('/applications', jobsController.getApplications);
router.patch('/applications/:id', jobsController.updateApplication);

// ─── Sync endpoint (admin/dev — protected by auth, quota-checked) ─
router.post('/sync', jobsController.triggerSync);

// ─── Generic live jobs browse ─────────────────────────────────────
router.get('/', jobsController.getLiveJobs);

// ─── Individual job detail ────────────────────────────────────────
router.get('/:id', jobsController.getJobById);

// ─── Save / Unsave ────────────────────────────────────────────────
router.post('/:id/save', jobsController.saveJob);
router.delete('/:id/save', jobsController.unsaveJob);

// ─── Mark as applied (explicit student action) ────────────────────
router.post('/:id/application', jobsController.createApplication);

export default router;
