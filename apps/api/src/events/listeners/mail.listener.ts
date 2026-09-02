import { eventBus, EVENTS } from '@/events/eventBus';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/services/mail.service';
import { logger } from '@/utils/logger';

/**
 * Mail Listener
 * Listens to domain events and sends the appropriate emails.
 * 
 * Adding a new email is as simple as adding a new `eventBus.on(...)` here.
 */

export function registerMailListeners(): void {
  // User registered → send verification email
  eventBus.on(EVENTS.USER_REGISTERED, async (payload: unknown) => {
    const { email, fullName, token } = payload as {
      email: string;
      fullName: string;
      token: string;
    };

    try {
      await sendVerificationEmail(email, fullName, token);
    } catch (err) {
      logger.error('Failed to send verification email', { email, err });
    }
  });

  // Password reset requested → send reset email
  eventBus.on(EVENTS.PASSWORD_RESET_REQUESTED, async (payload: unknown) => {
    const { email, fullName, token } = payload as {
      email: string;
      fullName: string;
      token: string;
    };

    try {
      await sendPasswordResetEmail(email, fullName, token);
    } catch (err) {
      logger.error('Failed to send password reset email', { email, err });
    }
  });

  logger.info('✅ Mail listeners registered');
}
