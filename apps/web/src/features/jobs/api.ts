import api from '@/api/axiosInstance';
import type { LiveJob, LiveJobFilters, JobApplication, ApplicationStatus, SyncResult } from './types';

function buildParams(filters?: LiveJobFilters): Record<string, string | number> {
    const params: Record<string, string | number> = {};
    if (!filters) return params;
    if (filters.career) params.career = filters.career;
    if (filters.location) params.location = filters.location;
    if (filters.type && filters.type !== 'all') params.type = filters.type;
    if (filters.minMatchScore != null) params.minMatch = filters.minMatchScore;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    return params;
}

// ─── Jobs ──────────────────────────────────────────────────────────

/** Must call /recommended for personalized, career-driven results */
export async function getRecommendedJobs(filters?: LiveJobFilters): Promise<LiveJob[]> {
    const { data } = await api.get('/live-jobs/recommended', { params: buildParams(filters) });
    return (data.data ?? []) as LiveJob[];
}

/** Generic live jobs browse — still match-scored */
export async function getLiveJobs(filters?: LiveJobFilters): Promise<LiveJob[]> {
    const { data } = await api.get('/live-jobs', { params: buildParams(filters) });
    return (data.data ?? []) as LiveJob[];
}

export async function getJob(id: string): Promise<LiveJob> {
    const { data } = await api.get(`/live-jobs/${id}`);
    return data.data as LiveJob;
}

// ─── Save / Unsave ─────────────────────────────────────────────────

export async function saveJob(id: string): Promise<void> {
    await api.post(`/live-jobs/${id}/save`);
}

export async function unsaveJob(id: string): Promise<void> {
    await api.delete(`/live-jobs/${id}/save`);
}

export async function getSavedJobs(filters?: LiveJobFilters): Promise<LiveJob[]> {
    const { data } = await api.get('/live-jobs/saved', { params: buildParams(filters) });
    return (data.data ?? []) as LiveJob[];
}

// ─── Applications ──────────────────────────────────────────────────

export async function createApplication(id: string, notes?: string): Promise<JobApplication> {
    const { data } = await api.post(`/live-jobs/${id}/application`, { notes });
    return data.data as JobApplication;
}

export async function getApplications(): Promise<JobApplication[]> {
    const { data } = await api.get('/live-jobs/applications');
    return (data.data ?? []) as JobApplication[];
}

export async function updateApplication(id: string, status: ApplicationStatus, notes?: string): Promise<JobApplication> {
    const { data } = await api.patch(`/live-jobs/applications/${id}`, { status, notes });
    return data.data as JobApplication;
}

// ─── Sync (admin / dev trigger) ────────────────────────────────────

export async function triggerSync(): Promise<SyncResult> {
    const { data } = await api.post('/live-jobs/sync');
    return data.data as SyncResult;
}
