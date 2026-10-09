// ─── Live Jobs Frontend Types ──────────────────────────────────────

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface EduExperienceMatch {
    status: 'MATCHED' | 'UNAVAILABLE';
    detail: string;
}

export interface LocationMatch {
    status: 'MATCHED' | 'PARTIAL' | 'MISMATCH' | 'UNAVAILABLE';
    detail: string;
}

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

    // ─── Match Scoring (Live Jobs Engine — independent from BYSER) ──
    matchScore: number;
    confidence: ConfidenceLevel;
    recommendedCareer: string | null;
    matchedSkills: string[];
    /** Skills the student lacks that appear in the job */
    skillGaps: string[];
    /** @deprecated use skillGaps */
    gapSkills: string[];
    eduExperienceMatch: EduExperienceMatch;
    locationMatch: LocationMatch;
    /** Human-readable explanation of the match */
    explanation: string;
    matchReasons: string[];

    isActive: boolean;
    isSaved: boolean;
    hasApplied: boolean;
    applicationStatus?: ApplicationStatus | null;
    applicationId?: string | null;
    applicationNotes?: string | null;
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
