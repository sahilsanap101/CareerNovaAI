import jwt from 'jsonwebtoken';

import { env } from '@/config/env';
import type { TokenPayload } from '@pathforge/shared-types';

/**
 * Sign a new JWT access token.
 * Short-lived (15 minutes by default).
 */
export function signAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Sign a new JWT refresh token.
 * Long-lived (7 days by default). Stored in Session table and httpOnly cookie.
 */
export function signRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verify a JWT access token.
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

/**
 * Verify a JWT refresh token.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

/**
 * Calculate the expiry Date object for a refresh token.
 * Used when creating Session records.
 */
export function getRefreshTokenExpiry(): Date {
  const duration = env.REFRESH_EXPIRES_IN;
  const days = parseInt(duration.replace('d', ''), 10);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
