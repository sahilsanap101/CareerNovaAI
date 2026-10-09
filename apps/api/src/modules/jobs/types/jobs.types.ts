// ─── Jooble API Types ─────────────────────────────────────────────

export interface JoobleJobRaw {
    id?: string | number;
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
    radius?: string | number;
    salary?: string | number;
    page?: number;
    ResultOnPage?: number;
    SearchMode?: number | string;
    companysearch?: boolean;
}

// ─── Internal Job Types ───────────────────────────────────────────

export interface RankedCareer {
    name: string;
    rank: number;
    totalScore?: number;
}

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
    company?: string | null;
    location?: string | null;
    snippet?: string | null;
    salary?: string | null;
    type?: string | null;
    applyUrl: string;
    providerUpdatedAt?: Date | null;
    fetchedAt: Date;
    careerMatches: string[];

    // ─── Match Scoring (Live Jobs Engine — independent from BYSER) ──────
    matchScore: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendedCareer: string | null;
    matchedSkills: string[];
    /** Skills mentioned in the job that the student does not have */
    skillGaps: string[];
    /** @deprecated use skillGaps — kept for backward compatibility */
    gapSkills: string[];
    eduExperienceMatch: {
        status: 'MATCHED' | 'UNAVAILABLE';
        detail: string;
    };
    locationMatch: {
        status: 'MATCHED' | 'PARTIAL' | 'MISMATCH' | 'UNAVAILABLE';
        detail: string;
    };
    /** Human-readable single-sentence explanation */
    explanation: string;
    matchReasons: string[];

    isActive: boolean;
    isSaved: boolean;
    hasApplied: boolean;
    applicationStatus?: AppStatus | null;
    applicationId?: string | null;
    applicationNotes?: string | null;
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
