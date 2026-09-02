import { Router } from 'express';

import * as authController from '@/modules/auth/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { authLimiter, passwordResetLimiter } from '@/middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/modules/auth/validators/auth.validator';

const router = Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register,
);

// POST /api/v1/auth/login
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login,
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  authenticate,
  authController.logout,
);

// POST /api/v1/auth/refresh-token
router.post(
  '/refresh-token',
  authController.refreshToken,
);

// POST /api/v1/auth/forgot-password
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

// POST /api/v1/auth/reset-password
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// GET /api/v1/auth/verify-email?token=...
router.get(
  '/verify-email',
  authController.verifyEmail,
);

export default router;
