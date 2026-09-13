import { Router } from 'express';
import * as gateController from '../controllers/gate.controller';
import { authenticate } from '@/middleware/auth.middleware';
import gateAdminRoutes from './gateAdmin.routes';

const router = Router();

// ----- Public / Basic App Routes -----
router.get('/exams', gateController.getExams);
router.get('/exams/:year/papers', gateController.getPapersForYear);
router.get('/papers/:paperId/syllabus', gateController.getPaperSyllabus);
router.get('/questions', gateController.getQuestions);
router.get('/papers/:paperId/mocks', gateController.getMocksForPaper);

// ----- Protected User Routes -----
router.use(authenticate);

// Questions & Mocks
router.get('/questions', gateController.getQuestions);
router.get('/questions/personalized', gateController.getPersonalizedQuestions);
router.post('/questions/:id/attempt', gateController.attemptQuestion);
router.post('/questions/:id/bookmark', gateController.bookmarkQuestion);

// Practice Intelligence
router.post('/practice/session', gateController.startPracticeSession);
router.post('/practice/attempt/:id', gateController.recordPracticeAttempt);

// Adaptive Study Planner
router.get('/planner/daily', gateController.getDailyPlan);
router.put('/planner/session/:sessionId', gateController.updatePlannerSession);
router.post('/planner/regenerate', gateController.forceRegeneratePlan);

// Learning Resources Tracking
router.get('/resources', gateController.getRankedResources);
router.post('/resources/:id/action', gateController.logResourceAction);

// Mocks
router.get('/papers/:paperId/mocks', gateController.getMocksForPaper);
router.post('/mocks/generate', gateController.generateCustomMock);
router.post('/mocks/:id/start', gateController.startMockAttempt);
router.post('/mocks/attempts/:id/submit', gateController.submitMockAttempt);

// Prerequisite Graph Explorer
router.post('/study-plans', gateController.createStudyPlan);
router.get('/study-plans', gateController.getStudyPlans);
router.put('/sessions/:id/status', gateController.updateSessionStatus);

// Progress, Readiness, & Career Integration
router.post('/mastery', gateController.updateMastery);
router.get('/readiness/:year', gateController.getReadiness);
router.post('/readiness/:year/what-if', gateController.generateCounterfactual);
router.get('/integration/:year/allocation', gateController.getTimeAllocation);

// Onboarding & Diagnostics
router.get('/onboarding', gateController.getOnboarding);
router.put('/onboarding', gateController.saveOnboarding);
router.post('/onboarding/diagnostic/start', gateController.startDiagnostic);
router.post('/onboarding/diagnostic/submit', gateController.submitDiagnostic);

// Prerequisite Graph Explorer
router.get('/topics/:id/details', gateController.getTopicExplorer);
router.post('/topics/:id/check-cycles', gateController.checkGraphCycles);

// Revision Engine & Mistake Book
router.get('/revisions', gateController.getRevisionDashboard);
router.post('/revisions/mistake', gateController.logMistake);
router.post('/revisions/mistake/:id/resolve', gateController.resolveMistake);
router.post('/revisions/evaluate', gateController.evaluateRevision);

// ----- Admin Only -----
// Middleware should ideally check req.user.role === 'ADMIN'
router.get('/admin/sync-status', gateController.getSyncStatus);
router.post('/admin/sync/:examId', gateController.triggerSync);
router.use('/admin', gateAdminRoutes);

export default router;
