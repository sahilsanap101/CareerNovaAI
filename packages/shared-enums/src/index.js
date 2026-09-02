"use strict";
/**
 * @pathforge/shared-enums
 * All enumerations shared across frontend and backend.
 * Adding a value here auto-propagates to all consumers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Language = exports.Theme = exports.NotificationType = exports.AuditEntity = exports.AuditAction = exports.Role = void 0;
// ─── User Roles ───────────────────────────────────────────────────
var Role;
(function (Role) {
    Role["STUDENT"] = "STUDENT";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
// ─── Audit Actions ────────────────────────────────────────────────
var AuditAction;
(function (AuditAction) {
    // Auth
    AuditAction["REGISTER"] = "REGISTER";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["PASSWORD_CHANGED"] = "PASSWORD_CHANGED";
    AuditAction["PASSWORD_RESET_REQUESTED"] = "PASSWORD_RESET_REQUESTED";
    AuditAction["PASSWORD_RESET_COMPLETED"] = "PASSWORD_RESET_COMPLETED";
    AuditAction["EMAIL_VERIFIED"] = "EMAIL_VERIFIED";
    // Profile
    AuditAction["PROFILE_UPDATED"] = "PROFILE_UPDATED";
    AuditAction["PROFILE_IMAGE_UPDATED"] = "PROFILE_IMAGE_UPDATED";
    // Account
    AuditAction["ACCOUNT_DELETED"] = "ACCOUNT_DELETED";
    // ─── Phase 2+ Placeholders ──────────────────────────────────────
    // ROADMAP_CREATED = 'ROADMAP_CREATED',
    // SGI_UPDATED = 'SGI_UPDATED',
    // MENTOR_USED = 'MENTOR_USED',
    // RESUME_ANALYZED = 'RESUME_ANALYZED',
    // GITHUB_ANALYZED = 'GITHUB_ANALYZED',
})(AuditAction || (exports.AuditAction = AuditAction = {}));
// ─── Audit Entities ───────────────────────────────────────────────
var AuditEntity;
(function (AuditEntity) {
    AuditEntity["USER"] = "USER";
    AuditEntity["PROFILE"] = "PROFILE";
    AuditEntity["SESSION"] = "SESSION";
    AuditEntity["PASSWORD_RESET_TOKEN"] = "PASSWORD_RESET_TOKEN";
    AuditEntity["VERIFICATION_TOKEN"] = "VERIFICATION_TOKEN";
})(AuditEntity || (exports.AuditEntity = AuditEntity = {}));
// ─── Notification Types (Phase 2+) ────────────────────────────────
var NotificationType;
(function (NotificationType) {
    NotificationType["EMAIL"] = "EMAIL";
    NotificationType["IN_APP"] = "IN_APP";
    NotificationType["PUSH"] = "PUSH";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// ─── Theme ────────────────────────────────────────────────────────
var Theme;
(function (Theme) {
    Theme["LIGHT"] = "light";
    Theme["DARK"] = "dark";
    Theme["SYSTEM"] = "system";
})(Theme || (exports.Theme = Theme = {}));
// ─── Language ─────────────────────────────────────────────────────
var Language;
(function (Language) {
    Language["EN"] = "en";
    Language["HI"] = "hi";
})(Language || (exports.Language = Language = {}));
//# sourceMappingURL=index.js.map