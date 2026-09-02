import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '@/config/env';
import { HTTP_STATUS, ERROR_MESSAGES } from '@pathforge/shared-constants';
import type { TokenPayload } from '@pathforge/shared-types';
import { sendError } from '@/utils/response';

/**
 * Middleware that verifies the JWT access token from the Authorization header.
 * Attaches the decoded payload to req.user on success.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, {
      message: ERROR_MESSAGES.AUTH.TOKEN_INVALID,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    sendError(res, {
      message: ERROR_MESSAGES.AUTH.TOKEN_INVALID,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      sendError(res, {
        message: ERROR_MESSAGES.AUTH.TOKEN_EXPIRED,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
      return;
    }
    sendError(res, {
      message: ERROR_MESSAGES.AUTH.TOKEN_INVALID,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    });
  }
}

/**
 * Middleware factory that checks if the authenticated user has one of the required roles.
 * Must be used AFTER the authenticate middleware.
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, {
        message: ERROR_MESSAGES.AUTH.TOKEN_INVALID,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, {
        message: ERROR_MESSAGES.USER.INSUFFICIENT_PERMISSIONS,
        statusCode: HTTP_STATUS.FORBIDDEN,
      });
      return;
    }

    next();
  };
}
