import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';

import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from '@pathforge/shared-constants';
import { sendError } from '@/utils/response';
import { logger } from '@/utils/logger';

/**
 * Factory that creates a validation middleware for any Zod schema.
 * Validates req.body against the schema and attaches the parsed data.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register);
 */
export function validate<T>(schema: ZodSchema<T>, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const errors = zodError.errors.map((e) => ({
        field: e.path.join('.'),
        code: ERROR_CODES.VALIDATION_001,
        message: e.message,
      }));

      logger.debug('Validation failed', { errors, path: req.path });

      sendError(res, {
        message: ERROR_MESSAGES.VALIDATION.FAILED,
        statusCode: HTTP_STATUS.UNPROCESSABLE,
        errors,
      });
      return;
    }

    // Replace req[target] with the parsed (sanitized) data
    req[target] = result.data as typeof req[typeof target];
    next();
  };
}
