import rateLimit from 'express-rate-limit';

import { HTTP_STATUS } from '@pathforge/shared-constants';
import { env } from '@/config/env';

/**
 * General API rate limiter applied to all routes.
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    data: null,
    meta: null,
    errors: null,
    timestamp: new Date().toISOString(),
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

/**
 * Strict rate limiter for authentication endpoints.
 * Much lower threshold to prevent brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    data: null,
    meta: null,
    errors: null,
    timestamp: new Date().toISOString(),
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Very strict limiter for password reset requests.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again after 1 hour.',
    data: null,
    meta: null,
    errors: null,
    timestamp: new Date().toISOString(),
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});
