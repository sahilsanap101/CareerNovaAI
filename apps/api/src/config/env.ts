import { z } from 'zod';

/**
 * Validates and types all environment variables at startup.
 * The app will crash immediately if any required variable is missing.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid PostgreSQL URL').optional().or(z.literal('')),

  // Supabase (Storage & Managed DB)
  SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email
  EMAIL_HOST: z.string().default('smtp.ethereal.email'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_SECURE: z.coerce.boolean().default(false),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('PATHFORGE <noreply@pathforge.dev>'),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('debug'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
