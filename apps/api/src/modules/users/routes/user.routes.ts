import { Router } from 'express';

import * as userController from '@/modules/users/controllers/user.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
} from '@/modules/users/validators/user.validator';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/v1/users/me
router.get('/me', userController.getMe);

// PUT /api/v1/users/profile
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

// PUT /api/v1/users/preferences
router.put('/preferences', validate(updatePreferencesSchema), userController.updatePreferences);

// PUT /api/v1/users/change-password
router.put('/change-password', validate(changePasswordSchema), userController.changePassword);

// DELETE /api/v1/users/delete
router.delete('/delete', userController.deleteAccount);

export default router;
