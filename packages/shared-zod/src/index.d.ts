/**
 * @pathforge/shared-zod
 * Zod validation schemas shared between frontend and backend.
 * Single source of truth for all validation rules.
 */
import { z } from 'zod';
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}>, {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    rememberMe: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    rememberMe: boolean;
}, {
    email: string;
    password: string;
    rememberMe?: boolean | undefined;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export declare const resetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    password: string;
    confirmPassword: string;
}, {
    token: string;
    password: string;
    confirmPassword: string;
}>, {
    token: string;
    password: string;
    confirmPassword: string;
}, {
    token: string;
    password: string;
    confirmPassword: string;
}>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export declare const updateProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    college: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    branch: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    degree: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    currentYear: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    graduationYear: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    cgpa: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    profileImage: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    fullName?: string | undefined;
    college?: string | null | undefined;
    branch?: string | null | undefined;
    degree?: string | null | undefined;
    currentYear?: number | null | undefined;
    graduationYear?: number | null | undefined;
    cgpa?: number | null | undefined;
    bio?: string | null | undefined;
    profileImage?: string | null | undefined;
}, {
    fullName?: string | undefined;
    college?: string | null | undefined;
    branch?: string | null | undefined;
    degree?: string | null | undefined;
    currentYear?: number | null | undefined;
    graduationYear?: number | null | undefined;
    cgpa?: number | null | undefined;
    bio?: string | null | undefined;
    profileImage?: string | null | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export declare const updatePreferencesSchema: z.ZodObject<{
    theme: z.ZodOptional<z.ZodEnum<["light", "dark", "system"]>>;
    language: z.ZodOptional<z.ZodEnum<["en", "hi"]>>;
    notifications: z.ZodOptional<z.ZodBoolean>;
    timezone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    theme?: "light" | "dark" | "system" | undefined;
    language?: "en" | "hi" | undefined;
    notifications?: boolean | undefined;
    timezone?: string | undefined;
}, {
    theme?: "light" | "dark" | "system" | undefined;
    language?: "en" | "hi" | undefined;
    notifications?: boolean | undefined;
    timezone?: string | undefined;
}>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
//# sourceMappingURL=index.d.ts.map