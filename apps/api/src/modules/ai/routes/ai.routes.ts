import { Router } from 'express';

import * as aiController from '@/modules/ai/controllers/ai.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// All AIOS endpoints require authentication
router.use(authenticate);

// ─── AIOS API ─────────────────────────────────────────────────────
router.post('/chat', aiController.chat);
router.post('/resume', aiController.chat);
router.post('/github', aiController.chat);
router.post('/interview', aiController.chat);
router.get('/history', aiController.getHistory);
router.get('/analytics', aiController.getAnalytics);

export default router;
