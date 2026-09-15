import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import * as gateController from '../controllers/gate.controller';

const router = Router();

router.use(authenticate);

router.get('/analytics', gateController.getGateAnalytics);
router.get('/readiness', gateController.getGateReadiness);
router.get('/profile', gateController.getProfile);
router.post('/profile', gateController.createProfile);
router.put('/profile', gateController.updateProfile);

router.get('/topics/progress', gateController.getTopicProgress);
router.get('/topics', gateController.getTopics);
router.post('/topics', gateController.createTopic);
router.put('/topics/:id', gateController.updateTopic);
router.delete('/topics/:id', gateController.deleteTopic);

router.get('/planner/weekly-summary', gateController.getWeeklySummary);
router.get('/study-tasks', gateController.getStudyTasks);
router.post('/study-tasks', gateController.createStudyTask);
router.put('/study-tasks/:id', gateController.updateStudyTask);
router.delete('/study-tasks/:id', gateController.deleteStudyTask);

router.get('/study-sessions/summary', gateController.getStudySessionSummary);
router.get('/study-sessions', gateController.getStudySessions);
router.post('/study-sessions', gateController.createStudySession);
router.put('/study-sessions/:id', gateController.updateStudySession);
router.delete('/study-sessions/:id', gateController.deleteStudySession);

router.get('/practice-attempts/summary', gateController.getPracticePerformance);
router.get('/practice-attempts', gateController.getGatePracticeAttempts);
router.post('/practice-attempts', gateController.createGatePracticeAttempt);
router.put('/practice-attempts/:id', gateController.updateGatePracticeAttempt);
router.delete('/practice-attempts/:id', gateController.deleteGatePracticeAttempt);

router.get('/mocks/summary', gateController.getMockSummary);

router.get('/mistakes/summary', gateController.getMistakeSummary);
router.get('/mistakes', gateController.getGateMistakes);
router.post('/mistakes', gateController.createGateMistake);
router.put('/mistakes/:id', gateController.updateGateMistake);
router.delete('/mistakes/:id', gateController.deleteGateMistake);

router.get('/revisions/summary', gateController.getRevisionSummary);
router.get('/revisions', gateController.getGateRevisionItems);
router.post('/revisions', gateController.createGateRevisionItem);
router.put('/revisions/:id', gateController.updateGateRevisionItem);
router.delete('/revisions/:id', gateController.deleteGateRevisionItem);

router.post('/revisions/:id/review', gateController.reviewGateRevisionItem);
router.post('/revisions/:id/complete', gateController.completeGateRevisionItem);
router.post('/revisions/:id/reopen', gateController.reopenGateRevisionItem);
router.post('/revisions/:id/reschedule', gateController.rescheduleGateRevisionItem);

export default router;
