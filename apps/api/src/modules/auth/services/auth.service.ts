import { AppError } from '@/middleware/error.middleware';
import { eventBus, EVENTS } from '@/events/eventBus';
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@pathforge/shared-constants';
import type { Role } from '@pathforge/shared-enums';
import {
  findUserByEmail,
  createUser,
  markUserVerified,
  updateUserPassword,
} from '@/modules/users/repositories/user.repository';
import {
  createPasswordResetToken,
  findValidPasswordResetToken,
  deletePasswordResetTokens,
  createVerificationToken,
  findValidVerificationToken,
  deleteVerificationTokens,
  createSession,
  findSessionByToken,
  deleteSession,
  deleteAllUserSessions,
} from '@/modules/auth/repositories/auth.repository';
import { hashPassword, comparePassword } from '@/utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '@/services/token.service';
import type { RegisterInput, LoginInput } from '@pathforge/shared-zod';

// ─── Register ─────────────────────────────────────────────────────

export async function register(data: RegisterInput, ip?: string) {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new AppError(ERROR_MESSAGES.AUTH.EMAIL_EXISTS, HTTP_STATUS.CONFLICT, ERROR_CODES.AUTH_001);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await createUser({
    fullName: data.fullName,
    email: data.email,
    password: hashedPassword,
  });

  const verificationToken = await createVerificationToken(user.id);

  eventBus.dispatch(EVENTS.USER_REGISTERED, {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    token: verificationToken,
    ip,
  });

  return {
    message: SUCCESS_MESSAGES.AUTH.REGISTERED,
    userId: user.id,
    email: user.email,
  };
}

// ─── Login ────────────────────────────────────────────────────────

export async function login(
  data: LoginInput,
  meta: { ip?: string; device?: string; browser?: string },
) {
  const user = await findUserByEmail(data.email);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_002);
  }

  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_002);
  }

  const tokenPayload = { sub: user.id, email: user.email, role: user.role as Role, sessionId: '' };

  const refreshToken = signRefreshToken({ ...tokenPayload, sessionId: '' });
  const session = await createSession({
    userId: user.id,
    refreshToken,
    expiresAt: getRefreshTokenExpiry(),
    device: meta.device,
    browser: meta.browser,
    ip: meta.ip,
  });

  const accessToken = signAccessToken({ ...tokenPayload, sessionId: session.id });

  eventBus.dispatch(EVENTS.USER_LOGGED_IN, {
    userId: user.id,
    ip: meta.ip,
    device: meta.device,
  });

  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
    sessionId: session.id,
  };
}

// ─── Logout ───────────────────────────────────────────────────────

export async function logout(refreshToken: string, userId: string): Promise<void> {
  await deleteSession(refreshToken);
  eventBus.dispatch(EVENTS.USER_LOGGED_OUT, { userId });
}

// ─── Refresh Token ────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) {
    throw new AppError(ERROR_MESSAGES.AUTH.REFRESH_TOKEN_MISSING, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_006);
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(ERROR_MESSAGES.AUTH.REFRESH_TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_007);
  }

  const session = await findSessionByToken(refreshToken);
  if (!session || session.expiresAt < new Date()) {
    throw new AppError(ERROR_MESSAGES.AUTH.SESSION_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_008);
  }

  const accessToken = signAccessToken({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    sessionId: session.id,
  });

  return { accessToken };
}

// ─── Forgot Password ──────────────────────────────────────────────

export async function forgotPassword(email: string, ip?: string) {
  const user = await findUserByEmail(email);
  if (!user) return;

  const token = await createPasswordResetToken(user.id);

  eventBus.dispatch(EVENTS.PASSWORD_RESET_REQUESTED, {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    token,
    ip,
  });
}

// ─── Reset Password ───────────────────────────────────────────────

export async function resetPassword(token: string, newPassword: string) {
  const record = await findValidPasswordResetToken(token);
  if (!record) {
    throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_INVALID, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.AUTH_005);
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(record.userId, hashedPassword);
  await deletePasswordResetTokens(record.userId);
  await deleteAllUserSessions(record.userId);

  eventBus.dispatch(EVENTS.PASSWORD_RESET_COMPLETED, { userId: record.userId });
}

// ─── Verify Email ─────────────────────────────────────────────────

export async function verifyEmail(token: string) {
  const record = await findValidVerificationToken(token);
  if (!record) {
    throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_INVALID, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.AUTH_005);
  }

  await markUserVerified(record.userId);
  await deleteVerificationTokens(record.userId);

  eventBus.dispatch(EVENTS.EMAIL_VERIFIED, { userId: record.userId });
}
