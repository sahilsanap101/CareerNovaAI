import type { Request, Response, NextFunction } from 'express';

import * as userService from '@/modules/users/services/user.service';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '@pathforge/shared-constants';
import type { UpdateProfileInput, UpdatePreferencesInput, ChangePasswordInput } from '@pathforge/shared-zod';

// ─── Get Me ───────────────────────────────────────────────────────

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getCurrentUser(req.user!.sub);
    sendSuccess(res, { message: 'User retrieved successfully.', data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Update Profile ───────────────────────────────────────────────

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.updateProfile(req.user!.sub, req.body as UpdateProfileInput);
    sendSuccess(res, { message: SUCCESS_MESSAGES.USER.PROFILE_UPDATED, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Update Preferences ───────────────────────────────────────────

export async function updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.updatePreferences(req.user!.sub, req.body as UpdatePreferencesInput);
    sendSuccess(res, { message: SUCCESS_MESSAGES.USER.PREFERENCES_UPDATED, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Change Password ──────────────────────────────────────────────

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.changePassword(req.user!.sub, req.body as ChangePasswordInput);
    sendSuccess(res, { message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
}

// ─── Delete Account ───────────────────────────────────────────────

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.deleteAccount(req.user!.sub);
    res.clearCookie('pf_refresh_token');
    sendSuccess(res, {
      message: SUCCESS_MESSAGES.USER.ACCOUNT_DELETED,
      statusCode: HTTP_STATUS.OK,
    });
  } catch (err) {
    next(err);
  }
}
