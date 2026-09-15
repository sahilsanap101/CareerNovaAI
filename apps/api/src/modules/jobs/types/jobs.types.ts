// ─── Jooble API Types ─────────────────────────────────────────────

export interface JoobleJobRaw {
    id?: string;
    title?: string;
    location?: string;
    snippet?: string;
    salary?: string;
    source?: string;
    type?: string;
    link?: string;
    company?: string;
    updated?: string;
}

export interface JoobleResponse {
    totalCount?: number;
    jobs?: JoobleJobRaw[];
}

export interface JoobleRequestParams {
    keywords: string;
    location?: string;
    radius?: string;
    page?: number;
    ResultOnPage?: number;
    companysearch?: boolean;
}

// ─── Internal Job Types ───────────────────────────────────────────

export interface NormalizedJob {
    provider: string;
    providerJobId: string;
    title: string;
    company?: string;
    location?: string;
    snippet?: string;
    salary?: string;
    type?: string;
    source?: string;
    applyUrl: string;
    providerUpdatedAt?: Date;
    expiresAt?: Date;
}

export interface JobMatchResult {
    jobId: string;
    title: string;
    company?: string;
    location?: string;
    snippet?: string;
    salary?: string;
    type?: string;
    applyUrl: string;
    providerUpdatedAt?: Date | null;
    fetchedAt: Date;
    careerMatches: string[];
    matchScore: number;
    matchedSkills: string[];
    gapSkills: string[];
    matchReasons: string[];
    isActive: boolean;
    isSaved: boolean;
    hasApplied: boolean;
}

export interface LiveJobFilters {
    career?: string;
    location?: string;
    type?: string; // 'jobs' | 'internships' | 'all'
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

// ─── Application Types ────────────────────────────────────────────

export type AppStatus = 'SAVED' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface ApplicationRecord {
    id: string;
    userId: string;
    jobId: string;
    status: AppStatus;
    appliedAt: Date;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
    job: {
        id: string;
        title: string;
        company?: string | null;
        location?: string | null;
        applyUrl: string;
    };
}
