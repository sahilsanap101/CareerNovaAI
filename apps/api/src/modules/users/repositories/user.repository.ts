import type { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';

// ─── Types ────────────────────────────────────────────────────────

export type UserWithRelations = Prisma.UserGetPayload<{
  include: { profile: true; preferences: true };
}>;

export type CreateUserData = {
  fullName: string;
  email: string;
  password: string;
};

// ─── User Repository ──────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<UserWithRelations | null> {
  return prisma.user.findUnique({
    where: { email },
    include: { profile: true, preferences: true },
  });
}

export async function findUserById(id: string): Promise<UserWithRelations | null> {
  return prisma.user.findUnique({
    where: { id },
    include: { profile: true, preferences: true },
  });
}

export async function createUser(data: CreateUserData): Promise<UserWithRelations> {
  return prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      profile: {
        create: {},
      },
      preferences: {
        create: {
          theme: 'system',
          language: 'en',
          notifications: true,
          timezone: 'Asia/Kolkata',
        },
      },
    },
    include: { profile: true, preferences: true },
  });
}

export async function markUserVerified(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });
}

export async function updateUserName(userId: string, fullName: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { fullName },
  });
}

export async function updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export async function updateUserProfile(
  userId: string,
  data: Prisma.ProfileUpdateInput,
): Promise<void> {
  const { userId: _, ...profileFields } = data as Prisma.ProfileUncheckedCreateInput;
  await prisma.profile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...profileFields,
    },
  });
}

export async function updateUserPreferences(
  userId: string,
  data: Prisma.UserPreferenceUpdateInput,
): Promise<void> {
  const { userId: _, ...prefFields } = data as Prisma.UserPreferenceUncheckedCreateInput;
  await prisma.userPreference.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...prefFields,
    },
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } });
}
