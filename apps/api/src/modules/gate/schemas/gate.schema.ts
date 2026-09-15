import { z } from 'zod';

export const gateProfileSchema = z.object({
    gateYear: z.number().min(2025).max(2030),
    paper: z.string().min(1, 'Paper code is required'),
    targetScore: z.number().min(0).max(100),
    weeklyHours: z.number().min(1).max(168),
    preparationStage: z.enum(['BEGINNER', 'STARTED', 'INTERMEDIATE', 'ADVANCED', 'REVISION']),
    examDate: z.string().optional().nullable(),
});

export type GateProfileInput = z.infer<typeof gateProfileSchema>;

export const gateTopicSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subject: z.string().min(1, 'Subject is required'),
    notes: z.string().optional().nullable(),
    status: z.enum(['NOT_STARTED', 'LEARNING', 'COMPLETED', 'NEEDS_REVISION']).default('NOT_STARTED'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    targetDate: z.string().optional().nullable(),
});

export type GateTopicInput = z.infer<typeof gateTopicSchema>;

export const gateStudyTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional().nullable(),
    topicId: z.string().optional().nullable(),
    plannedDate: z.string().or(z.date()),
    estimatedMinutes: z.number().int().min(1, 'Must be at least 1 minute').max(1440, 'Cannot exceed 24 hours (1440 mins)'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
    completedAt: z.string().datetime().optional().nullable(),
});

export const gateStudySessionSchema = z.object({
    topicId: z.string().optional().nullable(),
    studyTaskId: z.string().optional().nullable(),
    startedAt: z.string().datetime(),
    endedAt: z.string().datetime().optional().nullable(),
    durationMinutes: z.number().int().positive('Duration must be positive').max(1440, 'Duration cannot exceed 24 hours'),
    sessionType: z.enum(['STUDY', 'REVISION', 'PRACTICE', 'PYQ', 'MOCK', 'OTHER']),
    notes: z.string().max(1000, 'Notes too long').optional().nullable(),
});

export type GateStudySessionInput = z.infer<typeof gateStudySessionSchema>;

export type GateStudyTaskInput = z.infer<typeof gateStudyTaskSchema>;

export const gatePracticeAttemptSchema = z.object({
    topicId: z.string().optional().nullable(),
    attemptType: z.enum(['PYQ', 'PRACTICE', 'MOCK']),
    sourceName: z.string().min(1, 'Source name is required'),
    sourceUrl: z.string().url().optional().or(z.literal('')).nullable(),
    paperCode: z.string().optional().nullable(),
    paperYear: z.number().int().min(1900).max(2100).optional().nullable(),
    attemptDate: z.string().datetime().optional(),
    totalQuestions: z.number().int().min(0, 'Must be positive'),
    attemptedQuestions: z.number().int().min(0).optional(),
    correctAnswers: z.number().int().min(0, 'Must be positive'),
    incorrectAnswers: z.number().int().min(0, 'Must be positive'),
    unattemptedQuestions: z.number().int().min(0, 'Must be positive'),
    marksObtained: z.number().optional().nullable(),
    percentile: z.number().min(0).max(100).optional().nullable(),
    durationMinutes: z.number().int().min(1, 'Must be at least 1 minute').optional().nullable(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
}).refine(data => {
    return data.correctAnswers + data.incorrectAnswers + data.unattemptedQuestions === data.totalQuestions;
}, {
    message: "Correct, incorrect, and unattempted must sum precisely to total questions",
    path: ["totalQuestions"]
}).refine(data => {
    const attempted = data.correctAnswers + data.incorrectAnswers;
    if (data.attemptedQuestions !== undefined && data.attemptedQuestions !== attempted) {
        return false;
    }
    return true;
}, {
    message: "Attempted questions must exactly equal correct + incorrect",
    path: ["attemptedQuestions"]
});

export type GatePracticeAttemptInput = z.infer<typeof gatePracticeAttemptSchema>;

export const gateMistakeSchema = z.object({
    topicId: z.string().optional().nullable(),
    practiceAttemptId: z.string().optional().nullable(),
    title: z.string().min(1, 'Title is required').max(200),
    category: z.enum(['CONCEPTUAL', 'CALCULATION', 'MEMORY', 'MISREAD_QUESTION', 'TIME_MANAGEMENT', 'CARELESS_ERROR', 'APPLICATION', 'OTHER']),
    description: z.string().max(2000).optional().nullable(),
    correctConcept: z.string().max(2000).optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM').optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().nullable(),
    status: z.enum(['OPEN', 'RESOLVED']).default('OPEN').optional(),
    needsRevision: z.boolean().default(true).optional(),
    mistakeDate: z.string().datetime().optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
});

export type GateMistakeInput = z.infer<typeof gateMistakeSchema>;

export const gateRevisionItemSchema = z.object({
    topicId: z.string().optional().nullable(),
    mistakeId: z.string().optional().nullable(),
    practiceAttemptId: z.string().optional().nullable(),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional().nullable(),
    scheduledDate: z.string().datetime(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM').optional(),
    status: z.enum(['PENDING', 'COMPLETED']).default('PENDING').optional(),
    notes: z.string().max(1000).optional().nullable(),
});

export type GateRevisionItemInput = z.infer<typeof gateRevisionItemSchema>;
