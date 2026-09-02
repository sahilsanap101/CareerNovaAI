"use strict";
/**
 * @pathforge/shared-zod
 * Zod validation schemas shared between frontend and backend.
 * Single source of truth for all validation rules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferencesSchema = exports.updateProfileSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const shared_constants_1 = require("@pathforge/shared-constants");
// ─── Auth Schemas ─────────────────────────────────────────────────
exports.registerSchema = zod_1.z
    .object({
    fullName: zod_1.z
        .string()
        .min(shared_constants_1.VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${shared_constants_1.VALIDATION.NAME_MIN_LENGTH} characters`)
        .max(shared_constants_1.VALIDATION.NAME_MAX_LENGTH, `Name cannot exceed ${shared_constants_1.VALIDATION.NAME_MAX_LENGTH} characters`)
        .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
        .trim(),
    email: zod_1.z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: zod_1.z
        .string()
        .min(shared_constants_1.VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${shared_constants_1.VALIDATION.PASSWORD_MIN_LENGTH} characters`)
        .max(shared_constants_1.VALIDATION.PASSWORD_MAX_LENGTH, `Password cannot exceed ${shared_constants_1.VALIDATION.PASSWORD_MAX_LENGTH} characters`)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
// ─────────────────────────────────────────────────────────────────
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: zod_1.z.string().min(1, 'Password is required'),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
// ─────────────────────────────────────────────────────────────────
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address').toLowerCase().trim(),
});
// ─────────────────────────────────────────────────────────────────
exports.resetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    password: zod_1.z
        .string()
        .min(shared_constants_1.VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${shared_constants_1.VALIDATION.PASSWORD_MIN_LENGTH} characters`)
        .max(shared_constants_1.VALIDATION.PASSWORD_MAX_LENGTH)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
// ─────────────────────────────────────────────────────────────────
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(shared_constants_1.VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${shared_constants_1.VALIDATION.PASSWORD_MIN_LENGTH} characters`)
        .max(shared_constants_1.VALIDATION.PASSWORD_MAX_LENGTH)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
// ─── Profile Schemas ──────────────────────────────────────────────
const currentYear = new Date().getFullYear();
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .min(shared_constants_1.VALIDATION.NAME_MIN_LENGTH)
        .max(shared_constants_1.VALIDATION.NAME_MAX_LENGTH)
        .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
        .trim()
        .optional(),
    college: zod_1.z.string().min(2).max(200).trim().optional().nullable(),
    branch: zod_1.z.string().min(2).max(100).trim().optional().nullable(),
    degree: zod_1.z.string().min(2).max(100).trim().optional().nullable(),
    currentYear: zod_1.z
        .number()
        .int()
        .min(1, 'Year must be between 1 and 6')
        .max(6, 'Year must be between 1 and 6')
        .optional()
        .nullable(),
    graduationYear: zod_1.z
        .number()
        .int()
        .min(shared_constants_1.VALIDATION.MIN_GRAD_YEAR, `Graduation year must be after ${shared_constants_1.VALIDATION.MIN_GRAD_YEAR}`)
        .max(shared_constants_1.VALIDATION.MAX_GRAD_YEAR, `Graduation year must be before ${shared_constants_1.VALIDATION.MAX_GRAD_YEAR}`)
        .optional()
        .nullable(),
    cgpa: zod_1.z
        .number()
        .min(shared_constants_1.VALIDATION.CGPA_MIN, `CGPA must be at least ${shared_constants_1.VALIDATION.CGPA_MIN}`)
        .max(shared_constants_1.VALIDATION.CGPA_MAX, `CGPA cannot exceed ${shared_constants_1.VALIDATION.CGPA_MAX}`)
        .optional()
        .nullable(),
    bio: zod_1.z
        .string()
        .max(shared_constants_1.VALIDATION.BIO_MAX_LENGTH, `Bio cannot exceed ${shared_constants_1.VALIDATION.BIO_MAX_LENGTH} characters`)
        .trim()
        .optional()
        .nullable(),
    profileImage: zod_1.z.string().url('Profile image must be a valid URL').optional().nullable(),
});
// ─── Preferences Schema ───────────────────────────────────────────
exports.updatePreferencesSchema = zod_1.z.object({
    theme: zod_1.z.enum(['light', 'dark', 'system']).optional(),
    language: zod_1.z.enum(['en', 'hi']).optional(),
    notifications: zod_1.z.boolean().optional(),
    timezone: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map