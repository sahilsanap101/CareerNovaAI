/**
 * @pathforge/shared-constants
 * All magic-string-free constants shared between frontend and backend.
 */
export declare const API_ROUTES: {
    readonly AUTH: {
        readonly REGISTER: "/api/v1/auth/register";
        readonly LOGIN: "/api/v1/auth/login";
        readonly LOGOUT: "/api/v1/auth/logout";
        readonly FORGOT_PASSWORD: "/api/v1/auth/forgot-password";
        readonly RESET_PASSWORD: "/api/v1/auth/reset-password";
        readonly REFRESH_TOKEN: "/api/v1/auth/refresh-token";
        readonly VERIFY_EMAIL: "/api/v1/auth/verify-email";
    };
    readonly USERS: {
        readonly ME: "/api/v1/users/me";
        readonly PROFILE: "/api/v1/users/profile";
        readonly DELETE: "/api/v1/users/delete";
        readonly PREFERENCES: "/api/v1/users/preferences";
    };
};
export declare const APP_ROUTES: {
    readonly HOME: "/";
    readonly ABOUT: "/about";
    readonly LOGIN: "/login";
    readonly REGISTER: "/register";
    readonly FORGOT_PASSWORD: "/forgot-password";
    readonly RESET_PASSWORD: "/reset-password";
    readonly VERIFY_EMAIL: "/verify-email";
    readonly DASHBOARD: "/dashboard";
    readonly PROFILE: "/profile";
    readonly SETTINGS: "/settings";
    readonly NOT_FOUND: "/404";
};
export declare const ERROR_CODES: {
    readonly AUTH_001: "AUTH_001";
    readonly AUTH_002: "AUTH_002";
    readonly AUTH_003: "AUTH_003";
    readonly AUTH_004: "AUTH_004";
    readonly AUTH_005: "AUTH_005";
    readonly AUTH_006: "AUTH_006";
    readonly AUTH_007: "AUTH_007";
    readonly AUTH_008: "AUTH_008";
    readonly USER_001: "USER_001";
    readonly USER_002: "USER_002";
    readonly USER_003: "USER_003";
    readonly PROFILE_001: "PROFILE_001";
    readonly PROFILE_002: "PROFILE_002";
    readonly VALIDATION_001: "VALIDATION_001";
    readonly SERVER_001: "SERVER_001";
    readonly SERVER_002: "SERVER_002";
    readonly SERVER_003: "SERVER_003";
};
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const SUCCESS_MESSAGES: {
    readonly AUTH: {
        readonly REGISTERED: "Account created successfully. Please verify your email.";
        readonly LOGGED_IN: "Welcome back!";
        readonly LOGGED_OUT: "Logged out successfully.";
        readonly PASSWORD_RESET_SENT: "Password reset email sent. Please check your inbox.";
        readonly PASSWORD_RESET_SUCCESS: "Password reset successfully.";
        readonly TOKEN_REFRESHED: "Token refreshed successfully.";
        readonly EMAIL_VERIFIED: "Email verified successfully.";
    };
    readonly USER: {
        readonly PROFILE_UPDATED: "Profile updated successfully.";
        readonly ACCOUNT_DELETED: "Account deleted successfully.";
        readonly PREFERENCES_UPDATED: "Preferences updated successfully.";
    };
};
export declare const ERROR_MESSAGES: {
    readonly AUTH: {
        readonly EMAIL_EXISTS: "An account with this email already exists.";
        readonly INVALID_CREDENTIALS: "Invalid email or password.";
        readonly ACCOUNT_NOT_VERIFIED: "Please verify your email before logging in.";
        readonly TOKEN_EXPIRED: "Your session has expired. Please log in again.";
        readonly TOKEN_INVALID: "Invalid or malformed token.";
        readonly REFRESH_TOKEN_MISSING: "Refresh token not found.";
        readonly REFRESH_TOKEN_INVALID: "Invalid refresh token.";
        readonly SESSION_NOT_FOUND: "Session not found or already expired.";
    };
    readonly USER: {
        readonly NOT_FOUND: "User not found.";
        readonly PROFILE_NOT_FOUND: "Profile not found.";
        readonly INSUFFICIENT_PERMISSIONS: "You do not have permission to perform this action.";
    };
    readonly PROFILE: {
        readonly INVALID_CGPA: "CGPA must be between 0 and 10.";
        readonly INVALID_GRAD_YEAR: "Graduation year must be a valid year.";
    };
    readonly VALIDATION: {
        readonly FAILED: "Request validation failed.";
    };
    readonly SERVER: {
        readonly INTERNAL: "Something went wrong. Please try again later.";
    };
};
export declare const JWT_CONFIG: {
    readonly ACCESS_TOKEN_EXPIRY: "15m";
    readonly REFRESH_TOKEN_EXPIRY: "7d";
    readonly REFRESH_COOKIE_NAME: "pf_refresh_token";
};
export declare const VALIDATION: {
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly PASSWORD_MAX_LENGTH: 128;
    readonly NAME_MIN_LENGTH: 2;
    readonly NAME_MAX_LENGTH: 100;
    readonly BIO_MAX_LENGTH: 500;
    readonly CGPA_MIN: 0;
    readonly CGPA_MAX: 10;
    readonly MIN_GRAD_YEAR: 2000;
    readonly MAX_GRAD_YEAR: 2035;
};
export declare const PERMISSIONS: {
    readonly STUDENT: readonly ["read:own_profile", "write:own_profile", "delete:own_account"];
    readonly ADMIN: readonly ["read:own_profile", "write:own_profile", "delete:own_account", "read:all_users", "write:all_users", "delete:all_users", "read:audit_logs"];
};
export declare const DESIGN_TOKENS: {
    readonly COLORS: {
        readonly PRIMARY: "#2563EB";
        readonly PRIMARY_DARK: "#1D4ED8";
        readonly ACCENT: "#0EA5E9";
        readonly SUCCESS: "#22C55E";
        readonly WARNING: "#F59E0B";
        readonly ERROR: "#EF4444";
        readonly SURFACE: "#F8FAFC";
        readonly SURFACE_DARK: "#0F172A";
    };
    readonly FONTS: {
        readonly SANS: "'Inter', 'system-ui', sans-serif";
        readonly MONO: "'JetBrains Mono', 'Fira Code', monospace";
    };
    readonly RADIUS: {
        readonly SM: "0.375rem";
        readonly MD: "0.5rem";
        readonly LG: "0.75rem";
        readonly XL: "1rem";
        readonly FULL: "9999px";
    };
};
export declare const RATE_LIMITS: {
    readonly AUTH: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 20;
    };
    readonly API: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 200;
    };
};
//# sourceMappingURL=index.d.ts.map