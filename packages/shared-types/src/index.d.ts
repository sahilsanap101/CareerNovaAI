/**
 * @pathforge/shared-types
 * All TypeScript types and interfaces shared across frontend and backend.
 */
import type { Role, AuditAction, AuditEntity, Theme, Language, NotificationType } from '@pathforge/shared-enums';
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T | null;
    meta: PaginationMeta | null;
    errors: ApiError[] | null;
    timestamp: string;
}
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface ApiError {
    field?: string;
    code: string;
    message: string;
}
export interface User {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    profile: Profile | null;
    preferences: UserPreference | null;
}
export interface Profile {
    id: string;
    userId: string;
    college: string | null;
    branch: string | null;
    degree: string | null;
    currentYear: number | null;
    graduationYear: number | null;
    cgpa: number | null;
    bio: string | null;
    profileImage: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface UserPreference {
    id: string;
    userId: string;
    theme: Theme;
    language: Language;
    notifications: boolean;
    timezone: string;
    createdAt: string;
    updatedAt: string;
}
export interface Session {
    id: string;
    userId: string;
    device: string | null;
    browser: string | null;
    ip: string | null;
    expiresAt: string;
    createdAt: string;
}
export interface AuditLog {
    id: string;
    userId: string | null;
    action: AuditAction;
    entity: AuditEntity;
    entityId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}
export interface RegisterDto {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}
export interface LoginDto {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface ForgotPasswordDto {
    email: string;
}
export interface ResetPasswordDto {
    token: string;
    password: string;
    confirmPassword: string;
}
export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export interface RefreshTokenDto {
}
export interface UpdateProfileDto {
    fullName?: string;
    college?: string;
    branch?: string;
    degree?: string;
    currentYear?: number;
    graduationYear?: number;
    cgpa?: number;
    bio?: string;
    profileImage?: string;
}
export interface UpdatePreferencesDto {
    theme?: Theme;
    language?: Language;
    notifications?: boolean;
    timezone?: string;
}
export interface TokenPayload {
    sub: string;
    email: string;
    role: Role;
    sessionId: string;
    iat?: number;
    exp?: number;
}
export interface AuthResponse {
    user: Omit<User, 'profile' | 'preferences'>;
    accessToken: string;
    expiresIn: number;
}
export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
export interface ThemeState {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
}
export interface ToastVariant {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
export interface UiState {
    toasts: ToastVariant[];
    globalLoading: boolean;
}
export type { Role, AuditAction, AuditEntity, Theme, Language, NotificationType };
//# sourceMappingURL=index.d.ts.map