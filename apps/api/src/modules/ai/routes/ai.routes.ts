import { Router } from 'express';

import * as aiController from '@/modules/ai/controllers/ai.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// ─── AIOS API ─────────────────────────────────────────────────────
router.post('/chat', authenticate, aiController.chat);
router.post('/resume-analyze', aiController.analyzeResume); // Bypassed for testing
router.post('/github', authenticate, aiController.chat);
router.post('/interview', aiController.chat);
router.get('/history', aiController.getHistory);


export default router;
