import React, { useState } from 'react';
import type { LiveJob, ApplicationStatus } from './types';
import { saveJob, unsaveJob, createApplication, updateApplication } from './api';

interface JobCardProps {
    job: LiveJob;
    applicationId?: string; // if already tracked
    onSaveToggle?: (jobId: string, nowSaved: boolean) => void;
    onApplied?: (jobId: string) => void;
}

const scoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    return '#6b7280'; // gray
};

const statusColors: Record<ApplicationStatus, string> = {
    SAVED: '#6366f1',
    APPLIED: '#3b82f6',
    ASSESSMENT: '#8b5cf6',
    INTERVIEW: '#f59e0b',
    OFFER: '#10b981',
    REJECTED: '#ef4444',
};

const JobCard: React.FC<JobCardProps> = ({ job, applicationId, onSaveToggle, onApplied }) => {
    const [isSaved, setIsSaved] = useState(job.isSaved);
    const [hasApplied, setHasApplied] = useState(job.hasApplied);
    const [savingToggle, setSavingToggle] = useState(false);
    const [markingApplied, setMarkingApplied] = useState(false);
    const [appId, setAppId] = useState(applicationId);

    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (savingToggle) return;
        setSavingToggle(true);
        try {
            if (isSaved) {
                await unsaveJob(job.jobId);
                setIsSaved(false);
                onSaveToggle?.(job.jobId, false);
            } else {
                await saveJob(job.jobId);
                setIsSaved(true);
                onSaveToggle?.(job.jobId, true);
            }
        } catch {
            // silent fail — user sees no change
        } finally {
            setSavingToggle(false);
        }
    };

    const handleMarkApplied = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (markingApplied || hasApplied) return;
        setMarkingApplied(true);
        try {
            if (appId) {
                await updateApplication(appId, 'APPLIED');
            } else {
                const app = await createApplication(job.jobId);
                setAppId(app.id);
            }
            setHasApplied(true);
            onApplied?.(job.jobId);
        } catch {
            // silent fail
        } finally {
            setMarkingApplied(false);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
        }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(99,102,241,0.4)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(99,102,241,0.15)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.09)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
        >
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3, marginBottom: '4px' }}>
                        {job.title}
                    </h3>
                    {job.company && (
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{job.company}</span>
                    )}
                </div>
                {/* Match Score Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: `${scoreColor(job.matchScore)}22`,
                    border: `1px solid ${scoreColor(job.matchScore)}55`,
                    borderRadius: '20px',
                    padding: '4px 10px',
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: '14px' }}>🎯</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: scoreColor(job.matchScore) }}>
                        {job.matchScore}%
                    </span>
                </div>
            </div>

            {/* Meta Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {job.location && (
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        📍 {job.location}
                    </span>
                )}
                {job.type && (
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        💼 {job.type}
                    </span>
                )}
                {job.salary ? (
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        💰 {job.salary}
                    </span>
                ) : (
                    <span style={{ fontSize: '12px', color: '#475569' }}>Salary not disclosed</span>
                )}
            </div>

            {/* Career Match Tag */}
            {job.careerMatches.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {job.careerMatches.slice(0, 2).map(career => (
                        <span key={career} style={{
                            fontSize: '11px',
                            background: 'rgba(99,102,241,0.15)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99,102,241,0.3)',
                            borderRadius: '20px',
                            padding: '2px 8px',
                        }}>
                            {career}
                        </span>
                    ))}
                </div>
            )}

            {/* Snippet */}
            {job.snippet && (
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.snippet}
                </p>
            )}

            {/* Skill Match / Gap */}
            {(job.matchedSkills.length > 0 || job.gapSkills.length > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {job.matchedSkills.slice(0, 4).map(skill => (
                        <span key={skill} style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            ✓ {skill}
                        </span>
                    ))}
                    {job.gapSkills.slice(0, 3).map(skill => (
                        <span key={skill} style={{ fontSize: '11px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            ⚠ {skill}
                        </span>
                    ))}
                </div>
            )}

            {/* Applied Status Badge */}
            {hasApplied && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: statusColors['APPLIED'],
                    background: `${statusColors['APPLIED']}18`,
                    border: `1px solid ${statusColors['APPLIED']}44`,
                    borderRadius: '8px',
                    padding: '6px 10px',
                }}>
                    ✓ Marked as Applied
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {/* Save Button */}
                <button onClick={handleSaveToggle} disabled={savingToggle} style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${isSaved ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`,
                    background: isSaved ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                    color: isSaved ? '#f87171' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                }}>
                    {isSaved ? '♥ Saved' : '♡ Save'}
                </button>

                {/* Apply Now External Link */}
                <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                        // After opening, show "Mark as Applied" — but don't auto-mark
                        // The mark button is always visible; user decides
                    }}
                    style={{
                        flex: 2,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                    Apply Now →
                </a>
            </div>

            {/* Mark as Applied — Explicit student action only */}
            {!hasApplied && (
                <button onClick={handleMarkApplied} disabled={markingApplied} style={{
                    width: '100%',
                    padding: '7px',
                    borderRadius: '8px',
                    border: '1px dashed rgba(99,102,241,0.35)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '11px',
                    cursor: markingApplied ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.6)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#a5b4fc';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.35)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                    }}
                >
                    {markingApplied ? 'Tracking...' : '✓ Mark as Applied'}
                </button>
            )}
        </div>
    );
};

export default JobCard;
