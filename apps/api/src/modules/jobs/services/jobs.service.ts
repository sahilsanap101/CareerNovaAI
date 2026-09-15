import { prisma } from '@/config/database';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '@pathforge/shared-constants';
import { getLatestRecommendations } from '@/modules/recommendations/repositories/recommendation.repository';
import { getFullStudentData } from '@/modules/profile/repositories/profile.repository';
import { scoreJob } from './matchScoring.service';
import { syncJobsForCareers } from './jobSync.service';
import type { LiveJobFilters, JobMatchResult, AppStatus } from '../types/jobs.types';

// ─── Helpers ──────────────────────────────────────────────────────

async function buildStudentContext(userId: string) {
    const [student, recs] = await Promise.all([
        getFullStudentData(userId),
        getLatestRecommendations(userId),
    ]);

    const recommendedCareers = recs.map((r) => r.careerPath.name);
    const skillNames = student?.skills.map((s) => s.skill.name) ?? [];
    const preferredLocation = student?.profile?.city ?? undefined;
    const workMode = student?.careerGoal?.preferredWorkMode ?? undefined;

    return { recommendedCareers, skillNames, preferredLocation, workMode };
}

async function getSavedJobIds(userId: string): Promise<Set<string>> {
    const saved = await prisma.savedJob.findMany({ where: { userId }, select: { jobId: true } });
    return new Set(saved.map((s) => s.jobId));
}

async function getAppliedJobIds(userId: string): Promise<Set<string>> {
    const applied = await prisma.jobApplication.findMany({ where: { userId }, select: { jobId: true } });
    return new Set(applied.map((a) => a.jobId));
}

// ─── Get Recommended Jobs ─────────────────────────────────────────

/**
 * Returns personalized jobs based on the student's existing recommendations.
 * This is the primary "Live Jobs" endpoint: career-driven, match-scored.
 * Does NOT call Jooble — reads from the shared PostgreSQL cache.
 */
export async function getRecommendedJobsForUser(userId: string, filters?: LiveJobFilters): Promise<JobMatchResult[]> {
    const ctx = await buildStudentContext(userId);

    if (ctx.recommendedCareers.length === 0) {
        return [];
    }

    const page = filters?.page ?? 1;
    const limit = Math.min(filters?.limit ?? 30, 100);
    const skip = (page - 1) * limit;

    // Fetch jobs from cache that are linked to any of the student's recommended careers
    const where: Parameters<typeof prisma.job.findMany>[0]['where'] = {
        isActive: true,
        careerMatches: {
            some: {
                careerIdentifier: { in: ctx.recommendedCareers },
            },
        },
    };

    // Apply optional career filter
    if (filters?.career) {
        where.careerMatches = { some: { careerIdentifier: filters.career } };
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

    const [jobs, savedIds, appliedIds] = await Promise.all([
        prisma.job.findMany({
            where,
            include: { careerMatches: true },
            orderBy: { fetchedAt: 'desc' },
            skip,
            take: limit * 2, // Fetch extra so we can re-sort by match score
        }),
        getSavedJobIds(userId),
        getAppliedJobIds(userId),
    ]);

    // Score every job for this specific student
    const scored: JobMatchResult[] = jobs.map((job) => {
        const { matchScore, matchedSkills, gapSkills, matchReasons } = scoreJob(
            {
                title: job.title,
                location: job.location,
                snippet: job.snippet,
                type: job.type,
                careerIdentifiers: job.careerMatches.map((cm) => cm.careerIdentifier),
            },
            ctx,
        );

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
            matchScore,
            matchedSkills,
            gapSkills,
            matchReasons,
            isActive: job.isActive,
            isSaved: savedIds.has(job.id),
            hasApplied: appliedIds.has(job.id),
        };
    });

    // Filter by minimum match score if requested
    const filtered =
        filters?.minMatchScore != null
            ? scored.filter((s) => s.matchScore >= (filters.minMatchScore ?? 0))
            : scored;

    // Sort by match score descending; return max `limit` items
    return filtered.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

// ─── Get All Live Jobs (generic browse, still match-scored) ────────

export async function getAllLiveJobs(userId: string, filters?: LiveJobFilters): Promise<JobMatchResult[]> {
    return getRecommendedJobsForUser(userId, filters);
}

// ─── Get Single Job ───────────────────────────────────────────────

export async function getLiveJobById(userId: string, jobId: string): Promise<JobMatchResult> {
    const [job, ctx, savedIds, appliedIds] = await Promise.all([
        prisma.job.findUnique({ where: { id: jobId }, include: { careerMatches: true } }),
        buildStudentContext(userId),
        getSavedJobIds(userId),
        getAppliedJobIds(userId),
    ]);

    if (!job) {
        throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
    }

    const { matchScore, matchedSkills, gapSkills, matchReasons } = scoreJob(
        {
            title: job.title,
            location: job.location,
            snippet: job.snippet,
            type: job.type,
            careerIdentifiers: job.careerMatches.map((cm) => cm.careerIdentifier),
        },
        ctx,
    );

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
        matchScore,
        matchedSkills,
        gapSkills,
        matchReasons,
        isActive: job.isActive,
        isSaved: savedIds.has(job.id),
        hasApplied: appliedIds.has(job.id),
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
    const [saved, appliedIds] = await Promise.all([
        prisma.savedJob.findMany({
            where: { userId },
            include: { job: { include: { careerMatches: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        getAppliedJobIds(userId),
    ]);

    return saved.map(({ job }) => {
        const { matchScore, matchedSkills, gapSkills, matchReasons } = scoreJob(
            { title: job.title, location: job.location, snippet: job.snippet, type: job.type, careerIdentifiers: job.careerMatches.map((cm) => cm.careerIdentifier) },
            ctx,
        );
        return {
            jobId: job.id, title: job.title, company: job.company, location: job.location,
            snippet: job.snippet, salary: job.salary, type: job.type, applyUrl: job.applyUrl,
            providerUpdatedAt: job.providerUpdatedAt, fetchedAt: job.fetchedAt,
            careerMatches: job.careerMatches.map((cm) => cm.careerIdentifier),
            matchScore, matchedSkills, gapSkills, matchReasons,
            isActive: job.isActive, isSaved: true, hasApplied: appliedIds.has(job.id),
        };
    });
}

// ─── Applications ─────────────────────────────────────────────────

export async function createApplication(userId: string, jobId: string, notes?: string) {
    const exists = await prisma.job.findUnique({ where: { id: jobId } });
    if (!exists) throw new AppError('Job not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);

    return prisma.jobApplication.upsert({
        where: { userId_jobId: { userId, jobId } },
        update: { status: 'APPLIED', notes: notes ?? undefined },
        create: { userId, jobId, status: 'APPLIED', notes: notes ?? undefined },
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
    const recs = await getLatestRecommendations(userId);
    const careers = recs.map((r) => r.careerPath.name);

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
