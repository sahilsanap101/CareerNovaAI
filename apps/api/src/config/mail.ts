import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { env } from './env';
import { logger } from '@/utils/logger';

let transporter: Transporter | null = null;
let etherealPreviewUser: { user: string; pass: string } | null = null;

/**
 * Creates the Nodemailer transporter.
 * - Development: Uses Ethereal Mail (auto-generated test account).
 *   Preview URLs are logged to the console after each email.
 * - Production: Uses the SMTP credentials from environment variables.
 */
async function createTransporter(): Promise<Transporter> {
  if (env.NODE_ENV === 'production' || (env.EMAIL_USER && env.EMAIL_PASS)) {
    // Production SMTP
    return nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_SECURE,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  // Development: Ethereal Mail
  if (!etherealPreviewUser) {
    etherealPreviewUser = await nodemailer.createTestAccount();
    logger.info(`📧 Ethereal Mail account created: ${etherealPreviewUser.user}`);
  }

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: etherealPreviewUser.user,
      pass: etherealPreviewUser.pass,
    },
  });
}

/**
 * Get the mail transporter (lazily initialized).
 */
export async function getMailTransporter(): Promise<Transporter> {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
}

/**
 * Verify the mail connection.
 */
export async function verifyMailConnection(): Promise<void> {
  try {
    const t = await getMailTransporter();
    await t.verify();
    logger.info('✅ Mail transporter verified');
  } catch (err) {
    logger.warn('⚠️  Mail transporter verification failed (email features may not work):', err);
  }
}
