import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as gateService from '../services/gate.service';
import * as gateQuestionService from '../services/gateQuestion.service';
import * as gateSyllabusService from '../services/gateSyllabus.service';
import * as gateMockService from '../services/gateMock.service';
import * as gateStudyPlanService from '../services/gateStudyPlan.service';
import * as gateProgressService from '../services/gateProgress.service';
import * as gateSyncService from '../services/gateSync.service';
import * as gateOnboardingService from '../services/gateOnboarding.service';
import * as gateDashboardService from '../services/gateDashboard.service';
import * as gateGraphService from '../services/gateGraph.service';
import * as gatePracticeService from '../services/gatePractice.service';
import * as gatePlannerService from '../services/gatePlanner.service';
import * as gateResourceService from '../services/gateResource.service';
import * as gateRevisionService from '../services/gateRevision.service';
import * as gateReadinessService from '../services/gateReadiness.service';
import * as gateIntegrationService from '../services/gateIntegration.service';

const prisma = new PrismaClient();

// EXTENDED Error handler util
const handleError = (res: Response, error: any) => res.status(500).json({ success: false, error: error.message });

/* ---------------- EXAMS & PAPERS ---------------- */
export const getExams = async (req: Request, res: Response) => {
    try {
        const exams = await gateService.getActiveExams();
        res.json({ success: true, data: exams });
    } catch (error: any) { handleError(res, error); }
};

export const getPapersForYear = async (req: Request, res: Response) => {
    try {
        const papers = await gateService.getPapersByYear(parseInt(req.params.year as string, 10));
        res.json({ success: true, data: papers });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- READINESS ANALYTICS ---------------- */
export const getReadiness = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await gateReadinessService.computeReadinessAnalytics(userId, req.params.year as string);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

export const generateCounterfactual = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await gateReadinessService.generateCounterfactualScenario(userId, req.params.year as string, req.body.overrides);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- SYLLABUS ---------------- */
export const getPaperSyllabus = async (req: Request, res: Response) => {
    try {
        const syllabus = await gateSyllabusService.getSyllabusForPaper(req.params.paperId as string);
        res.json({ success: true, data: syllabus });
    } catch (error: any) { handleError(res, error); }
};

export const getTopicExplorer = async (req: Request, res: Response) => {
    res.json({ success: true, data: {} });
};

export const checkGraphCycles = async (req: Request, res: Response) => {
    res.json({ success: true, data: {} });
};

/* ---------------- PYQ ENGINE ---------------- */
export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { paperId, topicId, difficulty, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Simple filter
        const filters: any = {};
        if (paperId) filters.paperId = String(paperId);
        if (topicId) filters.topicId = String(topicId);
        if (difficulty) filters.difficulty = String(difficulty);

        const questions = await gateQuestionService.getQuestions({ ...filters, limit: Number(limit), skip });
        res.json({ success: true, data: questions, meta: { page: Number(page), limit: Number(limit) } });
    } catch (error: any) { handleError(res, error); }
};

export const getPersonalizedQuestions = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const targetYear = req.query.targetYear ? parseInt(String(req.query.targetYear), 10) : new Date().getFullYear();
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

        const questions = await gateQuestionService.generatePersonalizedSet(userId, targetYear, limit);
        res.json({ success: true, data: questions });
    } catch (error: any) { handleError(res, error); }
};

export const attemptQuestion = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const attempt = await gateQuestionService.recordAttempt(userId, { questionId: req.params.id, ...req.body });
        res.status(201).json({ success: true, data: attempt });
    } catch (error: any) { handleError(res, error); }
};

export const bookmarkQuestion = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await gateQuestionService.bookmarkQuestion(userId, req.params.id as string);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- PRACTICE ENGINE ---------------- */
export const startPracticeSession = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const questions = await gatePracticeService.generatePracticeSession(userId, req.body);
        res.status(201).json({ success: true, data: questions });
    } catch (error: any) { handleError(res, error); }
};

export const recordPracticeAttempt = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const attemptResult = await gatePracticeService.recordPracticeAttempt(userId, { questionId: req.params.id, ...req.body });
        res.json({ success: true, data: attemptResult });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- ADAPTIVE PLANNER ---------------- */
export const getDailyPlan = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const sessions = await gatePlannerService.generateDailyPlan(userId);
        res.json({ success: true, data: sessions });
    } catch (error: any) { handleError(res, error); }
};

export const updatePlannerSession = async (req: Request, res: Response) => {
    try {
        const updated = await gatePlannerService.updateSessionState(req.params.sessionId as string, req.body.action, req.body.reason);
        res.json({ success: true, data: updated });
    } catch (error: any) { handleError(res, error); }
};

export const forceRegeneratePlan = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const sessions = await gatePlannerService.regeneratePlan(userId);
        res.json({ success: true, data: sessions });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- LEARNING RESOURCES ---------------- */
export const getRankedResources = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const resources = await gateResourceService.getPersonalizedResources(userId, req.query);
        res.json({ success: true, data: resources });
    } catch (error: any) { handleError(res, error); }
};

export const logResourceAction = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await gateResourceService.logResourceAction(userId, req.params.id as string, req.body.actionType);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- MOCKS ---------------- */
export const getMocksForPaper = async (req: Request, res: Response) => {
    try {
        const mocks = await (prisma as any).gateMockTest.findMany({ where: { paperId: req.params.paperId } });
        res.json({ success: true, data: mocks });
    } catch (error: any) { handleError(res, error); }
};

export const startMockAttempt = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const attempt = await gateMockService.startMockAttempt(userId, req.params.id as string);
        res.json({ success: true, data: attempt });
    } catch (error: any) { handleError(res, error); }
};

export const submitMockAttempt = async (req: Request, res: Response) => {
    try {
        // `req.params.id` is the attemptId
        const result = await gateMockService.submitMockAttempt(req.params.id as string, req.body);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

export const generateCustomMock = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await gateMockService.generateAuthenticMock({ ...req.body, userId });
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- MISTAKE BOOK & REVISION ---------------- */
export const getRevisionDashboard = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await gateRevisionService.getRevisionDashboard(userId);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

export const logMistake = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await gateRevisionService.logMistake(userId, req.body);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

export const evaluateRevision = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { topicId, performanceScore } = req.body;
        const result = await gateRevisionService.evaluateRevision(userId, topicId, parseFloat(performanceScore));
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

export const resolveMistake = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await gateRevisionService.resolveMistake(req.params.id as string, userId);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- CAREERNOVA INTEGRATION ---------------- */
export const getTimeAllocation = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const result = await gateIntegrationService.unifyCareerVectors(userId, req.params.year as string);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- STUDY PLANS ---------------- */
export const createStudyPlan = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { targetExamId, title, startDate, endDate } = req.body;
        const plan = await gateStudyPlanService.createStudyPlan(userId, targetExamId, title, new Date(startDate), new Date(endDate));
        res.status(201).json({ success: true, data: plan });
    } catch (error: any) { handleError(res, error); }
};

export const getStudyPlans = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const plans = await gateStudyPlanService.getStudyPlans(userId);
        res.json({ success: true, data: plans });
    } catch (error: any) { handleError(res, error); }
};

export const updateSessionStatus = async (req: Request, res: Response) => {
    try {
        const updated = await gateStudyPlanService.updateStudySessionStatus(req.params.id as string, req.body.status);
        res.json({ success: true, data: updated });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- PROGRESS / MASTERY ---------------- */
export const updateMastery = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { topicId, pointDelta } = req.body;
        const mastery = await gateProgressService.updateTopicMastery(userId, topicId, pointDelta);
        res.json({ success: true, data: mastery });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- ADMIN SYNC DASHBOARD ---------------- */
export const getSyncStatus = async (req: Request, res: Response) => {
    try {
        const statusLogs = await gateSyncService.getSyncStatus();
        res.json({ success: true, data: statusLogs });
    } catch (error: any) { handleError(res, error); }
};

export const triggerSync = async (req: Request, res: Response) => {
    try {
        const { entityType, sourceUrl } = req.body;
        const result = await gateSyncService.syncExamData(req.params.examId as string, entityType, sourceUrl);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- ONBOARDING & DIAGNOSTICS ---------------- */
export const getOnboarding = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const state = await gateOnboardingService.getOnboardingState(userId);
        res.json({ success: true, data: state });
    } catch (error: any) { handleError(res, error); }
};

export const saveOnboarding = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { step, data } = req.body;
        const result = await gateOnboardingService.saveOnboardingStep(userId, step, data);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

export const startDiagnostic = async (req: Request, res: Response) => {
    try {
        const { paperCode, year } = req.body;
        const questions = await gateOnboardingService.generateDiagnosticAssessment(paperCode, parseInt(year, 10));
        res.json({ success: true, data: questions });
    } catch (error: any) { handleError(res, error); }
};

export const submitDiagnostic = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { targetYear, submissions } = req.body;
        const result = await gateOnboardingService.evaluateDiagnostic(userId, parseInt(targetYear, 10), submissions);
        res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
};

/* ---------------- DASHBOARD AGGREGATION ---------------- */
export const getDashboardMetrics = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const metrics = await gateDashboardService.getAggregatedDashboardData(userId);
        res.json({ success: true, data: metrics });
    } catch (error: any) { handleError(res, error); }
};
