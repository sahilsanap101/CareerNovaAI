/**
 * LiveJobs.tsx — CareerNova Live Jobs Feature
 *
 * APPLY FLOW (important):
 *   "Apply Now" opens the external job URL in a new tab.
 *   CareerNova does NOT submit applications on behalf of the user.
 *   CareerNova does NOT automatically create an application record
 *   just because the link was clicked.
 *
 *   The user must explicitly choose a status (APPLIED, ASSESSMENT,
 *   INTERVIEW, OFFER, REJECTED) after returning to CareerNova.
 *   This is handled via the "Track Application" panel on each card.
 *
 * SECURITY:
 *   - No userId supplied from the frontend for ownership.
 *   - Authentication is handled exclusively by the existing JWT
 *     middleware (axiosInstance sends Authorization: Bearer <token>).
 *   - No Jooble API calls from the frontend.
 *   - No API keys in the frontend bundle.
 *   - No internal URLs or error details are shown to the user.
 *
 * ERROR HANDLING:
 *   - All errors are caught and displayed as friendly user messages.
 *   - Stack traces, DB errors, raw Jooble errors, API keys, and
 *     internal URLs are never surfaced to the user.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    getRecommendedJobs,
    getLiveJobs,
    getSavedJobs,
    getApplications,
    updateApplication,
} from './api';
import type {
    LiveJob,
    JobApplication,
    ApplicationStatus,
    LiveJobFilters,
} from './types';
import JobCard from './JobCard';

// ─── Constants ────────────────────────────────────────────────────────────────

type MainTab = 'recommended' | 'all' | 'saved' | 'applications';

const PAGE_SIZE = 18;

const EXTERNAL_PLATFORMS = [
    {
        name: 'LinkedIn Jobs',
        icon: '💼',
        color: '#0077b5',
        bg: 'rgba(0,119,181,0.12)',
        border: 'rgba(0,119,181,0.3)',
        url: (q: string) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}`,
    },
    {
        name: 'Naukri',
        icon: '🏢',
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.3)',
        url: (q: string) => `https://www.naukri.com/${encodeURIComponent(q.toLowerCase().replace(/ /g, '-'))}-jobs`,
    },
    {
        name: 'Indeed',
        icon: '🔍',
        color: '#003a9b',
        bg: 'rgba(0,58,155,0.12)',
        border: 'rgba(0,58,155,0.3)',
        url: (q: string) => `https://in.indeed.com/jobs?q=${encodeURIComponent(q)}`,
    },
    {
        name: 'Internshala',
        icon: '🎓',
        color: '#1dbf73',
        bg: 'rgba(29,191,115,0.12)',
        border: 'rgba(29,191,115,0.3)',
        url: (q: string) => `https://internshala.com/internships/keywords-${encodeURIComponent(q.toLowerCase().replace(/ /g, '-'))}`,
    },
    {
        name: 'Wellfound',
        icon: '🚀',
        color: '#f97316',
        bg: 'rgba(249,115,22,0.12)',
        border: 'rgba(249,115,22,0.3)',
        url: (q: string) => `https://wellfound.com/jobs?query=${encodeURIComponent(q)}`,
    },
    {
        name: 'Glassdoor',
        icon: '🌐',
        color: '#0caa41',
        bg: 'rgba(12,170,65,0.12)',
        border: 'rgba(12,170,65,0.3)',
        url: (q: string) => `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${encodeURIComponent(q)}`,
    },
];

const APP_STATUS_ORDER: ApplicationStatus[] = ['APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED'];

const statusColors: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
    SAVED:      { bg: 'rgba(99,102,241,0.15)',  text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
    APPLIED:    { bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
    ASSESSMENT: { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd', border: 'rgba(139,92,246,0.3)' },
    INTERVIEW:  { bg: 'rgba(245,158,11,0.15)',  text: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
    OFFER:      { bg: 'rgba(16,185,129,0.15)',  text: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
    REJECTED:   { bg: 'rgba(239,68,68,0.15)',   text: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
};

// ─── Friendly error messages ──────────────────────────────────────────────────
// Never expose stack traces, DB errors, raw Jooble errors, API keys, or URLs.

function toFriendlyError(err: unknown): string {
    if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
            return 'Unable to connect to the server. Please check your internet connection and try again.';
        }
        if (msg.includes('401') || msg.includes('unauthorized')) {
            return 'Your session has expired. Please log in again.';
        }
        if (msg.includes('403') || msg.includes('forbidden')) {
            return 'You do not have permission to perform this action.';
        }
        if (msg.includes('404')) {
            return 'The requested resource was not found.';
        }
        if (msg.includes('429')) {
            return 'Too many requests. Please wait a moment and try again.';
        }
        if (msg.includes('500') || msg.includes('server')) {
            return 'Something went wrong on our end. Please try again shortly.';
        }
    }
    return 'Something went wrong. Please try again.';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function JobSkeleton() {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        }}>
            {[100, 70, 50, 80, 60].map((w, i) => (
                <div key={i} style={{
                    height: i === 0 ? '18px' : '12px',
                    width: `${w}%`,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.05) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: '6px',
                }} />
            ))}
        </div>
    );
}

function EmptyState({
    icon, title, subtitle, action,
}: {
    icon: string;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}) {
    return (
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>{icon}</div>
            <p style={{ color: '#94a3b8', margin: '0 0 6px', fontWeight: 500 }}>{title}</p>
            {subtitle && <p style={{ color: '#4b5563', fontSize: '13px', margin: '0 0 16px' }}>{subtitle}</p>}
            {action}
        </div>
    );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '20px',
        }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#fca5a5', fontSize: '13px', lineHeight: 1.5 }}>{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(239,68,68,0.35)',
                        background: 'rgba(239,68,68,0.12)',
                        color: '#fca5a5',
                        fontSize: '12px',
                        cursor: 'pointer',
                        flexShrink: 0,
                    }}
                >
                    Retry
                </button>
            )}
        </div>
    );
}

function PaginationControls({
    page,
    hasMore,
    loading,
    onPrev,
    onNext,
}: {
    page: number;
    hasMore: boolean;
    loading: boolean;
    onPrev: () => void;
    onNext: () => void;
}) {
    if (page === 1 && !hasMore) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
            <button
                onClick={onPrev}
                disabled={page === 1 || loading}
                style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: page === 1 ? 'transparent' : 'rgba(255,255,255,0.05)',
                    color: page === 1 ? '#374151' : '#94a3b8',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                }}
            >
                ← Previous
            </button>
            <span style={{ color: '#64748b', fontSize: '13px' }}>Page {page}</span>
            <button
                onClick={onNext}
                disabled={!hasMore || loading}
                style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: hasMore ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: hasMore ? '#a5b4fc' : '#374151',
                    cursor: hasMore ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                }}
            >
                Next →
            </button>
        </div>
    );
}

// ─── Application Tracker sub-component ───────────────────────────────────────

function ApplicationTracker({
    applications,
    loading,
    error,
    onStatusUpdate,
    onNotesUpdate,
    onRetry,
}: {
    applications: JobApplication[];
    loading: boolean;
    error: string | null;
    onStatusUpdate: (id: string, status: ApplicationStatus, notes?: string) => void;
    onNotesUpdate: (id: string, notes: string) => void;
    onRetry: () => void;
}) {
    const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} style={{
                        height: '72px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.07)',
                        animation: 'shimmer 1.5s infinite',
                    }} />
                ))}
            </div>
        );
    }

    if (error) {
        return <ErrorBanner message={error} onRetry={onRetry} />;
    }

    if (applications.length === 0) {
        return (
            <EmptyState
                icon="📋"
                title="No applications tracked yet."
                subtitle="After clicking 'Apply Now' on a job, return here and use 'Track Application' to record your progress. CareerNova does not automatically submit applications."
            />
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Disclaimer */}
            <p style={{
                fontSize: '12px',
                color: '#475569',
                margin: '0 0 8px',
                padding: '10px 14px',
                background: 'rgba(99,102,241,0.06)',
                borderRadius: '8px',
                border: '1px solid rgba(99,102,241,0.12)',
                lineHeight: 1.5,
            }}>
                ℹ️ These are self-reported application records. CareerNova opens external job links but does not submit applications on your behalf.
            </p>
            {applications.map(app => {
                const notesDraft = editingNotes[app.id] ?? app.notes ?? '';
                return (
                    <div key={app.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'flex-start',
                    }}>
                        {/* Job info */}
                        <div style={{ flex: '1 1 200px' }}>
                            <p style={{ margin: '0 0 3px', fontWeight: 600, color: '#f1f5f9', fontSize: '14px' }}>
                                {app.job.title}
                            </p>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                                {app.job.company}{app.job.location ? ` • ${app.job.location}` : ''} • {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Right side: status + notes + link */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 280px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {/* Status badge */}
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    background: statusColors[app.status]?.bg ?? 'rgba(255,255,255,0.08)',
                                    color: statusColors[app.status]?.text ?? '#94a3b8',
                                    border: `1px solid ${statusColors[app.status]?.border ?? 'transparent'}`,
                                    letterSpacing: '0.03em',
                                }}>
                                    {app.status}
                                </span>

                                {/* Status dropdown */}
                                <select
                                    value={app.status}
                                    onChange={e => onStatusUpdate(app.id, e.target.value as ApplicationStatus, app.notes ?? undefined)}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: '#1e2033',
                                        color: '#94a3b8',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                    }}
                                >
                                    {APP_STATUS_ORDER.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>

                                {/* External view link */}
                                <a
                                    href={app.job.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        background: 'rgba(99,102,241,0.15)',
                                        color: '#a5b4fc',
                                        fontSize: '12px',
                                        textDecoration: 'none',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    View Job →
                                </a>
                            </div>

                            {/* Notes field */}
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                                <textarea
                                    value={notesDraft}
                                    onChange={e => setEditingNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                                    placeholder="Add notes (e.g. interview date, recruiter name)…"
                                    rows={2}
                                    maxLength={1000}
                                    style={{
                                        flex: 1,
                                        padding: '7px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: '#94a3b8',
                                        fontSize: '12px',
                                        resize: 'none',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        lineHeight: 1.4,
                                    }}
                                />
                                {notesDraft !== (app.notes ?? '') && (
                                    <button
                                        onClick={() => {
                                            onNotesUpdate(app.id, notesDraft);
                                            setEditingNotes(prev => {
                                                const next = { ...prev };
                                                delete next[app.id];
                                                return next;
                                            });
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(99,102,241,0.35)',
                                            background: 'rgba(99,102,241,0.1)',
                                            color: '#a5b4fc',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        Save
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

import { useCareerStore } from '@/store/career.store';
import { useSearchParams } from 'react-router-dom';

const LiveJobs: React.FC = () => {
    const globalCareer = useCareerStore(state => state.selectedCareer);
    const setGlobalCareer = useCareerStore(state => state.setSelectedCareer);
    const [searchParams] = useSearchParams();
    const queryCareer = searchParams.get('career');
    
    const [activeTab, setActiveTab] = useState<MainTab>('recommended');
    
    useEffect(() => {
        if (queryCareer && queryCareer !== globalCareer?.careerName) {
            setGlobalCareer({
                careerId: queryCareer.toLowerCase().replace(/\s+/g, '-'),
                careerName: queryCareer,
                domain: 'Technology',
                selectedAt: new Date().toISOString()
            });
        }
    }, [queryCareer, globalCareer?.careerName, setGlobalCareer]);

    const selectedCareer = globalCareer?.careerName || null;

    const handleCareerToggle = useCallback((career: string) => {
        if (selectedCareer === career) {
            setGlobalCareer(null);
        } else {
            setGlobalCareer({
                careerId: career.toLowerCase().replace(/\s+/g, '-'),
                careerName: career,
                domain: 'Technology',
                selectedAt: new Date().toISOString()
            });
        }
    }, [selectedCareer, setGlobalCareer]);

    // Per-tab state: jobs, loading, error, page
    const [recommendedJobs, setRecommendedJobs] = useState<LiveJob[]>([]);
    const [recLoading, setRecLoading]  = useState(true);
    const [recError, setRecError]      = useState<string | null>(null);
    const [recPage, setRecPage]        = useState(1);
    const [recHasMore, setRecHasMore]  = useState(false);

    const [allJobs, setAllJobs]        = useState<LiveJob[]>([]);
    const [allLoading, setAllLoading]  = useState(false);
    const [allError, setAllError]      = useState<string | null>(null);
    const [allPage, setAllPage]        = useState(1);
    const [allHasMore, setAllHasMore]  = useState(false);
    const [allFetched, setAllFetched]  = useState(false);

    const [savedJobs, setSavedJobs]      = useState<LiveJob[]>([]);
    const [savedLoading, setSavedLoading] = useState(false);
    const [savedError, setSavedError]    = useState<string | null>(null);
    const [savedFetched, setSavedFetched] = useState(false);

    const [applications, setApplications]     = useState<JobApplication[]>([]);
    const [appsLoading, setAppsLoading]       = useState(false);
    const [appsError, setAppsError]           = useState<string | null>(null);
    const [appsFetched, setAppsFetched]       = useState(false);

    const [careers, setCareers]      = useState<string[]>([]);
    const [search, setSearch]        = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'jobs' | 'internships'>('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search — filter cache only, never triggers Jooble
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    // ─── Load recommended jobs (primary data) ─────────────────────────────────
    const reqIdRef = useRef(0);
    const loadRecommended = useCallback(async (page = 1) => {
        setRecLoading(true);
        setRecError(null);
        // Clear previous results immediately on new filter
        if (page === 1) setRecommendedJobs([]);
        
        const currentReqId = ++reqIdRef.current;
        try {
            const filters: LiveJobFilters = { page, limit: PAGE_SIZE };
            if (debouncedSearch) filters.search = debouncedSearch;
            if (typeFilter !== 'all') filters.type = typeFilter;
            if (selectedCareer) filters.career = selectedCareer;
            const jobs = await getRecommendedJobs(filters);
            
            // Prevent race condition: ignore this response if a newer request was started
            if (currentReqId !== reqIdRef.current) return;
            
            setRecommendedJobs(jobs);
            setRecPage(page);
            setRecHasMore(jobs.length === PAGE_SIZE);
            // Extract ranked careers from recommendedCareer field
            const seen = new Set<string>();
            const ranked: string[] = [];
            for (const j of jobs) {
                if (j.recommendedCareer && !seen.has(j.recommendedCareer)) {
                    seen.add(j.recommendedCareer);
                    ranked.push(j.recommendedCareer);
                    if (ranked.length >= 5) break;
                }
            }
            if (ranked.length === 0) {
                const fallback = new Set<string>();
                jobs.forEach(j => j.careerMatches.forEach(c => fallback.add(c)));
                Array.from(fallback).slice(0, 5).forEach(c => ranked.push(c));
            }
            if (page === 1) {
                if (selectedCareer && !ranked.includes(selectedCareer)) {
                    ranked.unshift(selectedCareer);
                }
                setCareers(ranked);
            }
        } catch (err) {
            setRecError(toFriendlyError(err));
        } finally {
            setRecLoading(false);
        }
    }, [debouncedSearch, typeFilter, selectedCareer]);

    // ─── Load all jobs (explore tab) ──────────────────────────────────────────
    const loadAllJobs = useCallback(async (page = 1) => {
        setAllLoading(true);
        setAllError(null);
        try {
            const filters: LiveJobFilters = { page, limit: PAGE_SIZE };
            if (debouncedSearch) filters.search = debouncedSearch;
            if (typeFilter !== 'all') filters.type = typeFilter;
            if (selectedCareer) filters.career = selectedCareer;
            const jobs = await getLiveJobs(filters);
            // Deduplicate by jobId (in case of duplicate entries across pages)
            setAllJobs(prev => {
                if (page === 1) return jobs;
                const existingIds = new Set(prev.map(j => j.jobId));
                return [...prev, ...jobs.filter(j => !existingIds.has(j.jobId))];
            });
            setAllPage(page);
            setAllHasMore(jobs.length === PAGE_SIZE);
            setAllFetched(true);
        } catch (err) {
            setAllError(toFriendlyError(err));
        } finally {
            setAllLoading(false);
        }
    }, [debouncedSearch, typeFilter, selectedCareer]);

    // ─── Load saved jobs ──────────────────────────────────────────────────────
    const loadSavedJobs = useCallback(async () => {
        setSavedLoading(true);
        setSavedError(null);
        try {
            const jobs = await getSavedJobs();
            setSavedJobs(jobs);
            setSavedFetched(true);
        } catch (err) {
            setSavedError(toFriendlyError(err));
        } finally {
            setSavedLoading(false);
        }
    }, []);

    // ─── Load applications ────────────────────────────────────────────────────
    const loadApplications = useCallback(async () => {
        setAppsLoading(true);
        setAppsError(null);
        try {
            const apps = await getApplications();
            setApplications(apps);
            setAppsFetched(true);
        } catch (err) {
            setAppsError(toFriendlyError(err));
        } finally {
            setAppsLoading(false);
        }
    }, []);

    // Fetch data on mount and whenever filters change
    useEffect(() => {
        if (activeTab === 'recommended') {
            void loadRecommended(1);
        } else if (activeTab === 'all') {
            void loadAllJobs(1);
        }
    }, [debouncedSearch, typeFilter, selectedCareer, activeTab, loadRecommended, loadAllJobs]);

    // Load tab data on first visit to that tab for non-filtered tabs
    const prevTab = useRef<MainTab>('recommended');
    useEffect(() => {
        if (activeTab === prevTab.current) return;
        prevTab.current = activeTab;
        if (activeTab === 'saved' && !savedFetched) void loadSavedJobs();
        if (activeTab === 'applications' && !appsFetched) void loadApplications();
    }, [activeTab, savedFetched, appsFetched, loadSavedJobs, loadApplications]);

    // ─── Cross-tab state updates ──────────────────────────────────────────────

    const handleSaveToggle = useCallback((jobId: string, nowSaved: boolean) => {
        const update = (jobs: LiveJob[]) => jobs.map(j => j.jobId === jobId ? { ...j, isSaved: nowSaved } : j);
        setRecommendedJobs(update);
        setAllJobs(update);
        if (!nowSaved) setSavedJobs(prev => prev.filter(j => j.jobId !== jobId));
    }, []);

    const handleApplied = useCallback((jobId: string) => {
        const mark = (jobs: LiveJob[]) => jobs.map(j => j.jobId === jobId ? { ...j, hasApplied: true } : j);
        setRecommendedJobs(mark);
        setAllJobs(mark);
        setSavedJobs(mark);
        // Refresh applications list so new record appears
        void loadApplications();
    }, [loadApplications]);

    // ─── Application management ───────────────────────────────────────────────

    const handleStatusUpdate = useCallback(async (id: string, status: ApplicationStatus, notes?: string) => {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        try {
            await updateApplication(id, status, notes);
        } catch {
            // Revert on failure — no technical error shown, just reload
            void loadApplications();
        }
    }, [loadApplications]);

    const handleNotesUpdate = useCallback(async (id: string, notes: string) => {
        const app = applications.find(a => a.id === id);
        if (!app) return;
        try {
            await updateApplication(id, app.status, notes);
            setApplications(prev => prev.map(a => a.id === id ? { ...a, notes } : a));
        } catch {
            // Silently fail — user can retry
        }
    }, [applications]);

    // ─── Client-side filter for search/type/career (against loaded cache) ─────

    const filterJobs = useCallback((jobs: LiveJob[]) => {
        let filtered = jobs;
        if (selectedCareer) {
            filtered = filtered.filter(j =>
                j.careerMatches.includes(selectedCareer) || j.recommendedCareer === selectedCareer
            );
        }
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            filtered = filtered.filter(j =>
                j.title.toLowerCase().includes(q) ||
                (j.company ?? '').toLowerCase().includes(q) ||
                (j.snippet ?? '').toLowerCase().includes(q)
            );
        }
        if (typeFilter === 'internships') {
            filtered = filtered.filter(j =>
                (j.type ?? '').toLowerCase().includes('intern') ||
                (j.snippet ?? '').toLowerCase().includes('intern')
            );
        } else if (typeFilter === 'jobs') {
            filtered = filtered.filter(j => !(j.type ?? '').toLowerCase().includes('intern'));
        }
        return filtered;
    }, [selectedCareer, debouncedSearch, typeFilter]);

    // ─── Computed ─────────────────────────────────────────────────────────────

    const primaryCareer = careers[0] ?? 'Software Engineer';

    const tabStyle = (tab: MainTab): React.CSSProperties => ({
        padding: '9px 20px',
        borderRadius: '8px',
        border: activeTab === tab ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
        background: activeTab === tab ? 'rgba(99,102,241,0.2)' : 'transparent',
        color: activeTab === tab ? '#a5b4fc' : '#64748b',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap' as const,
    });

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div style={{ padding: '28px 24px', maxWidth: '1100px', margin: '0 auto' }}>
            <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) { .jobs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 680px)  { .jobs-grid { grid-template-columns: 1fr; } }
        .career-tabs-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .career-tabs-scroll::-webkit-scrollbar { display: none; }
        .platform-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 768px) { .platform-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .platform-grid { grid-template-columns: 1fr; } }
      `}</style>

            {/* ─── Header ─────────────────────────────────────────── */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px' }}>💼</span>
                    <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, background: 'linear-gradient(135deg, #a5b4fc, #818cf8, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        LIVE JOBS
                    </h1>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                    Real opportunities matched to your CareerNova career recommendations.
                </p>
            </div>

            {/* ─── 🎯 Your Career Matches ──────────────────────────── */}
            {careers.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '18px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        🎯 Your Career Matches
                    </p>
                    <div className="career-tabs-scroll">
                        <button
                            onClick={() => setGlobalCareer(null)}
                            style={{
                                padding: '7px 16px',
                                borderRadius: '20px',
                                border: selectedCareer === null ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                background: selectedCareer === null ? 'rgba(99,102,241,0.2)' : 'transparent',
                                color: selectedCareer === null ? '#a5b4fc' : '#64748b',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            All Careers
                        </button>
                        {careers.map((career, idx) => (
                            <button
                                key={career}
                                onClick={() => handleCareerToggle(career)}
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: '20px',
                                    border: selectedCareer === career ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
                                    background: selectedCareer === career ? 'rgba(99,102,241,0.2)' : 'transparent',
                                    color: selectedCareer === career ? '#a5b4fc' : '#94a3b8',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                }}
                            >
                                <span style={{ fontSize: '10px', color: '#6366f1' }}>#{idx + 1}</span>
                                {career}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Nav Tabs ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button style={tabStyle('recommended')} onClick={() => setActiveTab('recommended')}>🔥 Best Matches</button>
                <button style={tabStyle('all')} onClick={() => setActiveTab('all')}>🔎 Explore Jobs</button>
                <button style={tabStyle('saved')} onClick={() => setActiveTab('saved')}>♥ Saved Jobs</button>
                <button style={tabStyle('applications')} onClick={() => setActiveTab('applications')}>📋 My Applications</button>
            </div>

            {/* ─── Search + Type Filter (shown for jobs tabs) ────────── */}
            {activeTab !== 'applications' && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search jobs, companies…"
                        style={{
                            flex: 1,
                            minWidth: '200px',
                            padding: '9px 14px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)',
                            color: '#f1f5f9',
                            fontSize: '13px',
                            outline: 'none',
                        }}
                    />
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}
                        style={{
                            padding: '9px 14px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: '#1e2033',
                            color: '#94a3b8',
                            fontSize: '13px',
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="jobs">Jobs</option>
                        <option value="internships">Internships</option>
                    </select>
                </div>
            )}

            {/* ─── 🔥 Best Job Matches For You ────────────────────────── */}
            {activeTab === 'recommended' && (
                <div>
                    {recError && <ErrorBanner message={recError} onRetry={() => void loadRecommended(recPage)} />}
                    {recLoading ? (
                        <div className="jobs-grid">
                            {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
                        </div>
                    ) : filterJobs(recommendedJobs).length === 0 ? (
                        recommendedJobs.length === 0 && !recError ? (
                            <EmptyState
                                icon="🎯"
                                title={selectedCareer ? `No live jobs found for ${selectedCareer} right now.` : "No job matches yet."}
                                subtitle={selectedCareer 
                                    ? `We couldn't find any currently open jobs matching your selected career track. Try broadening your search or check back later.`
                                    : "Complete your Career Recommendation profile to receive personalized job matches. Your recommended careers drive which jobs appear here."}
                            />
                        ) : (
                            <EmptyState
                                icon="🔍"
                                title="No jobs match your current filters."
                                subtitle="Try clearing your search or choosing a different career."
                            />
                        )
                    ) : (
                        <>
                            {/* Top 3 highlight section */}
                            {recPage === 1 && filterJobs(recommendedJobs).slice(0, 3).length > 0 && (
                                <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(99,102,241,0.06)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)' }}>
                                    <p style={{ color: '#6366f1', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                                        🌟 Top 3 Matches For You
                                    </p>
                                    <div className="jobs-grid">
                                        {filterJobs(recommendedJobs).slice(0, 3).map(job => (
                                            <JobCard key={job.jobId} job={job} onSaveToggle={handleSaveToggle} onApplied={handleApplied} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="jobs-grid">
                                {filterJobs(recommendedJobs).slice(recPage === 1 ? 3 : 0).map(job => (
                                    <JobCard key={job.jobId} job={job} onSaveToggle={handleSaveToggle} onApplied={handleApplied} />
                                ))}
                            </div>
                            <PaginationControls
                                page={recPage}
                                hasMore={recHasMore}
                                loading={recLoading}
                                onPrev={() => void loadRecommended(recPage - 1)}
                                onNext={() => void loadRecommended(recPage + 1)}
                            />
                        </>
                    )}
                </div>
            )}

            {/* ─── 🔎 Explore Live Jobs ─────────────────────────────── */}
            {activeTab === 'all' && (
                <div>
                    {allError && <ErrorBanner message={allError} onRetry={() => void loadAllJobs(1)} />}
                    {allLoading && allJobs.length === 0 ? (
                        <div className="jobs-grid">
                            {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
                        </div>
                    ) : !allFetched ? null : filterJobs(allJobs).length === 0 ? (
                        <EmptyState
                            icon="🔍"
                            title="No live opportunities cached right now."
                            subtitle="The job cache may not have been synced yet. Check back shortly or try clearing your filters."
                        />
                    ) : (
                        <>
                            <div className="jobs-grid">
                                {filterJobs(allJobs).map(job => (
                                    <JobCard key={job.jobId} job={job} onSaveToggle={handleSaveToggle} onApplied={handleApplied} />
                                ))}
                            </div>
                            <PaginationControls
                                page={allPage}
                                hasMore={allHasMore}
                                loading={allLoading}
                                onPrev={() => { setAllJobs([]); void loadAllJobs(allPage - 1); }}
                                onNext={() => { setAllJobs([]); void loadAllJobs(allPage + 1); }}
                            />
                        </>
                    )}
                </div>
            )}

            {/* ─── Saved Jobs ───────────────────────────────────────── */}
            {activeTab === 'saved' && (
                <div>
                    {savedError && <ErrorBanner message={savedError} onRetry={loadSavedJobs} />}
                    {savedLoading ? (
                        <div className="jobs-grid">
                            {[...Array(3)].map((_, i) => <JobSkeleton key={i} />)}
                        </div>
                    ) : savedJobs.length === 0 ? (
                        <EmptyState
                            icon="♥"
                            title="No saved jobs yet."
                            subtitle="Click ♡ on any job card to save it for later. Saved jobs are personal to your account."
                        />
                    ) : filterJobs(savedJobs).length === 0 ? (
                        <EmptyState
                            icon="🔍"
                            title="No saved jobs match your filters."
                            subtitle="Clear your search to see all saved jobs."
                        />
                    ) : (
                        <div className="jobs-grid">
                            {filterJobs(savedJobs).map(job => (
                                <JobCard key={job.jobId} job={job} onSaveToggle={handleSaveToggle} onApplied={handleApplied} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ─── 📋 My Applications ───────────────────────────────── */}
            {activeTab === 'applications' && (
                <ApplicationTracker
                    applications={applications}
                    loading={appsLoading}
                    error={appsError}
                    onStatusUpdate={handleStatusUpdate}
                    onNotesUpdate={handleNotesUpdate}
                    onRetry={loadApplications}
                />
            )}

            {/* ─── 🌐 Explore More Opportunities ──────────────────────── */}
            <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
                <p style={{ color: '#6366f1', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
                    🌐 Explore More Opportunities
                </p>
                <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '13px' }}>
                    Search your recommended career on popular platforms.{' '}
                    <span style={{ color: '#475569', fontSize: '12px' }}>
                        (CareerNova does not scrape these platforms or claim to submit applications on your behalf)
                    </span>
                </p>
                <div className="platform-grid">
                    {EXTERNAL_PLATFORMS.map(platform => (
                        <a
                            key={platform.name}
                            href={platform.url(primaryCareer)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                background: platform.bg,
                                border: `1px solid ${platform.border}`,
                                color: platform.color,
                                textDecoration: 'none',
                                fontSize: '13px',
                                fontWeight: 500,
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                            <span style={{ fontSize: '20px' }}>{platform.icon}</span>
                            {platform.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveJobs;
