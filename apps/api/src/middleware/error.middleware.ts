import type { Request, Response, NextFunction } from 'express';

import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from '@pathforge/shared-constants';
import { sendError } from '@/utils/response';
import { logger } from '@/utils/logger';

/**
 * Custom application error class.
 * Use this in services/controllers to throw structured errors.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string = ERROR_CODES.SERVER_001) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error-handling middleware.
 * Must have all 4 parameters (err, req, res, next) to be recognized by Express.
 *
 * - Never exposes stack traces in production.
 * - Differentiates between operational (expected) and programmer errors.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Operational errors: thrown intentionally by our code
  if (err instanceof AppError && err.isOperational) {
    sendError(res, {
      message: err.message,
      statusCode: err.statusCode,
      errors: [{ code: err.code, message: err.message }],
    });
    return;
  }

  // Prisma-specific errors
  if ('code' in err) {
    const prismaError = err as { code: string };
    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      sendError(res, {
        message: 'A record with this value already exists.',
        statusCode: HTTP_STATUS.CONFLICT,
        errors: [{ code: ERROR_CODES.AUTH_001, message: 'Duplicate field value' }],
      });
      return;
    }
    if (prismaError.code === 'P2025') {
      // Record not found
      sendError(res, {
        message: ERROR_MESSAGES.USER.NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
        errors: [{ code: ERROR_CODES.USER_001, message: 'Record not found' }],
      });
      return;
    }
  }

  // Unknown / programmer errors — don't expose details
  sendError(res, {
    message:
      process.env['NODE_ENV'] === 'production'
        ? ERROR_MESSAGES.SERVER.INTERNAL
        : err.message,
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors: [{ code: ERROR_CODES.SERVER_001, message: ERROR_MESSAGES.SERVER.INTERNAL }],
  });
}

/**
 * Middleware to handle 404 Not Found for unregistered routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, {
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: HTTP_STATUS.NOT_FOUND,
  });
}
