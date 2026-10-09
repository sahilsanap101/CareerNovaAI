import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '@pathforge/shared-constants';

import { getFullStudentData } from '@/modules/profile/repositories/profile.repository';
import { scoreJob, type StudentContext } from './matchScoring.service';
import { syncJobsForCareers } from './jobSync.service';
import type { LiveJobFilters, JobMatchResult, AppStatus } from '../types/jobs.types';
import { isJobRelevantForCareer } from './careerRelevance.service';

// ─── Helpers ──────────────────────────────────────────────────────

async function buildStudentContext(userId: string): Promise<StudentContext> {
    const student = await getFullStudentData(userId);
    const recommendedCareers: string[] = [];
    const rankedCareers: any[] = [];
    const skillNames = student?.skills.map((s) => s.skill.name) ?? [];
    const preferredLocation = student?.profile?.city ?? undefined;
    const workMode = student?.careerGoal?.preferredWorkMode ?? undefined;

    // Education / experience context (used by edu scoring — no BYSER impact)
    const educationLevel = student?.profile?.degree ?? undefined;
    const experienceMonths = student?.skills.reduce(
        (acc, s) => acc + (s.experienceMonths ?? 0), 0,
    ) ?? 0;

    return {
        recommendedCareers,
        rankedCareers,
        skillNames,
        preferredLocation,
        workMode,
        educationLevel,
        experienceMonths,
    };
}

async function getSavedJobIds(userId: string): Promise<Set<string>> {
    const saved = await prisma.savedJob.findMany({ where: { userId }, select: { jobId: true } });
    return new Set(saved.map((s) => s.jobId));
}

interface AppliedInfo {
    id: string;
    status: AppStatus;
    notes: string | null;
}

async function getAppliedJobMap(userId: string): Promise<Map<string, AppliedInfo>> {
    const applied = await prisma.jobApplication.findMany({
        where: { userId },
        select: { id: true, jobId: true, status: true, notes: true },
    });
    return new Map(
        applied.map((a) => [
            a.jobId,
            { id: a.id, status: a.status as AppStatus, notes: a.notes },
        ]),
    );
}

// ─── Get Recommended Jobs ─────────────────────────────────────────

/**
 * Returns personalized jobs based on the student's existing recommendations.
 * This is the primary "Live Jobs" endpoint: career-driven, match-scored.
 * Does NOT call Jooble — reads from the shared PostgreSQL cache.
 */
export async function getRecommendedJobsForUser(userId: string, filters?: LiveJobFilters): Promise<JobMatchResult[]> {
    const ctx = await buildStudentContext(userId);

    const page = filters?.page ?? 1;
    const limit = Math.min(filters?.limit ?? 30, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
        isActive: true,
    };

    if (filters?.career) {
        // Automatically fetch from Jooble for the explicitly selected career
        try {
            await syncJobsForCareers([filters.career], ctx.preferredLocation);
        } catch (err) {
            console.warn(`Failed to auto-sync jobs for career ${filters.career}:`, err);
        }

        // Explicitly selected career bypasses recommendation constraints
        where.careerMatches = { some: { careerIdentifier: { equals: filters.career, mode: 'insensitive' } } };
    } else {
        // Otherwise, fetch jobs for all recommended careers
        if (ctx.recommendedCareers.length === 0) {
            return [];
        }
        where.careerMatches = {
            some: {
                careerIdentifier: { in: ctx.recommendedCareers },
            },
        };
    }

    // Apply search filter (against cached DB — not Jooble)
    if (filters?.search) {
        const q = filters.search;
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
            { snippet: { contains: q, mode: 'insensitive' } },
        ];
    }

    // Internship / job type filter
    if (filters?.type === 'internships') {
        where.OR = [
            { type: { contains: 'intern', mode: 'insensitive' } },
            { snippet: { contains: 'intern', mode: 'insensitive' } },
        ];
    } else if (filters?.type === 'jobs') {
        where.NOT = { type: { contains: 'intern', mode: 'insensitive' } };
    }

    const [jobs, savedIds, appliedMap] = await Promise.all([
        prisma.job.findMany({
            where,
            include: { careerMatches: true },
            orderBy: { fetchedAt: 'desc' },
        }),
        getSavedJobIds(userId),
        getAppliedJobMap(userId),
    ]);

    // Apply strict relevance and seniority filters in memory
    const relevantJobs = jobs.filter(job => {
        if (filters?.career) {
            return isJobRelevantForCareer(job.title, job.snippet, filters.career);
        } else {
            // If no specific career is selected, check if it's relevant for ANY of its recommended career matches
            return job.careerMatches.some(cm => {
                if (ctx.recommendedCareers.includes(cm.careerIdentifier)) {
                    return isJobRelevantForCareer(job.title, job.snippet, cm.careerIdentifier);
                }
                return false;
            });
        }
    });

    // Score every job for this specific student (Live Jobs engine — independent from BYSER)
    const scored: JobMatchResult[] = relevantJobs.map((job) => {
        const result = scoreJob(
            {
                title: job.title,
                location: job.location,
                snippet: job.snippet,
                type: job.type,
                careerIdentifiers: job.careerMatches.map((cm) => cm.careerIdentifier),
            },
            ctx,
        );

        const appInfo = appliedMap.get(job.id);

        return {
            jobId: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            snippet: job.snippet,
            salary: job.salary,
            type: job.type,
            applyUrl: job.applyUrl,
            providerUpdatedAt: job.providerUpdatedAt,
            fetchedAt: job.fetchedAt,
            careerMatches: job.careerMatches.map((cm) => cm.careerIdentifier),
            matchScore: result.matchScore,
            confidence: result.confidence,
            recommendedCareer: result.recommendedCareer,
            matchedSkills: result.matchedSkills,
            skillGaps: result.skillGaps,
            gapSkills: result.skillGaps,          // backward-compat alias
            eduExperienceMatch: result.eduExperienceMatch,
            locationMatch: result.locationMatch,
            explanation: result.explanation,
            matchReasons: result.matchReasons,
            isActive: job.isActive,
            isSaved: savedIds.has(job.id),
            hasApplied: !!appInfo,
            applicationStatus: appInfo?.status ?? null,
            applicationId: appInfo?.id ?? null,
            applicationNotes: appInfo?.notes ?? null,
        };
    });

    // Filter by minimum match score if requested
    const filtered =
        filters?.minMatchScore != null
            ? scored.filter((s) => s.matchScore >= (filters.minMatchScore ?? 0))
            : scored;

    // Sort by match score descending, then paginate
    return filtered.sort((a, b) => b.matchScore - a.matchScore).slice(skip, skip + limit);
}

// ─── Get All Live Jobs (generic browse, still match-scored) ────────

export async function getAllLiveJobs(userId: string, filters?: LiveJobFilters): Promise<JobMatchResult[]> {
    return getRecommendedJobsForUser(userId, filters);
}

// ─── Get Single Job ───────────────────────────────────────────────

export async function getLiveJobById(userId: string, jobId: string): Promise<JobMatchResult> {
    const [job, ctx, savedIds, appliedMap] = await Promise.all([
        prisma.job.findUnique({ where: { id: jobId }, include: { careerMatches: true } }),
        buildStudentContext(userId),
        getSavedJobIds(userId),
        getAppliedJobMap(userId),
    ]);

    if (!job) {
        throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
    }

    const result = scoreJob(
        {
            title: job.title,
            location: job.location,
            snippet: job.snippet,
            type: job.type,
            careerIdentifiers: job.careerMatches.map((cm) => cm.careerIdentifier),
        },
        ctx,
    );

    const appInfo = appliedMap.get(job.id);

    return {
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        snippet: job.snippet,
        salary: job.salary,
        type: job.type,
        applyUrl: job.applyUrl,
        providerUpdatedAt: job.providerUpdatedAt,
        fetchedAt: job.fetchedAt,
        careerMatches: job.careerMatches.map((cm) => cm.careerIdentifier),
        matchScore: result.matchScore,
        confidence: result.confidence,
        recommendedCareer: result.recommendedCareer,
        matchedSkills: result.matchedSkills,
        skillGaps: result.skillGaps,
        gapSkills: result.skillGaps,          // backward-compat alias
        eduExperienceMatch: result.eduExperienceMatch,
        locationMatch: result.locationMatch,
        explanation: result.explanation,
        matchReasons: result.matchReasons,
        isActive: job.isActive,
        isSaved: savedIds.has(job.id),
        hasApplied: !!appInfo,
        applicationStatus: appInfo?.status ?? null,
        applicationId: appInfo?.id ?? null,
        applicationNotes: appInfo?.notes ?? null,
    };
}

// ─── Save / Unsave ────────────────────────────────────────────────

export async function saveJob(userId: string, jobId: string) {
    const exists = await prisma.job.findUnique({ where: { id: jobId } });
    if (!exists) throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);

    return prisma.savedJob.upsert({
        where: { userId_jobId: { userId, jobId } },
        update: {},
        create: { userId, jobId },
    });
}

export async function unsaveJob(userId: string, jobId: string) {
    return prisma.savedJob.deleteMany({ where: { userId, jobId } });
}

export async function getSavedJobs(userId: string): Promise<JobMatchResult[]> {
    const ctx = await buildStudentContext(userId);
    const [saved, appliedMap] = await Promise.all([
        prisma.savedJob.findMany({
            where: { userId },
            include: { job: { include: { careerMatches: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        getAppliedJobMap(userId),
    ]);

    return saved.map(({ job }) => {
        const result = scoreJob(
            { title: job.title, location: job.location, snippet: job.snippet, type: job.type, careerIdentifiers: job.careerMatches.map((cm) => cm.careerIdentifier) },
            ctx,
        );
        const appInfo = appliedMap.get(job.id);
        return {
            jobId: job.id, title: job.title, company: job.company, location: job.location,
            snippet: job.snippet, salary: job.salary, type: job.type, applyUrl: job.applyUrl,
            providerUpdatedAt: job.providerUpdatedAt, fetchedAt: job.fetchedAt,
            careerMatches: job.careerMatches.map((cm) => cm.careerIdentifier),
            matchScore: result.matchScore,
            confidence: result.confidence,
            recommendedCareer: result.recommendedCareer,
            matchedSkills: result.matchedSkills,
            skillGaps: result.skillGaps,
            gapSkills: result.skillGaps,          // backward-compat alias
            eduExperienceMatch: result.eduExperienceMatch,
            locationMatch: result.locationMatch,
            explanation: result.explanation,
            matchReasons: result.matchReasons,
            isActive: job.isActive, isSaved: true,
            hasApplied: !!appInfo,
            applicationStatus: appInfo?.status ?? null,
            applicationId: appInfo?.id ?? null,
            applicationNotes: appInfo?.notes ?? null,
        };
    });
}

// ─── Applications ─────────────────────────────────────────────────

export async function createApplication(
    userId: string,
    jobId: string,
    status: AppStatus = 'APPLIED',
    notes?: string,
) {
    const exists = await prisma.job.findUnique({ where: { id: jobId } });
    if (!exists) throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);

    return prisma.jobApplication.upsert({
        where: { userId_jobId: { userId, jobId } },
        update: {
            status,
            notes: notes !== undefined ? notes : undefined,
        },
        create: {
            userId,
            jobId,
            status,
            notes: notes ?? undefined,
        },
        include: { job: { select: { id: true, title: true, company: true, location: true, applyUrl: true } } },
    });
}

export async function getApplications(userId: string) {
    return prisma.jobApplication.findMany({
        where: { userId },
        include: { job: { select: { id: true, title: true, company: true, location: true, applyUrl: true } } },
        orderBy: { appliedAt: 'desc' },
    });
}

export async function updateApplication(userId: string, applicationId: string, status: AppStatus, notes?: string) {
    const app = await prisma.jobApplication.findFirst({ where: { id: applicationId, userId } });
    if (!app) throw new AppError('Application not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);

    return prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status, notes: notes ?? undefined },
        include: { job: { select: { id: true, title: true, company: true, location: true, applyUrl: true } } },
    });
}

// ─── Sync Trigger (admin/dev only) ───────────────────────────────

export async function triggerSync(userId: string) {
    const careers: string[] = [];
    const student = await getFullStudentData(userId);
    const location = student?.profile?.city ?? undefined;

    if (careers.length === 0) {
        throw new AppError(
            'No recommendations found. Generate recommendations first.',
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.USER_001,
        );
    }

    return syncJobsForCareers(careers, location);
}
