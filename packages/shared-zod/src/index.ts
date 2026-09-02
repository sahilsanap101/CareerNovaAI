/**
 * @pathforge/shared-zod
 * Zod validation schemas shared between frontend and backend.
 * Single source of truth for all validation rules.
 */

import { z } from 'zod';

import { VALIDATION } from '@pathforge/shared-constants';

// ─── Auth Schemas ─────────────────────────────────────────────────

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
      .max(VALIDATION.NAME_MAX_LENGTH, `Name cannot exceed ${VALIDATION.NAME_MAX_LENGTH} characters`)
      .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
      .trim(),
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z
      .string()
      .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
      .max(VALIDATION.PASSWORD_MAX_LENGTH, `Password cannot exceed ${VALIDATION.PASSWORD_MAX_LENGTH} characters`)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ─────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─────────────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ─────────────────────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
      .max(VALIDATION.PASSWORD_MAX_LENGTH)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─────────────────────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
      .max(VALIDATION.PASSWORD_MAX_LENGTH)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ─── Profile Schemas ──────────────────────────────────────────────

const emptyToNullString = (schema: z.ZodTypeAny) => z.preprocess((val) => (val === '' ? null : val), schema);
const emptyToNullNumber = (schema: z.ZodTypeAny) =>
  z.preprocess((val) => (val === '' || Number.isNaN(val) ? null : val), schema);

const currentYear = new Date().getFullYear();

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(VALIDATION.NAME_MIN_LENGTH)
    .max(VALIDATION.NAME_MAX_LENGTH)
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
    .optional(),
  college: emptyToNullString(z.string().min(2).max(200).trim().optional().nullable()),
  university: emptyToNullString(z.string().min(2).max(200).trim().optional().nullable()),
  degree: emptyToNullString(z.string().min(2).max(100).trim().optional().nullable()),
  branch: emptyToNullString(z.string().min(2).max(100).trim().optional().nullable()),
  specialization: emptyToNullString(z.string().min(2).max(100).trim().optional().nullable()),
  currentYear: emptyToNullNumber(
    z.number().int().min(1, 'Year must be between 1 and 6').max(6, 'Year must be between 1 and 6').optional().nullable()
  ),
  currentSemester: emptyToNullNumber(
    z.number().int().min(1, 'Semester must be between 1 and 12').max(12, 'Semester must be between 1 and 12').optional().nullable()
  ),
  graduationYear: emptyToNullNumber(
    z.number()
      .int()
      .min(VALIDATION.MIN_GRAD_YEAR, `Graduation year must be after ${VALIDATION.MIN_GRAD_YEAR}`)
      .max(VALIDATION.MAX_GRAD_YEAR, `Graduation year must be before ${VALIDATION.MAX_GRAD_YEAR}`)
      .optional()
      .nullable()
  ),
  cgpa: emptyToNullNumber(
    z.number()
      .min(VALIDATION.CGPA_MIN, `CGPA must be at least ${VALIDATION.CGPA_MIN}`)
      .max(VALIDATION.CGPA_MAX, `CGPA cannot exceed ${VALIDATION.CGPA_MAX}`)
      .optional()
      .nullable()
  ),
  bio: emptyToNullString(
    z.string().max(VALIDATION.BIO_MAX_LENGTH, `Bio cannot exceed ${VALIDATION.BIO_MAX_LENGTH} characters`).trim().optional().nullable()
  ),
  profileImage: emptyToNullString(z.string().url('Profile image must be a valid URL').optional().nullable()),
  city: emptyToNullString(z.string().max(100).trim().optional().nullable()),
  country: emptyToNullString(z.string().max(100).trim().optional().nullable()),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Preferences Schema ───────────────────────────────────────────

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'hi']).optional(),
  notifications: z.boolean().optional(),
  timezone: z.string().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

// ─── Phase 2: Skills Schemas ──────────────────────────────────────

export const userSkillSchema = z.object({
  skillId: z.string().min(1, 'Skill is required'),
  proficiency: z.number().int().min(1, 'Proficiency must be between 1 and 5').max(5, 'Proficiency must be between 1 and 5'),
  experienceMonths: z.number().int().min(0, 'Experience months cannot be negative'),
  confidence: z.number().int().min(0, 'Confidence must be between 0 and 100').max(100, 'Confidence must be between 0 and 100'),
});

export type UserSkillInput = z.infer<typeof userSkillSchema>;

// ─── Phase 2: Interests Schemas ───────────────────────────────────

export const userInterestSchema = z.object({
  interestId: z.string().min(1, 'Interest is required'),
  priority: z.number().int().min(1, 'Priority must be between 1 and 5').max(5, 'Priority must be between 1 and 5'),
});

export type UserInterestInput = z.infer<typeof userInterestSchema>;

// ─── Phase 2: Career Goals Schema ─────────────────────────────────

export const careerGoalSchema = z.object({
  preferredJobRole: emptyToNullString(z.string().max(150).optional().nullable()),
  preferredIndustry: emptyToNullString(z.string().max(150).optional().nullable()),
  preferredWorkMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
  preferredCountries: emptyToNullString(z.string().max(200).optional().nullable()),
  expectedSalary: emptyToNullString(z.string().max(100).optional().nullable()),
  higherStudies: z.boolean().optional().default(false),
  entrepreneurship: z.boolean().optional().default(false),
  governmentJobs: z.boolean().optional().default(false),
  startup: z.boolean().optional().default(false),
  research: z.boolean().optional().default(false),
});

export type CareerGoalInput = z.infer<typeof careerGoalSchema>;

// ─── Phase 2: Project Schema ──────────────────────────────────────

export const projectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().min(5, 'Description must be at least 5 characters').max(2000),
  technologies: z.string().min(1, 'Technologies are required').max(300),
  githubUrl: emptyToNullString(z.string().url('Invalid GitHub URL').optional().nullable()),
  demoUrl: emptyToNullString(z.string().url('Invalid Demo URL').optional().nullable()),
  completionStatus: z.enum(['COMPLETED', 'IN_PROGRESS', 'PLANNED']).default('COMPLETED'),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// ─── Phase 2: Certification Schema ───────────────────────────────

export const certificationSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  issuer: z.string().min(2, 'Issuer must be at least 2 characters').max(150),
  issueDate: emptyToNullString(z.string().optional().nullable()),
  credentialUrl: emptyToNullString(z.string().url('Invalid Credential URL').optional().nullable()),
});

export type CertificationInput = z.infer<typeof certificationSchema>;

// ─── Phase 2: Coding Platform Schema ─────────────────────────────

export const codingPlatformSchema = z.object({
  platform: z.string().min(1, 'Platform name is required'),
  username: z.string().min(1, 'Username is required').max(100),
  problemsSolved: z.number().int().min(0, 'Problems solved cannot be negative').default(0),
});

export type CodingPlatformInput = z.infer<typeof codingPlatformSchema>;

