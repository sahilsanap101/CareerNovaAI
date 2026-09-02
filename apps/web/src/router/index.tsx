import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ProtectedRoute } from '@/router/ProtectedRoute';
import { PublicRoute } from '@/router/PublicRoute';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { Loader } from '@/components/ui/Loader';
import { PageTransition } from '@/components/layout/PageTransition';

// ─── Lazy-loaded pages ────────────────────────────────────────────
const Landing         = lazy(() => import('@/pages/Landing/Landing'));
const About           = lazy(() => import('@/pages/About/About'));
const Login           = lazy(() => import('@/pages/auth/Login/Login'));
const Register        = lazy(() => import('@/pages/auth/Register/Register'));
const ForgotPassword  = lazy(() => import('@/pages/auth/ForgotPassword/ForgotPassword'));
const ResetPassword   = lazy(() => import('@/pages/auth/ResetPassword/ResetPassword'));
const VerifyEmail     = lazy(() => import('@/pages/auth/VerifyEmail'));
const NotFound        = lazy(() => import('@/pages/errors/NotFound'));
const Dashboard       = lazy(() => import('@/pages/Dashboard/Dashboard'));
const Profile         = lazy(() => import('@/pages/Profile/Profile'));
const Settings        = lazy(() => import('@/pages/Settings/Settings'));
const Recommendations = lazy(() => import('@/pages/Recommendations/Recommendations'));
const CareerComparison = lazy(() => import('@/pages/Recommendations/CareerComparison').then((m) => ({ default: m.CareerComparison })));
const AnalyticsDashboard = lazy(() => import('@/pages/Analytics/AnalyticsDashboard'));
const RoadmapDashboard = lazy(() => import('@/pages/Roadmap/RoadmapDashboard'));
const SkillGraph = lazy(() => import('@/pages/Roadmap/SkillGraph').then((m) => ({ default: m.SkillGraph })));
const WeeklyPlanner = lazy(() => import('@/pages/Roadmap/WeeklyPlanner').then((m) => ({ default: m.WeeklyPlanner })));
const AiDashboard = lazy(() => import('@/pages/AI/AiDashboard'));
const ResumeIntelligence = lazy(() => import('@/pages/AI/ResumeIntelligence').then((m) => ({ default: m.ResumeIntelligence })));
const InterviewCoach = lazy(() => import('@/pages/AI/InterviewCoach').then((m) => ({ default: m.InterviewCoach })));

// ─── Router Config ────────────────────────────────────────────────
const router = createBrowserRouter([
  // ─ Public Pages ────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <PageTransition><Landing /></PageTransition> },
      { path: '/about', element: <PageTransition><About /></PageTransition> },
    ],
  },

  // ─ Auth Pages (redirect if already logged in) ──────────────────
  {
    element: <PublicRoute><AuthLayout /></PublicRoute>,
    children: [
      { path: '/login', element: <PageTransition><Login /></PageTransition> },
      { path: '/register', element: <PageTransition><Register /></PageTransition> },
      { path: '/forgot-password', element: <PageTransition><ForgotPassword /></PageTransition> },
      { path: '/reset-password', element: <PageTransition><ResetPassword /></PageTransition> },
      { path: '/verify-email', element: <PageTransition><VerifyEmail /></PageTransition> },
    ],
  },

  // ─ App Pages (require authentication) ─────────────────────────
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <PageTransition><Dashboard /></PageTransition> },
      { path: '/profile', element: <PageTransition><Profile /></PageTransition> },
      { path: '/settings', element: <PageTransition><Settings /></PageTransition> },
      { path: '/recommendations', element: <PageTransition><Recommendations /></PageTransition> },
      { path: '/career-comparison', element: <PageTransition><CareerComparison /></PageTransition> },
      { path: '/analytics', element: <PageTransition><AnalyticsDashboard /></PageTransition> },
      { path: '/roadmap', element: <PageTransition><RoadmapDashboard /></PageTransition> },
      { path: '/skill-graph', element: <PageTransition><SkillGraph /></PageTransition> },
      { path: '/planner', element: <PageTransition><WeeklyPlanner /></PageTransition> },
      { path: '/ai', element: <PageTransition><AiDashboard /></PageTransition> },
      { path: '/resume-intelligence', element: <PageTransition><ResumeIntelligence /></PageTransition> },
      { path: '/interview-coach', element: <PageTransition><InterviewCoach /></PageTransition> },
    ],
  },

  // ─ 404 ─────────────────────────────────────────────────────────
  { path: '*', element: <PageTransition><NotFound /></PageTransition> },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
