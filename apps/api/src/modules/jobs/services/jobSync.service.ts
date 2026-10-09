import { prisma } from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { callJooble, normalizeJoobleJob } from './jooble.service';
import { getSearchQueriesForCareer, inferMatchingCareers } from './careerJobMapping.service';
import type { SyncResult } from '../types/jobs.types';
import { isJobRelevantForCareer } from './careerRelevance.service';

/** How many total Jooble requests have been made across all syncs */
async function getTotalRequestCount(): Promise<number> {
    const agg = await prisma.jobSyncLog.aggregate({ _sum: { requestCount: true } });
    return agg._sum.requestCount ?? 0;
}

/** Are the cached jobs for a career still fresh enough to skip Jooble? */
async function areCareersJobsFresh(careers: string[]): Promise<boolean> {
    const ttlMs = env.JOOBLE_CACHE_TTL_HOURS * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - ttlMs);

    // Find the last successful sync
    const lastSuccess = await prisma.jobSyncLog.findFirst({
        where: { status: 'SUCCESS', provider: 'JOOBLE' },
        orderBy: { startedAt: 'desc' },
    });

    if (!lastSuccess || lastSuccess.startedAt < cutoff) return false;

    // At least some jobs exist for every requested career
    for (const career of careers) {
        const count = await prisma.jobCareerMatch.count({
            where: {
                careerIdentifier: career,
                job: { isActive: true, fetchedAt: { gte: cutoff } },
            },
        });
        if (count === 0) return false;
    }
    return true;
}

/**
 * Syncs Jooble jobs for the given career names into the shared PostgreSQL cache.
 *
 * - Checks quota FIRST before any network call
 * - Uses TTL to skip redundant syncs
 * - Limits total career queries to max 3 per sync (conservative quota protection)
 * - Concurrency guard prevents overlapping in-flight syncs
 * - Deduplicates via provider + providerJobId
 * - Creates JobCareerMatch links so one job can serve multiple careers
 * - Returns a summary (never the API key or raw error details)
 */
export async function syncJobsForCareers(
    careers: string[],
    location?: string,
): Promise<SyncResult> {
    const safetyLimit = env.JOOBLE_SAFETY_LIMIT;
    const total = await getTotalRequestCount();

    // 1. Quota Safety Threshold Check
    if (total >= safetyLimit) {
        logger.warn(`Jooble request safety limit reached (${total}/${safetyLimit}). Sync aborted.`);
        return {
            status: 'QUOTA_EXCEEDED',
            requestsUsed: 0,
            jobsUpserted: 0,
            queriesExecuted: [],
            message: 'Jooble request safety limit reached. Sync aborted to protect API quota.',
        };
    }

    // 2. Concurrency Guard: Check if another sync is currently running
    const activeSync = await prisma.jobSyncLog.findFirst({
        where: {
            provider: 'JOOBLE',
            status: 'PENDING',
            startedAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
        },
    });

    if (activeSync) {
        return {
            status: 'IN_PROGRESS',
            requestsUsed: 0,
            jobsUpserted: 0,
            queriesExecuted: [],
            message: 'A job synchronization is already in progress. Please try again shortly.',
        };
    }

    // 3. Freshness / TTL Check
    const fresh = await areCareersJobsFresh(careers);
    if (fresh) {
        return {
            status: 'SKIPPED',
            requestsUsed: 0,
            jobsUpserted: 0,
            queriesExecuted: [],
            message: 'Jobs cache is fresh. Skipped Jooble sync.',
        };
    }

    // 4. Create sync audit log in PENDING state
    const log = await prisma.jobSyncLog.create({
        data: { provider: 'JOOBLE', status: 'PENDING' },
    });

    let requestCount = 0;
    let jobsUpserted = 0;
    const queriesExecuted: string[] = [];
    const allCareers = careers.map((c) => c.toLowerCase());

    // 5. Conservative query budget: maximum 3 career queries total across this sync
    const maxQueriesTotal = Math.min(env.JOOBLE_MAX_QUERIES_PER_SYNC, 3);
    const targetCareers = careers.slice(0, maxQueriesTotal);

    try {
        for (const career of targetCareers) {
            if (queriesExecuted.length >= maxQueriesTotal) break;
            if (total + requestCount >= safetyLimit) break;

            // Pick up to 5 queries per career (primary + fallbacks)
            const careerQueries = getSearchQueriesForCareer(career, 5);
            
            for (const query of careerQueries) {
                if (queriesExecuted.length >= maxQueriesTotal) break;
                if (total + requestCount >= safetyLimit) break;

                logger.info(`Jooble sync: career="${career}" query="${query}" (${queriesExecuted.length + 1}/${maxQueriesTotal})`);
                queriesExecuted.push(query);

                let joobleResponse;
                try {
                    joobleResponse = await callJooble({
                        keywords: query,
                        location: location || undefined,
                        radius: '40',
                        page: 1,
                        ResultOnPage: env.JOOBLE_MAX_RESULTS_PER_QUERY,
                    });
                    requestCount++;
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Unknown error';
                    logger.error(`Jooble API error for query "${query}": ${msg}`);
                    // Stop on auth errors or timeout — no uncontrolled retries
                    if (msg === 'JOOBLE_AUTH_ERROR' || msg === 'JOOBLE_TIMEOUT') {
                        break;
                    }
                    continue;
                }

                const rawJobs = joobleResponse?.jobs ?? [];
                let thisQueryUpserted = 0;
                let thisQueryRelevant = 0;

                for (const raw of rawJobs) {
                    const normalized = normalizeJoobleJob(raw);
                    if (!normalized) continue;

                    if (isJobRelevantForCareer(normalized.title, normalized.snippet ?? null, career)) {
                        thisQueryRelevant++;
                    }

                    // Deduplicate & Upsert job record
                    const job = await prisma.job.upsert({
                        where: {
                            provider_providerJobId: {
                                provider: normalized.provider,
                                providerJobId: normalized.providerJobId,
                            },
                        },
                        update: {
                            title: normalized.title,
                            company: normalized.company,
                            location: normalized.location,
                            snippet: normalized.snippet,
                            salary: normalized.salary,
                            type: normalized.type,
                            source: normalized.source,
                            applyUrl: normalized.applyUrl,
                            providerUpdatedAt: normalized.providerUpdatedAt,
                            fetchedAt: new Date(),
                            expiresAt: normalized.expiresAt,
                            isActive: true,
                        },
                        create: {
                            provider: normalized.provider,
                            providerJobId: normalized.providerJobId,
                            title: normalized.title,
                            company: normalized.company,
                            location: normalized.location,
                            snippet: normalized.snippet,
                            salary: normalized.salary,
                            type: normalized.type,
                            source: normalized.source,
                            applyUrl: normalized.applyUrl,
                            providerUpdatedAt: normalized.providerUpdatedAt,
                            expiresAt: normalized.expiresAt,
                        },
                    });

                    jobsUpserted++;
                    thisQueryUpserted++;

                    // Link this job to careers it matches (inferred + queried career if relevant)
                    let matchedCareers = inferMatchingCareers(normalized.title, allCareers.map(c => c.charAt(0).toUpperCase() + c.slice(1)));
                    
                    if (isJobRelevantForCareer(normalized.title, normalized.snippet ?? null, career)) {
                        matchedCareers.push(career);
                    }
                    
                    matchedCareers = matchedCareers.filter((v, i, arr) => arr.indexOf(v) === i);

                    for (const matchedCareer of matchedCareers) {
                        await prisma.jobCareerMatch.upsert({
                            where: { jobId_careerIdentifier: { jobId: job.id, careerIdentifier: matchedCareer } },
                            update: { queryUsed: query },
                            create: { jobId: job.id, careerIdentifier: matchedCareer, queryUsed: query },
                        });
                    }
                }
                
                // If we upserted some truly relevant jobs, we can stop falling back for this career
                if (thisQueryRelevant > 0) {
                    break;
                }
            }
        }

        // 6. Stale Job Handling: Mark jobs older than 2x TTL as inactive
        const cutoff = new Date(Date.now() - env.JOOBLE_CACHE_TTL_HOURS * 60 * 60 * 1000 * 2);
        await prisma.job.updateMany({
            where: { fetchedAt: { lt: cutoff }, isActive: true },
            data: { isActive: false },
        });

        // 7. Audit log completion
        await prisma.jobSyncLog.update({
            where: { id: log.id },
            data: {
                completedAt: new Date(),
                status: 'SUCCESS',
                requestCount,
                queriesExecuted,
                jobsUpserted,
            },
        });

        return {
            status: 'SUCCESS',
            requestsUsed: requestCount,
            jobsUpserted,
            queriesExecuted,
            message: `Sync complete. ${jobsUpserted} jobs upserted using ${requestCount} API requests.`,
        };
    } catch (err: unknown) {
        const rawMsg = err instanceof Error ? err.message : 'Unknown error';
        const apiKey = env.JOOBLE_API_KEY;
        const msg = apiKey ? rawMsg.split(apiKey).join('[REDACTED]') : rawMsg;
        logger.error('Job sync failed:', msg);

        await prisma.jobSyncLog.update({
            where: { id: log.id },
            data: {
                completedAt: new Date(),
                status: 'FAILED',
                requestCount,
                queriesExecuted,
                jobsUpserted,
                lastError: msg.substring(0, 500),
            },
        });

        return {
            status: 'FAILED',
            requestsUsed: requestCount,
            jobsUpserted,
            queriesExecuted,
            message: 'Sync encountered an error. Partial results may have been cached.',
        };
    }
}
