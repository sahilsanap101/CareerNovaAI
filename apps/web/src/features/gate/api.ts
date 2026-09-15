import api from '@/api/axiosInstance';

export interface GateProfile {
    id: string;
    userId: string;
    gateYear: number;
    paper: string;
    targetScore: number;
    weeklyHours: number;
    preparationStage: string;
    examDate: string | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type GateProfileInput = Omit<GateProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { examDate?: string | null };

export interface GateRevisionItem {
    id: string;
    userId: string;
    topicId?: string | null;
    mistakeId?: string | null;
    practiceAttemptId?: string | null;
    title: string;
    description?: string | null;
    scheduledDate: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'PENDING' | 'COMPLETED';
    lastReviewedAt?: string | null;
    completedAt?: string | null;
    reviewCount: number;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
    topic?: { title: string };
    mistake?: { title: string; status: string; needsRevision: boolean };
    practiceAttempt?: { attemptType: string; sourceName: string; paperCode?: string; paperYear?: number };
}

export interface GatePersonalTopic {
    id: string;
    userId: string;
    title: string;
    subject: string;
    notes: string | null;
    status: 'NOT_STARTED' | 'LEARNING' | 'COMPLETED' | 'NEEDS_REVISION';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    targetDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface GateStudyTask {
    id: string;
    userId: string;
    topicId: string | null;
    title: string;
    description: string | null;
    plannedDate: string;
    estimatedMinutes: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    topic?: { title: string, subject: string };
}

export interface WeeklyPlannerSummary {
    hasProfile: boolean;
    weeklyTargetMinutes: number;
    plannedMinutes: number;
    completedMinutes: number;
    remainingMinutes: number;
    taskCount: number;
    completedTaskCount: number;
    completionPercentage: number;
}

export type GateTopicInput = Omit<GatePersonalTopic, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { targetDate?: string | null };

export type GateStudyTaskInput = {
    title: string;
    description?: string | null;
    topicId?: string | null;
    plannedDate: string;
    estimatedMinutes: number;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
};

export interface GateStudySession {
    id: string;
    userId: string;
    topicId: string | null;
    studyTaskId: string | null;
    startedAt: string;
    endedAt: string | null;
    durationMinutes: number;
    sessionType: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    topic?: { title: string, subject: string };
    studyTask?: { title: string };
}

export interface StudySessionSummary {
    todayMinutes: number;
    weekMinutes: number;
    previousWeekMinutes: number;
    sessionCount: number;
    weekSessionCount: number;
    byTopic: Record<string, number>;
    bySessionType: Record<string, number>;
}

export type GateStudySessionInput = {
    topicId?: string | null;
    studyTaskId?: string | null;
    startedAt: string;
    endedAt?: string | null;
    durationMinutes: number;
    sessionType: 'STUDY' | 'REVISION' | 'PRACTICE' | 'PYQ' | 'MOCK' | 'OTHER';
    notes?: string | null;
};

export interface GatePracticeAttempt {
    id: string;
    userId: string;
    topicId: string | null;
    attemptType: 'PYQ' | 'PRACTICE' | 'MOCK';
    sourceName: string;
    sourceUrl: string | null;
    paperCode: string | null;
    paperYear: number | null;
    attemptDate: string;
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unattemptedQuestions: number;
    marksObtained: number | null;
    percentile?: number | null;
    durationMinutes: number | null;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    topic?: { title: string, subject: string };
}

export type GatePracticeAttemptInput = {
    topicId?: string | null;
    attemptType: 'PYQ' | 'PRACTICE' | 'MOCK';
    sourceName: string;
    sourceUrl?: string | null;
    paperCode?: string | null;
    paperYear?: number | null;
    attemptDate?: string;
    totalQuestions: number;
    attemptedQuestions?: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unattemptedQuestions: number;
    marksObtained?: number | null;
    percentile?: number | null;
    durationMinutes?: number | null;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
    notes?: string | null;
};

export interface PracticeSummary {
    totalAttempts: number;
    questionsAttempted: number;
    correct: number;
    incorrect: number;
    overallAccuracy: number;
    byTopic: Record<string, { attempts: number; questions: number; correct: number }>;
    byType: Record<string, { attempts: number; questions: number; correct: number }>;
}

export interface GateMistake {
    id: string;
    userId: string;
    topicId: string | null;
    practiceAttemptId: string | null;
    title: string;
    category: 'CONCEPTUAL' | 'CALCULATION' | 'MEMORY' | 'MISREAD_QUESTION' | 'TIME_MANAGEMENT' | 'CARELESS_ERROR' | 'APPLICATION' | 'OTHER';
    description: string | null;
    correctConcept: string | null;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null;
    status: 'OPEN' | 'RESOLVED';
    needsRevision: boolean;
    mistakeDate: string;
    resolvedAt: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    topic?: { title: string, subject: string };
    practiceAttempt?: { attemptType: string, sourceName: string, paperCode: string | null, paperYear: number | null };
}

export type GateMistakeInput = {
    topicId?: string | null;
    practiceAttemptId?: string | null;
    title: string;
    category: 'CONCEPTUAL' | 'CALCULATION' | 'MEMORY' | 'MISREAD_QUESTION' | 'TIME_MANAGEMENT' | 'CARELESS_ERROR' | 'APPLICATION' | 'OTHER';
    description?: string | null;
    correctConcept?: string | null;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
    status?: 'OPEN' | 'RESOLVED';
    needsRevision?: boolean;
    mistakeDate?: string | null;
    notes?: string | null;
};

export interface MistakeSummary {
    total: number;
    open: number;
    resolved: number;
    needsRevision: number;
    byCategory: Record<string, number>;
    byTopic: Record<string, { total: number; open: number; resolved: number }>;
}

export interface GateAnalyticsResponse {
    overview: { targetWeeklyMinutes: number | null, topicProgressPercent: number };
    topicProgress: { totalTopics: number, completedTopics: number, learningTopics: number, revisionTopics: number, notStartedTopics: number, topicProgressPercent: number };
    studyActivity: { thisWeekMinutes: number, lastWeekMinutes: number, plannedThisWeekMinutes: number, thisWeekSessionsCount: number, averageSessionDuration: number, sessionDurationsByType: Record<string, number> };
    practicePerformance: { total: number, pyq: number, practice: number, mock: number, accuracyOverall: number | null, accuracyPyq: number | null, accuracyPractice: number | null, accuracyMock: number | null };
    mistakes: { total: number, open: number, resolved: number, needsRevision: number, byCategory: Record<string, number> };
    revisions: { pending: number, dueToday: number, overdue: number, upcoming: number, completed: number };
    mocks: { totalAttempts: number, bestMarks: number | null, averageMarks: number | null, latestMarks: number | null, averageAccuracy: number | null };
    recentActivity: Array<{ type: string, desc: string, date: string }>;
}

export interface GateReadinessDimension {
    score: number | null;
    basis: string;
}

export interface GateReadinessResponse {
    overallScore: number | null;
    overallStatus: string;
    dataCoverage: number;
    dimensions: {
        topicProgress: GateReadinessDimension;
        studyConsistency: GateReadinessDimension;
        practiceActivity: GateReadinessDimension;
        practiceAccuracy: GateReadinessDimension;
        mockPerformance: GateReadinessDimension;
        mistakeManagement: GateReadinessDimension;
        revisionDiscipline: GateReadinessDimension;
    };
    observations: string[];
    generatedAt: string;
}

export const gateApi = {
    getProfile: async () => {
        const { data } = await api.get<{ data: GateProfile | null }>('/gate/profile');
        return data.data;
    },
    createProfile: async (payload: GateProfileInput) => {
        const { data } = await api.post<{ data: GateProfile }>('/gate/profile', {
            ...payload,
            examDate: payload.examDate || null
        });
        return data.data;
    },
    updateProfile: async (payload: GateProfileInput) => {
        const { data } = await api.put<{ data: GateProfile }>('/gate/profile', {
            ...payload,
            examDate: payload.examDate || null
        });
        return data.data;
    },

    getTopics: async () => {
        const { data } = await api.get<{ data: GatePersonalTopic[] }>('/gate/topics');
        return data.data;
    },
    getTopicProgress: async () => {
        const { data } = await api.get<{ data: { percentComplete: number, completedTopics: number, totalTopics: number } }>('/gate/topics/progress');
        return data.data;
    },
    createTopic: async (payload: GateTopicInput) => {
        const { data } = await api.post<{ data: GatePersonalTopic }>('/gate/topics', {
            ...payload,
            targetDate: payload.targetDate || null
        });
        return data.data;
    },
    updateTopic: async (id: string, payload: GateTopicInput) => {
        const { data } = await api.put<{ data: GatePersonalTopic }>(`/gate/topics/${id}`, {
            ...payload,
            targetDate: payload.targetDate || null
        });
        return data.data;
    },
    deleteTopic: async (id: string) => {
        await api.delete(`/gate/topics/${id}`);
    },

    getStudyTasks: async (weekStart?: string, weekEnd?: string) => {
        const query = weekStart && weekEnd ? `?weekStart=${weekStart}&weekEnd=${weekEnd}` : '';
        const { data } = await api.get<{ data: GateStudyTask[] }>(`/gate/study-tasks${query}`);
        return data.data;
    },

    getWeeklySummary: async (weekStart: string, weekEnd: string) => {
        const { data } = await api.get<{ data: WeeklyPlannerSummary }>(`/gate/planner/weekly-summary?weekStart=${weekStart}&weekEnd=${weekEnd}`);
        return data.data;
    },

    createStudyTask: async (payload: GateStudyTaskInput) => {
        const { data } = await api.post<{ data: GateStudyTask }>('/gate/study-tasks', payload);
        return data.data;
    },

    updateStudyTask: async (id: string, payload: Partial<GateStudyTaskInput>) => {
        const { data } = await api.put<{ data: GateStudyTask }>(`/gate/study-tasks/${id}`, payload);
        return data.data;
    },

    deleteStudyTask: async (id: string) => {
        const { data } = await api.delete<{ data: null }>(`/gate/study-tasks/${id}`);
        return data.data;
    },

    getStudySessions: async (weekStart?: string, weekEnd?: string, sessionType?: string, topicId?: string) => {
        const queryParams = new URLSearchParams();
        if (weekStart) queryParams.append('weekStart', weekStart);
        if (weekEnd) queryParams.append('weekEnd', weekEnd);
        if (sessionType) queryParams.append('sessionType', sessionType);
        if (topicId) queryParams.append('topicId', topicId);

        const { data } = await api.get<{ data: GateStudySession[] }>(`/gate/study-sessions?${queryParams.toString()}`);
        return data.data;
    },

    getStudySessionSummary: async (weekStart: string, weekEnd: string) => {
        const { data } = await api.get<{ data: StudySessionSummary }>(`/gate/study-sessions/summary?weekStart=${weekStart}&weekEnd=${weekEnd}`);
        return data.data;
    },

    createStudySession: async (payload: GateStudySessionInput) => {
        const { data } = await api.post<{ data: GateStudySession }>('/gate/study-sessions', payload);
        return data.data;
    },

    updateStudySession: async (id: string, payload: Partial<GateStudySessionInput>) => {
        const { data } = await api.put<{ data: GateStudySession }>(`/gate/study-sessions/${id}`, payload);
        return data.data;
    },

    deleteStudySession: async (id: string) => {
        const { data } = await api.delete<{ data: null }>(`/gate/study-sessions/${id}`);
        return data.data;
    },

    getPracticeSummary: async () => {
        const { data } = await api.get<{ data: PracticeSummary }>('/gate/practice-attempts/summary');
        return data.data;
    },

    getPracticeAttempts: async (
        startDate?: string, endDate?: string, topicId?: string, attemptType?: string, paperCode?: string, paperYear?: number
    ) => {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        if (topicId) queryParams.append('topicId', topicId);
        if (attemptType) queryParams.append('attemptType', attemptType);
        if (paperCode) queryParams.append('paperCode', paperCode);
        if (paperYear) queryParams.append('paperYear', paperYear.toString());

        const queryString = queryParams.toString();
        const { data } = await api.get<{ data: GatePracticeAttempt[] }>(`/gate/practice-attempts${queryString ? `?${queryString}` : ''}`);
        return data.data;
    },

    createPracticeAttempt: async (payload: GatePracticeAttemptInput) => {
        const { data } = await api.post<{ data: GatePracticeAttempt }>('/gate/practice-attempts', payload);
        return data.data;
    },

    updatePracticeAttempt: async (id: string, payload: Partial<GatePracticeAttemptInput>) => {
        const { data } = await api.put<{ data: GatePracticeAttempt }>(`/gate/practice-attempts/${id}`, payload);
        return data.data;
    },

    deletePracticeAttempt: async (id: string) => {
        const { data } = await api.delete<{ data: null }>(`/gate/practice-attempts/${id}`);
        return data.data;
    },

    getMistakeSummary: async () => {
        const response = await api.get('/gate/mistakes/summary');
        return response.data.data;
    },

    getMockSummary: async () => {
        const response = await api.get('/gate/mocks/summary');
        return response.data.data;
    },

    getGateAnalytics: async (): Promise<GateAnalyticsResponse | null> => {
        try {
            const res = await api.get('/gate/analytics');
            return res.data.data;
        } catch (err: any) {
            if (err.response?.status === 404) return null;
            throw err;
        }
    },

    getGateReadiness: async (): Promise<GateReadinessResponse | null> => {
        try {
            const res = await api.get('/gate/readiness');
            return res.data.data;
        } catch (err: any) {
            if (err.response?.status === 404) return null;
            throw err;
        }
    },

    // ─── GATE REVISION HUB ──────────────────────────────────────────────
    getGateRevisions: async (filters: Record<string, any> = {}) => {
        const response = await api.get('/gate/revisions', { params: filters });
        return response.data.data as GateRevisionItem[];
    },
    createGateRevision: async (data: any) => {
        const response = await api.post('/gate/revisions', data);
        return response.data.data;
    },
    updateGateRevision: async (id: string, data: any) => {
        const response = await api.put(`/gate/revisions/${id}`, data);
        return response.data.data;
    },
    deleteGateRevision: async (id: string) => {
        await api.delete(`/gate/revisions/${id}`);
    },
    reviewGateRevision: async (id: string) => {
        const response = await api.post(`/gate/revisions/${id}/review`);
        return response.data.data;
    },
    completeGateRevision: async (id: string) => {
        const response = await api.post(`/gate/revisions/${id}/complete`);
        return response.data.data;
    },
    reopenGateRevision: async (id: string) => {
        const response = await api.post(`/gate/revisions/${id}/reopen`);
        return response.data.data;
    },
    rescheduleGateRevision: async (id: string, scheduledDate: string) => {
        const response = await api.post(`/gate/revisions/${id}/reschedule`, { scheduledDate });
        return response.data.data;
    },
    getRevisionSummary: async () => {
        const response = await api.get('/gate/revisions/summary');
        return response.data.data;
    },

    getMistakes: async (filters: Record<string, any> = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'ALL') queryParams.append(key, value);
        });
        const queryString = queryParams.toString();
        const { data } = await api.get<{ data: GateMistake[] }>(`/gate/mistakes${queryString ? `?${queryString}` : ''}`);
        return data.data;
    },

    createMistake: async (payload: GateMistakeInput) => {
        const { data } = await api.post<{ data: GateMistake }>('/gate/mistakes', payload);
        return data.data;
    },

    updateMistake: async (id: string, payload: Partial<GateMistakeInput>) => {
        const { data } = await api.put<{ data: GateMistake }>(`/gate/mistakes/${id}`, payload);
        return data.data;
    },

    deleteMistake: async (id: string) => {
        const { data } = await api.delete<{ data: null }>(`/gate/mistakes/${id}`);
        return data.data;
    }
};
