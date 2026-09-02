/**
 * @pathforge/shared-enums
 * All enumerations shared across frontend and backend.
 * Adding a value here auto-propagates to all consumers.
 */
export declare enum Role {
    STUDENT = "STUDENT",
    ADMIN = "ADMIN"
}
export declare enum AuditAction {
    REGISTER = "REGISTER",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    PASSWORD_CHANGED = "PASSWORD_CHANGED",
    PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED",
    PASSWORD_RESET_COMPLETED = "PASSWORD_RESET_COMPLETED",
    EMAIL_VERIFIED = "EMAIL_VERIFIED",
    PROFILE_UPDATED = "PROFILE_UPDATED",
    PROFILE_IMAGE_UPDATED = "PROFILE_IMAGE_UPDATED",
    ACCOUNT_DELETED = "ACCOUNT_DELETED"
}
export declare enum AuditEntity {
    USER = "USER",
    PROFILE = "PROFILE",
    SESSION = "SESSION",
    PASSWORD_RESET_TOKEN = "PASSWORD_RESET_TOKEN",
    VERIFICATION_TOKEN = "VERIFICATION_TOKEN"
}
export declare enum NotificationType {
    EMAIL = "EMAIL",
    IN_APP = "IN_APP",
    PUSH = "PUSH"
}
export declare enum Theme {
    LIGHT = "light",
    DARK = "dark",
    SYSTEM = "system"
}
export declare enum Language {
    EN = "en",
    HI = "hi"
}
//# sourceMappingURL=index.d.ts.map