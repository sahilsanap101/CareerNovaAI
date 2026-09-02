import path from 'path';

import winston from 'winston';
import 'winston-daily-rotate-file';

import { env } from '@/config/env';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ─── Custom Format for Development Console ────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${String(ts)} [${level}] ${String(message)}${stack ? `\n${String(stack)}` : ''}${metaStr}`;
  }),
);

// ─── Production JSON Format ───────────────────────────────────────
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

// ─── Transports ───────────────────────────────────────────────────
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  }),
];

// Add file transports in production
if (env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: prodFormat,
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: prodFormat,
    }),
  );
}

// ─── Logger Instance ──────────────────────────────────────────────
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'pathforge-api' },
  transports,
  // Do not exit on handled exceptions
  exitOnError: false,
});

// ─── Morgan Stream for HTTP Logging ──────────────────────────────
export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};
