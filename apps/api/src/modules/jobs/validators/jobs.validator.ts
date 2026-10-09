/**
 * Zod validators for the Live Jobs API.
 *
 * These schemas are the single source of truth for all request shapes.
 * They are used by the validate() middleware to sanitize and type-narrow
 * request bodies BEFORE they reach the controller.
 *
 * IMPORTANT: userId is NEVER accepted from request bodies here.
 * All ownership is derived from req.user.sub (JWT payload).
 */

import { z } from 'zod';

// ─── Application Status Enum ─────────────────────────────────────────────

export const APP_STATUS_VALUES = [
    'SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED',
] as const;

// ─── Body Schemas ─────────────────────────────────────────────────────────

/**
 * POST /live-jobs/:id/application
 * Optional notes when marking a job as applied.
 */
export const createApplicationSchema = z.object({
    status: z
        .enum(APP_STATUS_VALUES, {
            errorMap: () => ({
                message: `Status must be one of: ${APP_STATUS_VALUES.join(', ')}`,
            }),
        })
        .optional()
        .default('APPLIED'),
    notes: z
        .string()
        .max(1000, 'Notes must be under 1000 characters')
        .optional(),
});

/**
 * PATCH /live-jobs/applications/:id
 * Update application status and/or notes.
 */
export const updateApplicationSchema = z.object({
    status: z.enum(APP_STATUS_VALUES, {
        errorMap: () => ({
            message: `Status must be one of: ${APP_STATUS_VALUES.join(', ')}`,
        }),
    }),
    notes: z
        .string()
        .max(1000, 'Notes must be under 1000 characters')
        .optional(),
});

// ─── Query Schemas ────────────────────────────────────────────────────────

/**
 * GET /live-jobs and GET /live-jobs/recommended
 * Validated query-string filters.
 */
export const liveJobsQuerySchema = z.object({
    career: z.string().max(100).optional(),
    location: z.string().max(100).optional(),
    type: z.enum(['all', 'jobs', 'internships']).optional(),
    minMatch: z
        .string()
        .regex(/^\d+$/, 'minMatch must be a non-negative integer')
        .transform(Number)
        .refine((n) => n >= 0 && n <= 100, 'minMatch must be between 0 and 100')
        .optional(),
    search: z.string().max(200).optional(),
    page: z
        .string()
        .regex(/^\d+$/, 'page must be a positive integer')
        .transform(Number)
        .refine((n) => n >= 1, 'page must be >= 1')
        .optional()
        .default('1'),
    limit: z
        .string()
        .regex(/^\d+$/, 'limit must be a positive integer')
        .transform(Number)
        .refine((n) => n >= 1 && n <= 100, 'limit must be between 1 and 100')
        .optional()
        .default('20'),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type LiveJobsQuery = z.infer<typeof liveJobsQuerySchema>;
