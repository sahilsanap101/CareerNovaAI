import { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { eventBus, EVENTS } from '@/events/eventBus';
import { logger } from '@/utils/logger';
import { AuditAction, AuditEntity } from '@pathforge/shared-enums';

/**
 * Audit Listener
 * Listens to domain events and writes structured audit log entries.
 * 
 * Every significant action is recorded with:
 * - userId, action, entity, entityId
 * - metadata (IP, user agent, etc.)
 * - createdAt (automatic)
 */

export function registerAuditListeners(): void {
  // Registration
  eventBus.on(EVENTS.USER_REGISTERED, async (payload: unknown) => {
    const { userId, ip } = payload as { userId: string; ip?: string };
    await writeAuditLog(userId, AuditAction.REGISTER, AuditEntity.USER, userId, { ip });
  });

  // Login
  eventBus.on(EVENTS.USER_LOGGED_IN, async (payload: unknown) => {
    const { userId, ip, device } = payload as { userId: string; ip?: string; device?: string };
    await writeAuditLog(userId, AuditAction.LOGIN, AuditEntity.SESSION, userId, { ip, device });
  });

  // Logout
  eventBus.on(EVENTS.USER_LOGGED_OUT, async (payload: unknown) => {
    const { userId } = payload as { userId: string };
    await writeAuditLog(userId, AuditAction.LOGOUT, AuditEntity.SESSION, userId);
  });

  // Password reset requested
  eventBus.on(EVENTS.PASSWORD_RESET_REQUESTED, async (payload: unknown) => {
    const { userId } = payload as { userId: string };
    await writeAuditLog(userId, AuditAction.PASSWORD_RESET_REQUESTED, AuditEntity.PASSWORD_RESET_TOKEN, userId);
  });

  // Password reset completed
  eventBus.on(EVENTS.PASSWORD_RESET_COMPLETED, async (payload: unknown) => {
    const { userId } = payload as { userId: string };
    await writeAuditLog(userId, AuditAction.PASSWORD_RESET_COMPLETED, AuditEntity.USER, userId);
  });

  // Email verified
  eventBus.on(EVENTS.EMAIL_VERIFIED, async (payload: unknown) => {
    const { userId } = payload as { userId: string };
    await writeAuditLog(userId, AuditAction.EMAIL_VERIFIED, AuditEntity.USER, userId);
  });

  // Profile updated
  eventBus.on(EVENTS.PROFILE_UPDATED, async (payload: unknown) => {
    const { userId, fields } = payload as { userId: string; fields: string[] };
    await writeAuditLog(userId, AuditAction.PROFILE_UPDATED, AuditEntity.PROFILE, userId, { fields });
  });

  // Password changed
  eventBus.on(EVENTS.PASSWORD_CHANGED, async (payload: unknown) => {
    const { userId } = payload as { userId: string };
    await writeAuditLog(userId, AuditAction.PASSWORD_CHANGED, AuditEntity.USER, userId);
  });

  // Account deleted
  eventBus.on(EVENTS.ACCOUNT_DELETED, async (payload: unknown) => {
    const { userId } = payload as { userId: string };
    await writeAuditLog(userId, AuditAction.ACCOUNT_DELETED, AuditEntity.USER, userId);
  });

  logger.info('✅ Audit listeners registered');
}

async function writeAuditLog(
  userId: string,
  action: AuditAction,
  entity: AuditEntity,
  entityId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action: action as string,
        entity: entity as string,
        entityId: entityId ?? null,
        metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });
  } catch (err) {
    // Audit logs must not block the main flow
    logger.error('Failed to write audit log', { userId, action, err });
  }
}
