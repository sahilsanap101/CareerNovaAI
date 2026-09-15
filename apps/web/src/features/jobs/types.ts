// ─── Live Jobs Frontend Types ──────────────────────────────────────

export interface LiveJob {
    jobId: string;
    title: string;
    company?: string;
    location?: string;
    snippet?: string;
    salary?: string;
    type?: string;
    applyUrl: string;
    providerUpdatedAt?: string;
    fetchedAt: string;
    careerMatches: string[];
    matchScore: number;
    matchedSkills: string[];
    gapSkills: string[];
    matchReasons: string[];
    isActive: boolean;
    isSaved: boolean;
    hasApplied: boolean;
}

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface JobApplication {
    id: string;
    userId: string;
    jobId: string;
    status: ApplicationStatus;
    appliedAt: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    job: {
        id: string;
        title: string;
        company?: string;
        location?: string;
        applyUrl: string;
    };
}

export interface LiveJobFilters {
    career?: string;
    location?: string;
    type?: 'all' | 'jobs' | 'internships';
    minMatchScore?: number;
    search?: string;
    page?: number;
    limit?: number;
}

export interface SyncResult {
    status: string;
    requestsUsed: number;
    jobsUpserted: number;
    queriesExecuted: string[];
    message: string;
}
