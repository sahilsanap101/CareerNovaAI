import { AppError } from '@/middleware/error.middleware';
import { eventBus, EVENTS } from '@/events/eventBus';
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from '@pathforge/shared-constants';
import {
  findUserById,
  updateUserName,
  updateUserProfile,
  updateUserPreferences,
  updateUserPassword,
  deleteUser,
} from '@/modules/users/repositories/user.repository';
import { hashPassword, comparePassword } from '@/utils/hash';
import type { UpdateProfileInput, UpdatePreferencesInput, ChangePasswordInput } from '@pathforge/shared-zod';

// ─── Get Current User ─────────────────────────────────────────────

export async function getCurrentUser(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  const { password: _, ...safeUser } = user;
  return safeUser;
}

// ─── Update Profile ───────────────────────────────────────────────

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  const { fullName, ...profileData } = data;

  if (fullName) {
    await updateUserName(userId, fullName);
  }

  if (Object.keys(profileData).length > 0) {
    await updateUserProfile(userId, profileData);
  }

  const updatedFields = Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined);
  eventBus.dispatch(EVENTS.PROFILE_UPDATED, { userId, fields: updatedFields });

  return getCurrentUser(userId);
}

// ─── Update Preferences ───────────────────────────────────────────

export async function updatePreferences(userId: string, data: UpdatePreferencesInput) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  await updateUserPreferences(userId, data as Parameters<typeof updateUserPreferences>[1]);
  return getCurrentUser(userId);
}

// ─── Change Password ──────────────────────────────────────────────

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  const isValid = await comparePassword(data.currentPassword, user.password);
  if (!isValid) {
    throw new AppError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_002);
  }

  const hashedPassword = await hashPassword(data.newPassword);
  await updateUserPassword(userId, hashedPassword);

  eventBus.dispatch(EVENTS.PASSWORD_CHANGED, { userId });
}

// ─── Delete Account ───────────────────────────────────────────────

export async function deleteAccount(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER.NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  eventBus.dispatch(EVENTS.ACCOUNT_DELETED, { userId });
  await deleteUser(userId);
}
