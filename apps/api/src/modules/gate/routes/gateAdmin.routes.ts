import { Router } from 'express';
import * as gateAdminController from '../controllers/gateAdmin.controller';

const router = Router();

// Endpoint for updating publishing boundaries
router.post('/lifecycle/:year', gateAdminController.transitionLifecycle);

// Endpoint for verifying third party resource URLs manually
router.post('/resource/:resourceId/verify', gateAdminController.verifyResourceAccess);

export default router;
