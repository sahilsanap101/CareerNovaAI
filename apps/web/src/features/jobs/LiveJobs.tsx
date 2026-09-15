import React, { useState, useEffect, useCallback } from 'react';
import { getRecommendedJobs, getLiveJobs, getSavedJobs, getApplications, updateApplication } from './api';
import type { LiveJob, JobApplication, ApplicationStatus, LiveJobFilters } from './types';
import JobCard from './JobCard';

type MainTab = 'recommended' | 'all' | 'saved' | 'applications';

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
    SAVED: { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
    APPLIED: { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
    ASSESSMENT: { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd', border: 'rgba(139,92,246,0.3)' },
    INTERVIEW: { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
    OFFER: { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7', border: 'rgba(16,185,129,0.3)' },
    REJECTED: { bg: 'rgba(239,68,68,0.15)', text: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
};

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

const LiveJobs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MainTab>('recommended');
    const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
    const [recommendedJobs, setRecommendedJobs] = useState<LiveJob[]>([]);
    const [allJobs, setAllJobs] = useState<LiveJob[]>([]);
    const [savedJobs, setSavedJobs] = useState<LiveJob[]>([]);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [careers, setCareers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'jobs' | 'internships'>('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search — filter cache, never call Jooble
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    // Load recommended jobs on mount
    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const jobs = await getRecommendedJobs();
                setRecommendedJobs(jobs);
                // Extract unique careers from what was returned
                const careerSet = new Set<string>();
                jobs.forEach(j => j.careerMatches.forEach(c => careerSet.add(c)));
                setCareers(Array.from(careerSet).slice(0, 5));
            } catch {
                setError('live_jobs_unavailable');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Load tab-specific data on tab switch
    useEffect(() => {
        if (activeTab === 'all' && allJobs.length === 0) {
            getLiveJobs().then(setAllJobs).catch(() => { });
        }
        if (activeTab === 'saved' && savedJobs.length === 0) {
            getSavedJobs().then(setSavedJobs).catch(() => { });
        }
        if (activeTab === 'applications' && applications.length === 0) {
            getApplications().then(setApplications).catch(() => { });
        }
    }, [activeTab]);

    const handleSaveToggle = useCallback((jobId: string, nowSaved: boolean) => {
        const updateSaved = (jobs: LiveJob[]) =>
            jobs.map(j => j.jobId === jobId ? { ...j, isSaved: nowSaved } : j);
        setRecommendedJobs(prev => updateSaved(prev));
        setAllJobs(prev => updateSaved(prev));
        if (!nowSaved) setSavedJobs(prev => prev.filter(j => j.jobId !== jobId));
    }, []);

    const handleApplied = useCallback((jobId: string) => {
        const markApplied = (jobs: LiveJob[]) =>
            jobs.map(j => j.jobId === jobId ? { ...j, hasApplied: true } : j);
        setRecommendedJobs(prev => markApplied(prev));
        setAllJobs(prev => markApplied(prev));
        setSavedJobs(prev => markApplied(prev));
        // Re-fetch applications
        getApplications().then(setApplications).catch(() => { });
    }, []);

    const filterJobs = (jobs: LiveJob[]) => {
        let filtered = jobs;
        if (selectedCareer) {
            filtered = filtered.filter(j => j.careerMatches.includes(selectedCareer));
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
    };

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
        whiteSpace: 'nowrap',
    });

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
        @media (max-width: 680px) { .jobs-grid { grid-template-columns: 1fr; } }
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

            {/* ─── Career Match Tabs ────────────────────────────────── */}
            {careers.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '18px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        🎯 Your Career Matches
                    </p>
                    <div className="career-tabs-scroll">
                        <button
                            onClick={() => setSelectedCareer(null)}
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
                                onClick={() => setSelectedCareer(selectedCareer === career ? null : career)}
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

            {/* ─── Main Nav Tabs ────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button style={tabStyle('recommended')} onClick={() => setActiveTab('recommended')}>🔥 Best Matches</button>
                <button style={tabStyle('all')} onClick={() => setActiveTab('all')}>🔎 All Jobs</button>
                <button style={tabStyle('saved')} onClick={() => setActiveTab('saved')}>♥ Saved Jobs</button>
                <button style={tabStyle('applications')} onClick={() => setActiveTab('applications')}>📋 My Applications</button>
            </div>

            {/* ─── Content ─────────────────────────────────────────── */}

            {activeTab !== 'applications' && (
                /* Search + Filters */
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search jobs..."
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

            {/* ─── Recommended / Best Matches ──── */}
            {activeTab === 'recommended' && (
                <div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                        🔥 Sorted by your personal match score
                    </p>
                    {loading ? (
                        <div className="jobs-grid">
                            {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
                        </div>
                    ) : error ? (
                        <EmptyState
                            icon="📡"
                            title="Live job data is temporarily unavailable."
                            subtitle="Please try again later."
                        />
                    ) : filterJobs(recommendedJobs).length === 0 ? (
                        recommendedJobs.length === 0 ? (
                            <EmptyState
                                icon="🎯"
                                title="No recommendations yet."
                                subtitle="Complete your Career Recommendation profile to receive personalized job matches."
                            />
                        ) : (
                            <EmptyState icon="🔍" title="No jobs found for current filters." subtitle="Try adjusting your search or career selection." />
                        )
                    ) : (
                        <>
                            {filterJobs(recommendedJobs).slice(0, 3).length > 0 && (
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
                                {filterJobs(recommendedJobs).slice(3).map(job => (
                                    <JobCard key={job.jobId} job={job} onSaveToggle={handleSaveToggle} onApplied={handleApplied} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ─── All Jobs ──── */}
            {activeTab === 'all' && (
                <div>
                    {allJobs.length === 0 && !loading ? (
                        <div className="jobs-grid">
                            {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
                        </div>
                    ) : filterJobs(allJobs).length === 0 ? (
                        <EmptyState icon="🔍" title="No live opportunities found for this career right now." subtitle="Check back later or try a different search." />
                    ) : (
                        <div className="jobs-grid">
                            {filterJobs(allJobs).map(job => (
                                <JobCard key={job.jobId} job={job} onSaveToggle={handleSaveToggle} onApplied={handleApplied} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ─── Saved Jobs ──── */}
            {activeTab === 'saved' && (
                <div>
                    {savedJobs.length === 0 ? (
                        <EmptyState icon="♥" title="You haven't saved any jobs yet." subtitle="Save jobs to revisit them later — click ♡ on any job card." />
                    ) : filterJobs(savedJobs).length === 0 ? (
                        <EmptyState icon="🔍" title="No saved jobs match your filters." subtitle="Clear your search to see all saved jobs." />
                    ) : (
                        <div className="jobs-grid">
                            {filterJobs(savedJobs).map(job => (
                                <JobCard key={job.jobId} job={job} onSaveToggle={handleSaveToggle} onApplied={handleApplied} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ─── Application Tracker ──── */}
            {activeTab === 'applications' && (
                <ApplicationTracker applications={applications} onStatusUpdate={(id, status) => {
                    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
                    updateApplication(id, status).catch(() => { });
                }} />
            )}

            {/* ─── Explore More Opportunities ────────────────────────── */}
            <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
                <p style={{ color: '#6366f1', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
                    🌐 Explore More Opportunities
                </p>
                <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '13px' }}>
                    Search your recommended career on popular platforms.{' '}
                    <span style={{ color: '#475569', fontSize: '12px' }}>
                        (CareerNova does not scrape or claim data from these platforms)
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

// ─── Sub-components ──────────────────────────────────────────────

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>{icon}</div>
            <p style={{ color: '#94a3b8', margin: '0 0 6px', fontWeight: 500 }}>{title}</p>
            {subtitle && <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>{subtitle}</p>}
        </div>
    );
}

function ApplicationTracker({ applications, onStatusUpdate }: {
    applications: JobApplication[];
    onStatusUpdate: (id: string, status: ApplicationStatus) => void;
}) {
    if (applications.length === 0) {
        return <EmptyState icon="📋" title="You haven't tracked any applications yet." subtitle="Click 'Mark as Applied' on any job card to start tracking." />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {applications.map(app => (
                <div key={app.id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#f1f5f9', fontSize: '14px' }}>{app.job.title}</p>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                            {app.job.company} {app.job.location && `• ${app.job.location}`} • Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Status badge */}
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: statusColors[app.status]?.bg ?? 'rgba(255,255,255,0.08)',
                            color: statusColors[app.status]?.text ?? '#94a3b8',
                            border: `1px solid ${statusColors[app.status]?.border ?? 'transparent'}`,
                        }}>
                            {app.status}
                        </span>
                        {/* Update status */}
                        <select
                            value={app.status}
                            onChange={e => onStatusUpdate(app.id, e.target.value as ApplicationStatus)}
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
                        {/* External link */}
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
                            }}
                        >
                            View →
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default LiveJobs;
