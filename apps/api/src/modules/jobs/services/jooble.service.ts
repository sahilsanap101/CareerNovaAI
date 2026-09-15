import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import type { JoobleRequestParams, JoobleResponse, NormalizedJob } from '../types/jobs.types';

const JOOBLE_BASE_URL = 'https://jooble.org/api';

/**
 * Makes a single controlled call to the Jooble REST API.
 * The API key is read exclusively from the backend environment via process.env.
 * It is never logged, returned in API responses, or sent to the browser.
 */
export async function callJooble(params: JoobleRequestParams): Promise<JoobleResponse> {
    const apiKey = env.JOOBLE_API_KEY;
    if (!apiKey) {
        throw new Error('JOOBLE_API_KEY is not configured');
    }

    const url = `${JOOBLE_BASE_URL}/${apiKey}`;

    const body: Record<string, unknown> = {
        keywords: params.keywords,
        page: params.page ?? 1,
        ResultOnPage: params.ResultOnPage ?? env.JOOBLE_MAX_RESULTS_PER_QUERY,
        companysearch: params.companysearch ?? false,
    };

    if (params.location) body['location'] = params.location;
    if (params.radius) body['radius'] = params.radius;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 403) {
            throw new Error('JOOBLE_AUTH_ERROR');
        }
        if (!response.ok) {
            throw new Error(`Jooble API returned status ${response.status}`);
        }

        const data = (await response.json()) as JoobleResponse;
        return data;
    } catch (err: unknown) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('JOOBLE_TIMEOUT');
        }
        throw err;
    }
}

/**
 * Normalizes a raw Jooble job response into CareerNova's internal format.
 * No fields are fabricated. Missing fields stay undefined/null.
 */
export function normalizeJoobleJob(raw: NonNullable<JoobleResponse['jobs']>[number]): NormalizedJob | null {
    // link is the canonical apply URL — without it the job is not useful
    if (!raw.link || !raw.title) {
        logger.warn('Skipping Jooble job with missing link or title');
        return null;
    }

    // Jooble returns a synthetic id but sometimes it is empty
    const providerJobId = raw.id?.trim() || generateFallbackId(raw);

    let providerUpdatedAt: Date | undefined;
    if (raw.updated) {
        const parsed = new Date(raw.updated);
        if (!isNaN(parsed.getTime())) providerUpdatedAt = parsed;
    }

    // Jobs expire after configured TTL
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + env.JOOBLE_CACHE_TTL_HOURS);

    return {
        provider: 'JOOBLE',
        providerJobId,
        title: raw.title.trim(),
        company: raw.company?.trim() || undefined,
        location: raw.location?.trim() || undefined,
        snippet: raw.snippet?.trim() || undefined,
        salary: raw.salary?.trim() || undefined,
        type: raw.type?.trim() || undefined,
        source: raw.source?.trim() || undefined,
        applyUrl: raw.link.trim(),
        providerUpdatedAt,
        expiresAt,
    };
}

function generateFallbackId(raw: NonNullable<JoobleResponse['jobs']>[number]): string {
    // Deterministic fallback when Jooble returns no id
    const parts = [raw.title ?? '', raw.company ?? '', raw.link ?? ''];
    return Buffer.from(parts.join('|')).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}
