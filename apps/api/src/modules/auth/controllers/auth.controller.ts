import type { Request, Response, NextFunction } from 'express';

import * as authService from '@/modules/auth/services/auth.service';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS, SUCCESS_MESSAGES, JWT_CONFIG } from '@pathforge/shared-constants';
import { env } from '@/config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/',
};

// ─── Register ─────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.register(req.body as Parameters<typeof authService.register>[0], req.ip);
    sendSuccess(res, {
      message: result.message,
      data: { userId: result.userId, email: result.email },
      statusCode: HTTP_STATUS.CREATED,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Login ────────────────────────────────────────────────────────

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(
      req.body as Parameters<typeof authService.login>[0],
      {
        ip: req.ip,
        device: req.headers['user-agent'] ?? 'Unknown',
        browser: req.headers['user-agent'] ?? 'Unknown',
      },
    );

    const refreshExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    res.cookie(JWT_CONFIG.REFRESH_COOKIE_NAME, result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: refreshExpiry,
    });

    sendSuccess(res, {
      message: SUCCESS_MESSAGES.AUTH.LOGGED_IN,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: 15 * 60,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Logout ───────────────────────────────────────────────────────

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies[JWT_CONFIG.REFRESH_COOKIE_NAME] as string | undefined;

    if (refreshToken && req.user) {
      await authService.logout(refreshToken, req.user.sub);
    }

    res.clearCookie(JWT_CONFIG.REFRESH_COOKIE_NAME, COOKIE_OPTIONS);

    sendSuccess(res, { message: SUCCESS_MESSAGES.AUTH.LOGGED_OUT });
  } catch (err) {
    next(err);
  }
}

// ─── Refresh Token ────────────────────────────────────────────────

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshTokenValue = req.cookies[JWT_CONFIG.REFRESH_COOKIE_NAME] as string | undefined;

    const result = await authService.refreshAccessToken(refreshTokenValue ?? '');

    sendSuccess(res, {
      message: SUCCESS_MESSAGES.AUTH.TOKEN_REFRESHED,
      data: { accessToken: result.accessToken, expiresIn: 15 * 60 },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Forgot Password ──────────────────────────────────────────────

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email: string };
    await authService.forgotPassword(email, req.ip);

    sendSuccess(res, { message: SUCCESS_MESSAGES.AUTH.PASSWORD_RESET_SENT });
  } catch (err) {
    next(err);
  }
}

// ─── Reset Password ───────────────────────────────────────────────

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body as { token: string; password: string };
    await authService.resetPassword(token, password);

    sendSuccess(res, { message: SUCCESS_MESSAGES.AUTH.PASSWORD_RESET_SUCCESS });
  } catch (err) {
    next(err);
  }
}

// ─── Verify Email ─────────────────────────────────────────────────

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.query as { token: string };
    await authService.verifyEmail(token);

    sendSuccess(res, { message: SUCCESS_MESSAGES.AUTH.EMAIL_VERIFIED });
  } catch (err) {
    next(err);
  }
}
