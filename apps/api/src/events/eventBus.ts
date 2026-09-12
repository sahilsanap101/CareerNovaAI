import { EventEmitter } from 'events';

import { logger } from '@/utils/logger';

/**
 * PathForge Event Bus
 * 
 * Implements the Observer / Event-Driven pattern for decoupling business logic.
 * 
 * Instead of:
 *   controller → service → mailService (tight coupling)
 * 
 * We use:
 *   controller → emit event → listeners handle side effects
 * 
 * This makes it trivial to add new side effects (AI welcome, notifications,
 * audit logs, analytics) without modifying the core auth flow.
 */

export const EVENTS = {
  // Auth events
  USER_REGISTERED: 'user:registered',
  USER_LOGGED_IN: 'user:logged_in',
  USER_LOGGED_OUT: 'user:logged_out',
  PASSWORD_RESET_REQUESTED: 'user:password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'user:password_reset_completed',
  EMAIL_VERIFIED: 'user:email_verified',
  PASSWORD_CHANGED: 'user:password_changed',

  // Profile events
  PROFILE_UPDATED: 'profile:updated',

  // Account events
  ACCOUNT_DELETED: 'account:deleted',

  // Phase 2+ events (defined now, implemented later)
  // ROADMAP_CREATED: 'roadmap:created',
  // MENTOR_SESSION_STARTED: 'mentor:session_started',
  // RESUME_ANALYZED: 'resume:analyzed',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

class PathForgeEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20); // Allow multiple listeners per event
  }

  /**
   * Emit an event with typed name and payload.
   */
  dispatch<T>(event: EventName, payload: T): boolean {
    logger.debug(`Event dispatched: ${event}`, { payload });
    return this.emit(event, payload);
  }

  /**
   * Register a listener for an event.
   */
  on(event: EventName, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }
}

export const eventBus = new PathForgeEventBus();
