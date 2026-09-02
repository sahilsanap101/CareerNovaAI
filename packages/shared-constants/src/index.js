"use strict";
/**
 * @pathforge/shared-constants
 * All magic-string-free constants shared between frontend and backend.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.DESIGN_TOKENS = exports.PERMISSIONS = exports.VALIDATION = exports.JWT_CONFIG = exports.ERROR_MESSAGES = exports.SUCCESS_MESSAGES = exports.HTTP_STATUS = exports.ERROR_CODES = exports.APP_ROUTES = exports.API_ROUTES = void 0;
// ─── API Routes ───────────────────────────────────────────────────
exports.API_ROUTES = {
    AUTH: {
        REGISTER: '/api/v1/auth/register',
        LOGIN: '/api/v1/auth/login',
        LOGOUT: '/api/v1/auth/logout',
        FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
        RESET_PASSWORD: '/api/v1/auth/reset-password',
        REFRESH_TOKEN: '/api/v1/auth/refresh-token',
        VERIFY_EMAIL: '/api/v1/auth/verify-email',
    },
    USERS: {
        ME: '/api/v1/users/me',
        PROFILE: '/api/v1/users/profile',
        DELETE: '/api/v1/users/delete',
        PREFERENCES: '/api/v1/users/preferences',
    },
};
// ─── Frontend Routes ──────────────────────────────────────────────
exports.APP_ROUTES = {
    HOME: '/',
    ABOUT: '/about',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    NOT_FOUND: '/404',
};
// ─── Error Codes ──────────────────────────────────────────────────
exports.ERROR_CODES = {
    // Auth errors
    AUTH_001: 'AUTH_001', // Email already registered
    AUTH_002: 'AUTH_002', // Invalid credentials
    AUTH_003: 'AUTH_003', // Account not verified
    AUTH_004: 'AUTH_004', // Token expired
    AUTH_005: 'AUTH_005', // Token invalid
    AUTH_006: 'AUTH_006', // Refresh token missing
    AUTH_007: 'AUTH_007', // Refresh token invalid
    AUTH_008: 'AUTH_008', // Session not found
    // User / Profile errors
    USER_001: 'USER_001', // User not found
    USER_002: 'USER_002', // Profile not found
    USER_003: 'USER_003', // Insufficient permissions
    // Profile errors
    PROFILE_001: 'PROFILE_001', // Invalid CGPA range
    PROFILE_002: 'PROFILE_002', // Invalid graduation year
    // Validation errors
    VALIDATION_001: 'VALIDATION_001', // Request body validation failed
    // Server errors
    SERVER_001: 'SERVER_001', // Internal server error
    SERVER_002: 'SERVER_002', // Database error
    SERVER_003: 'SERVER_003', // External service error
};
// ─── HTTP Status Codes ────────────────────────────────────────────
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
};
// ─── Success Messages ─────────────────────────────────────────────
exports.SUCCESS_MESSAGES = {
    AUTH: {
        REGISTERED: 'Account created successfully. Please verify your email.',
        LOGGED_IN: 'Welcome back!',
        LOGGED_OUT: 'Logged out successfully.',
        PASSWORD_RESET_SENT: 'Password reset email sent. Please check your inbox.',
        PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
        TOKEN_REFRESHED: 'Token refreshed successfully.',
        EMAIL_VERIFIED: 'Email verified successfully.',
    },
    USER: {
        PROFILE_UPDATED: 'Profile updated successfully.',
        ACCOUNT_DELETED: 'Account deleted successfully.',
        PREFERENCES_UPDATED: 'Preferences updated successfully.',
    },
};
// ─── Error Messages ───────────────────────────────────────────────
exports.ERROR_MESSAGES = {
    AUTH: {
        EMAIL_EXISTS: 'An account with this email already exists.',
        INVALID_CREDENTIALS: 'Invalid email or password.',
        ACCOUNT_NOT_VERIFIED: 'Please verify your email before logging in.',
        TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
        TOKEN_INVALID: 'Invalid or malformed token.',
        REFRESH_TOKEN_MISSING: 'Refresh token not found.',
        REFRESH_TOKEN_INVALID: 'Invalid refresh token.',
        SESSION_NOT_FOUND: 'Session not found or already expired.',
    },
    USER: {
        NOT_FOUND: 'User not found.',
        PROFILE_NOT_FOUND: 'Profile not found.',
        INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
    },
    PROFILE: {
        INVALID_CGPA: 'CGPA must be between 0 and 10.',
        INVALID_GRAD_YEAR: 'Graduation year must be a valid year.',
    },
    VALIDATION: {
        FAILED: 'Request validation failed.',
    },
    SERVER: {
        INTERNAL: 'Something went wrong. Please try again later.',
    },
};
// ─── JWT Config ───────────────────────────────────────────────────
exports.JWT_CONFIG = {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    REFRESH_COOKIE_NAME: 'pf_refresh_token',
};
// ─── Validation Constraints ───────────────────────────────────────
exports.VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    BIO_MAX_LENGTH: 500,
    CGPA_MIN: 0,
    CGPA_MAX: 10,
    MIN_GRAD_YEAR: 2000,
    MAX_GRAD_YEAR: 2035,
};
// ─── Permissions (Role-based) ─────────────────────────────────────
exports.PERMISSIONS = {
    STUDENT: ['read:own_profile', 'write:own_profile', 'delete:own_account'],
    ADMIN: [
        'read:own_profile',
        'write:own_profile',
        'delete:own_account',
        'read:all_users',
        'write:all_users',
        'delete:all_users',
        'read:audit_logs',
    ],
};
// ─── Theme Tokens (Design System) ─────────────────────────────────
exports.DESIGN_TOKENS = {
    COLORS: {
        PRIMARY: '#2563EB', // Blue-600
        PRIMARY_DARK: '#1D4ED8', // Blue-700
        ACCENT: '#0EA5E9', // Sky-500
        SUCCESS: '#22C55E', // Green-500
        WARNING: '#F59E0B', // Amber-500
        ERROR: '#EF4444', // Red-500
        SURFACE: '#F8FAFC', // Slate-50
        SURFACE_DARK: '#0F172A', // Slate-900
    },
    FONTS: {
        SANS: "'Inter', 'system-ui', sans-serif",
        MONO: "'JetBrains Mono', 'Fira Code', monospace",
    },
    RADIUS: {
        SM: '0.375rem',
        MD: '0.5rem',
        LG: '0.75rem',
        XL: '1rem',
        FULL: '9999px',
    },
};
// ─── Rate Limiting ────────────────────────────────────────────────
exports.RATE_LIMITS = {
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 20,
    },
    API: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 200,
    },
};
//# sourceMappingURL=index.js.map