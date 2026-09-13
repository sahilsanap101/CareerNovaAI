import { Router } from 'express';

import * as recController from '@/modules/recommendations/controllers/recommendation.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// All recommendation & analytics endpoints require authentication
router.use(authenticate);

// ─── Recommendations API ──────────────────────────────────────────
router.get('/recommendations', recController.getRecommendations);
router.get('/recommendations/history', recController.getHistory);
router.post('/recommendations/generate', recController.generateRecommendations);

// ─── Career Paths API ─────────────────────────────────────────────
router.get('/career-paths', recController.getCareerPaths);
router.get('/career-paths/:id', recController.getCareerPathDetails);
router.post('/career-paths/compare', recController.compareCareerPaths);

// ─── Analytics API ────────────────────────────────────────────────
router.get('/analytics/profile', recController.getAnalytics);
router.get('/analytics/skills', recController.getAnalytics);
router.get('/analytics/recommendations', recController.getAnalytics);

// ─── Feedback API ──────────────────────────────────────────────────
router.post('/feedback', recController.submitFeedback);

export default router;
