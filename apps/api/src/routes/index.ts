import { Router } from 'express';

import authRoutes from '@/modules/auth/routes/auth.routes';
import userRoutes from '@/modules/users/routes/user.routes';
import profileRoutes from '@/modules/profile/routes/profile.routes';
import recRoutes from '@/modules/recommendations/routes/recommendation.routes';
import roadmapRoutes from '@/modules/roadmap/routes/roadmap.routes';
import aiRoutes from '@/modules/ai/routes/ai.routes';
import platformRoutes from '@/modules/platform/routes/platform.routes';
import gateRoutes from '@/modules/gate/routes/gate.routes';

const v1Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/profile', profileRoutes);
v1Router.use('/skills', profileRoutes);
v1Router.use('/interests', profileRoutes);
v1Router.use('/', recRoutes);
v1Router.use('/', roadmapRoutes);
v1Router.use('/ai', aiRoutes);
v1Router.use('/platform', platformRoutes);
v1Router.use('/gate', gateRoutes);

// ─── Health Check ─────────────────────────────────────────────────
v1Router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'PathForge API is running',
    data: {
      version: 'v1',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    meta: null,
    errors: null,
    timestamp: new Date().toISOString(),
  });
});

// ─── Future module routes (Phase 2+) ─────────────────────────────
// v1Router.use('/career', careerRoutes);
// v1Router.use('/roadmap', roadmapRoutes);
// v1Router.use('/resume', resumeRoutes);
// v1Router.use('/mentor', mentorRoutes);
// v1Router.use('/analytics', analyticsRoutes);

export default v1Router;
