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
const Landing = lazy(() => import('@/pages/Landing/Landing'));
const About = lazy(() => import('@/pages/About/About'));
const Login = lazy(() => import('@/pages/auth/Login/Login'));
const Register = lazy(() => import('@/pages/auth/Register/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));
const NotFound = lazy(() => import('@/pages/errors/NotFound'));
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));
const Settings = lazy(() => import('@/pages/Settings/Settings'));
const GateDashboardPage = lazy(() => import('@/pages/Gate/GateDashboardPage'));
const GateSyllabusPage = lazy(() => import('@/pages/Gate/GateSyllabusPage'));
const GatePracticePage = lazy(() => import('@/pages/Gate/GatePracticePage'));
const GatePracticeAttemptsPage = lazy(() => import('@/pages/Gate/GatePracticeAttemptsPage'));
const GatePlannerPage = lazy(() => import('@/pages/Gate/GatePlannerPage'));
const GateStudyPage = lazy(() => import('@/pages/Gate/GateStudyPage'));
const GateMistakesPage = lazy(() => import('@/pages/Gate/GateMistakesPage'));
const GateRevisionHubPage = lazy(() => import('@/pages/Gate/GateRevisionHubPage'));
const GateMockTestsPage = lazy(() => import('@/pages/Gate/GateMockTestsPage'));
const GateAnalyticsPage = lazy(() => import('@/pages/Gate/GateAnalyticsPage'));
const GateReadinessPage = lazy(() => import('@/pages/Gate/GateReadinessPage').then(m => ({ default: m.GateReadinessPage })));
const Recommendations = lazy(() => import('@/pages/Recommendations/Recommendations'));
const CareerComparison = lazy(() => import('@/pages/Recommendations/CareerComparison').then((m) => ({ default: m.CareerComparison })));
const AnalyticsDashboard = lazy(() => import('@/pages/Analytics/AnalyticsDashboard'));
const RoadmapDashboard = lazy(() => import('@/pages/Roadmap/RoadmapDashboard'));
const SkillGraph = lazy(() => import('@/pages/Roadmap/SkillGraph').then((m) => ({ default: m.SkillGraph })));
const WeeklyPlanner = lazy(() => import('@/pages/Roadmap/WeeklyPlanner').then((m) => ({ default: m.WeeklyPlanner })));
const AiDashboard = lazy(() => import('@/pages/AI/AiDashboard'));
const ResumeIntelligence = lazy(() => import('@/pages/AI/ResumeIntelligence').then((m) => ({ default: m.ResumeIntelligence })));
const InterviewCoach = lazy(() => import('@/pages/AI/InterviewCoach').then((m) => ({ default: m.InterviewCoach })));
const SuccessStoriesPage = lazy(() => import('@/pages/SuccessStoriesPage').then((m) => ({ default: m.SuccessStoriesPage })));
const LiveJobsPage = lazy(() => import('@/pages/LiveJobsPage'));

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
      { path: '/gate', element: <PageTransition><GateDashboardPage /></PageTransition> },
      { path: '/gate/syllabus', element: <PageTransition><GateSyllabusPage /></PageTransition> },
      { path: '/gate/practice', element: <PageTransition><GatePracticePage /></PageTransition> },
      { path: '/gate/attempts', element: <PageTransition><GatePracticeAttemptsPage /></PageTransition> },
      { path: '/gate/planner', element: <PageTransition><GatePlannerPage /></PageTransition> },
      { path: '/gate/study', element: <PageTransition><GateStudyPage /></PageTransition> },
      { path: '/gate/mistakes', element: <PageTransition><GateMistakesPage /></PageTransition> },
      { path: '/gate/revisions', element: <PageTransition><GateRevisionHubPage /></PageTransition> },
      { path: '/gate/mocks', element: <PageTransition><GateMockTestsPage /></PageTransition> },
      { path: '/gate/analytics', element: <PageTransition><GateAnalyticsPage /></PageTransition> },
      { path: '/gate/readiness', element: <PageTransition><GateReadinessPage /></PageTransition> },
      { path: '/resume-intelligence', element: <PageTransition><ResumeIntelligence /></PageTransition> },
      { path: '/interview-coach', element: <PageTransition><InterviewCoach /></PageTransition> },
      { path: '/success-stories', element: <PageTransition><SuccessStoriesPage /></PageTransition> },
      { path: '/live-jobs', element: <PageTransition><LiveJobsPage /></PageTransition> },
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
