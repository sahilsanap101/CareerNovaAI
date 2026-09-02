/**
 * @pathforge/shared-enums
 * All enumerations shared across frontend and backend.
 * Adding a value here auto-propagates to all consumers.
 */

// ─── User Roles ───────────────────────────────────────────────────
export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

// ─── Audit Actions ────────────────────────────────────────────────
export enum AuditAction {
  // Auth
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',

  // Profile
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  PROFILE_IMAGE_UPDATED = 'PROFILE_IMAGE_UPDATED',

  // Account
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',

  // ─── Phase 2+ Placeholders ──────────────────────────────────────
  // ROADMAP_CREATED = 'ROADMAP_CREATED',
  // SGI_UPDATED = 'SGI_UPDATED',
  // MENTOR_USED = 'MENTOR_USED',
  // RESUME_ANALYZED = 'RESUME_ANALYZED',
  // GITHUB_ANALYZED = 'GITHUB_ANALYZED',
}

// ─── Audit Entities ───────────────────────────────────────────────
export enum AuditEntity {
  USER = 'USER',
  PROFILE = 'PROFILE',
  SESSION = 'SESSION',
  PASSWORD_RESET_TOKEN = 'PASSWORD_RESET_TOKEN',
  VERIFICATION_TOKEN = 'VERIFICATION_TOKEN',
}

// ─── Notification Types (Phase 2+) ────────────────────────────────
export enum NotificationType {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
}

// ─── Theme ────────────────────────────────────────────────────────
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

// ─── Language ─────────────────────────────────────────────────────
export enum Language {
  EN = 'en',
  HI = 'hi',
}
