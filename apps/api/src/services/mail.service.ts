import nodemailer from 'nodemailer';

import { getMailTransporter } from '@/config/mail';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

// ─── Email Templates ──────────────────────────────────────────────

function getBaseEmailTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; font-family: 'Inter', system-ui, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
    .header { background: linear-gradient(135deg, #2563EB, #0EA5E9); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px; }
    .body { padding: 40px 32px; color: #334155; }
    .body h2 { font-size: 20px; margin: 0 0 16px; color: #0f172a; }
    .body p { line-height: 1.7; margin: 0 0 16px; font-size: 15px; color: #475569; }
    .btn { display: inline-block; background: #2563EB; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 16px; }
    .btn:hover { background: #1d4ed8; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .footer { background: #f8fafc; padding: 24px 32px; text-align: center; }
    .footer p { color: #94a3b8; font-size: 13px; margin: 0; }
    .token-box { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 14px; word-break: break-all; color: #334155; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ PATHFORGE</h1>
      <p>AI-Powered Career Navigation</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} PATHFORGE. This email was sent to you because you registered on our platform.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─── Send Helpers ─────────────────────────────────────────────────

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transporter = await getMailTransporter();

  const info = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  // Log Ethereal preview URL in development
  if (env.NODE_ENV !== 'production') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`📧 Email preview URL: ${previewUrl}`);
    }
  }

  logger.debug('Email sent', { to: options.to, subject: options.subject });
}

// ─── Email Functions ──────────────────────────────────────────────

/**
 * Send email verification email.
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  const content = `
    <h2>Verify your email, ${name.split(' ')[0]}!</h2>
    <p>Welcome to PATHFORGE — your AI-powered career navigation platform. Please verify your email address to get started.</p>
    <a href="${verifyUrl}" class="btn">✅ Verify Email</a>
    <p>Or copy this link into your browser:</p>
    <div class="token-box">${verifyUrl}</div>
    <hr class="divider" />
    <p>This link expires in <strong>24 hours</strong>.</p>
  `;

  await sendMail({
    to,
    subject: '✅ Verify your PATHFORGE email',
    html: getBaseEmailTemplate('Verify your email', content),
  });
}

/**
 * Send password reset email.
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  const content = `
    <h2>Reset your password</h2>
    <p>Hi ${name.split(' ')[0]}, we received a request to reset your PATHFORGE password.</p>
    <a href="${resetUrl}" class="btn">🔐 Reset Password</a>
    <p>Or copy this link into your browser:</p>
    <div class="token-box">${resetUrl}</div>
    <hr class="divider" />
    <p>This link expires in <strong>1 hour</strong>.</p>
    <p>If you didn't request a password reset, please ignore this email — your password will not be changed.</p>
  `;

  await sendMail({
    to,
    subject: '🔐 Reset your PATHFORGE password',
    html: getBaseEmailTemplate('Reset your password', content),
  });
}
