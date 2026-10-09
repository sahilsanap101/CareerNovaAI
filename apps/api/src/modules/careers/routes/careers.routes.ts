import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import * as careersController from '../controllers/careers.controller';

const router = Router();

// Protect all career routes
router.use(authenticate);

/**
 * @route   GET /api/v1/career-recommendation/recommendations
 * @desc    Generate career recommendations for the authenticated student
 * @access  Private (Student)
 */
router.get(
  '/recommendations',
  authorize('STUDENT'),
  careersController.getRecommendations
);

router.get(
  '/catalog',
  careersController.getCatalog
);

router.get(
  '/trending',
  authorize('STUDENT'),
  careersController.getTrendingJobs
);

router.get(
  '/:careerId/roadmap',
  authorize('STUDENT'),
  careersController.getRoadmap
);

router.get(
  '/my-roadmaps',
  authorize('STUDENT'),
  careersController.getUserRoadmaps
);

router.get(
  '/history',
  authorize('STUDENT'),
  careersController.getHistory
);

router.get(
  '/history/:id',
  authorize('STUDENT'),
  careersController.getSnapshot
);

export default router;
