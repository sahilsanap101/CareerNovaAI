import 'dotenv/config';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from '@/config/env';
import { connectDatabase, disconnectDatabase } from '@/config/database';
import { verifyMailConnection } from '@/config/mail';
import { logger, morganStream } from '@/utils/logger';
import { globalErrorHandler, notFoundHandler } from '@/middleware/error.middleware';
import { apiLimiter } from '@/middleware/rateLimiter.middleware';
import { registerMailListeners } from '@/events/listeners/mail.listener';
import { registerAuditListeners } from '@/events/listeners/audit.listener';
import v1Router from '@/routes/index';

// ─── Create Express App ───────────────────────────────────────────

const app = express();

// ─── Security Middleware ──────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true, // Required for httpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Parsing Middleware ───────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────────────

app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: morganStream,
    skip: (req) => req.url === '/api/v1/health', // Don't log health checks
  }),
);

// ─── Rate Limiting ────────────────────────────────────────────────

app.use('/api/', apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────

app.use('/api/v1', v1Router);

// ─── 404 Handler ─────────────────────────────────────────────────

app.use(notFoundHandler);

// ─── Global Error Handler ─────────────────────────────────────────

app.use(globalErrorHandler);

// ─── Server Bootstrap ─────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  try {
    // Register event listeners
    registerMailListeners();
    registerAuditListeners();

    // Connect to database
    await connectDatabase();
    logger.info('✅ Database connected');

    // Verify mail transporter (non-blocking)
    void verifyMailConnection();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 PATHFORGE API running at http://localhost:${env.PORT}`);
      logger.info(`📚 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API base: http://localhost:${env.PORT}/api/v1`);
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('✅ Graceful shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

void bootstrap();

export default app;
