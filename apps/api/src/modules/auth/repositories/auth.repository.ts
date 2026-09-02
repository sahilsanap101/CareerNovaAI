import crypto from 'crypto';
import { prisma } from '@/config/database';

// ─── Token Utilities ──────────────────────────────────────────────

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ─── Password Reset Tokens ────────────────────────────────────────

export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  await prisma.passwordResetToken.create({
    data: { userId, token: hashedToken, expiresAt },
  });

  return rawToken;
}

export async function findValidPasswordResetToken(rawToken: string) {
  const hashedToken = hashToken(rawToken);

  return prisma.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
}

export async function deletePasswordResetTokens(userId: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
}

// ─── Verification Tokens ──────────────────────────────────────────

export async function createVerificationToken(userId: string): Promise<string> {
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.deleteMany({ where: { userId } });

  await prisma.verificationToken.create({
    data: { userId, token: hashedToken, expiresAt },
  });

  return rawToken;
}

export async function findValidVerificationToken(rawToken: string) {
  const hashedToken = hashToken(rawToken);

  return prisma.verificationToken.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
}

export async function deleteVerificationTokens(userId: string): Promise<void> {
  await prisma.verificationToken.deleteMany({ where: { userId } });
}

// ─── Session Operations ───────────────────────────────────────────

export async function createSession(data: {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  device?: string;
  browser?: string;
  ip?: string;
}) {
  return prisma.session.create({ data });
}

export async function findSessionByToken(refreshToken: string) {
  return prisma.session.findUnique({
    where: { refreshToken },
    include: { user: { include: { profile: true, preferences: true } } },
  });
}

export async function deleteSession(refreshToken: string): Promise<void> {
  await prisma.session.deleteMany({ where: { refreshToken } });
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function findUserSessions(userId: string) {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
}
