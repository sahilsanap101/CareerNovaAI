import { PrismaClient } from '@prisma/client';

import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma client singleton.
 * In development, reuses the same instance across hot reloads to avoid
 * exhausting database connections.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Connect to the database and verify the connection.
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

/**
 * Gracefully disconnect from the database.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
