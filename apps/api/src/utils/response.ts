import type { Response } from 'express';

import type { ApiResponse, PaginationMeta } from '@pathforge/shared-types';
import { HTTP_STATUS } from '@pathforge/shared-constants';

/**
 * Send a standardized success response.
 */
export function sendSuccess<T>(
  res: Response,
  options: {
    message: string;
    data?: T;
    meta?: PaginationMeta;
    statusCode?: number;
  },
): Response {
  const { message, data = null, meta = null, statusCode = HTTP_STATUS.OK } = options;

  const body: ApiResponse<T> = {
    success: true,
    message,
    data: data ?? null,
    meta,
    errors: null,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(body);
}

/**
 * Send a standardized error response.
 */
export function sendError(
  res: Response,
  options: {
    message: string;
    statusCode?: number;
    errors?: Array<{ field?: string; code: string; message: string }>;
  },
): Response {
  const { message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null } = options;

  const body: ApiResponse<never> = {
    success: false,
    message,
    data: null,
    meta: null,
    errors,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(body);
}
