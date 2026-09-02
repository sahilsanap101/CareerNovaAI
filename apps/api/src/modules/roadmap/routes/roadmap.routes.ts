import { Router } from 'express';

import * as roadmapController from '@/modules/roadmap/controllers/roadmap.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// All roadmap endpoints require authentication
router.use(authenticate);

// ─── Roadmap API ──────────────────────────────────────────────────
router.get('/roadmaps', roadmapController.getRoadmap);
router.post('/roadmaps/generate', roadmapController.generateRoadmap);
router.post('/roadmaps/regenerate', roadmapController.generateRoadmap);
router.put('/tasks/:taskId/complete', roadmapController.completeTask);

// ─── Planner & Analytics ──────────────────────────────────────────
router.get('/planner/weekly', roadmapController.getWeeklyPlanner);
router.get('/planner/daily', roadmapController.getWeeklyPlanner);
router.get('/analytics/roadmap', roadmapController.getRoadmapAnalytics);
router.post('/study-sessions', roadmapController.logStudySession);

export default router;
