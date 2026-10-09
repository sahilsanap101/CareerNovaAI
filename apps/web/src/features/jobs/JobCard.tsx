/**
 * JobCard.tsx — Live Jobs Job Card Component
 *
 * APPLY FLOW:
 *   "Apply Now" opens the external provider job URL in a new tab.
 *   CareerNova does NOT submit applications on the user's behalf.
 *   CareerNova does NOT automatically create an application record
 *   when "Apply Now" is clicked.
 *
 *   After applying externally, the user must explicitly click
 *   "Track This Application" to record the attempt, then select
 *   their current status (APPLIED, ASSESSMENT, INTERVIEW, OFFER, REJECTED).
 *
 *   Save (♡) is independent from application status.
 *
 * ERROR HANDLING:
 *   Errors are caught silently or shown as friendly messages.
 *   No stack traces, DB errors, API keys, or internal URLs are shown.
 */

import React, { useState } from 'react';
import type { LiveJob, ApplicationStatus } from './types';
import { saveJob, unsaveJob, createApplication, updateApplication } from './api';

interface JobCardProps {
    job: LiveJob;
    applicationId?: string;
    onSaveToggle?: (jobId: string, nowSaved: boolean) => void;
    onApplied?: (jobId: string) => void;
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

const scoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#6b7280';
};

const confidenceColor = (c: string) => {
    if (c === 'HIGH')   return { text: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' };
    if (c === 'MEDIUM') return { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' };
    return                     { text: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)' };
};

const locationStatusColor = (status: string) => {
    if (status === 'MATCHED')  return '#10b981';
    if (status === 'PARTIAL')  return '#f59e0b';
    if (status === 'MISMATCH') return '#ef4444';
    return '#475569';
};

const statusColors: Record<ApplicationStatus, string> = {
    SAVED:      '#6366f1',
    APPLIED:    '#3b82f6',
    ASSESSMENT: '#8b5cf6',
    INTERVIEW:  '#f59e0b',
    OFFER:      '#10b981',
    REJECTED:   '#ef4444',
};

const ALL_STATUSES: ApplicationStatus[] = ['APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED'];

// ─── Component ───────────────────────────────────────────────────────────────

const JobCard: React.FC<JobCardProps> = ({ job, applicationId, onSaveToggle, onApplied }) => {
    const [isSaved, setIsSaved] = useState(job.isSaved);
    const [hasApplied, setHasApplied] = useState(job.hasApplied);
    const [savingToggle, setSavingToggle] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Application tracking panel state
    const [trackingOpen, setTrackingOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(
        job.applicationStatus || 'APPLIED',
    );
    const [notes, setNotes] = useState(job.applicationNotes || '');
    const [submittingTrack, setSubmittingTrack] = useState(false);
    const [trackError, setTrackError] = useState<string | null>(null);
    const [appId, setAppId] = useState(job.applicationId || applicationId);

    // Match detail panel
    const [showDetails, setShowDetails] = useState(false);

    const conf = confidenceColor(job.confidence ?? 'LOW');
    const gaps = (job.skillGaps?.length ? job.skillGaps : job.gapSkills) ?? [];

    // ─── Save / unsave ────────────────────────────────────────────────────────

    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (savingToggle) return;
        setSavingToggle(true);
        setSaveError(null);
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
            setSaveError('Could not save — please try again.');
        } finally {
            setSavingToggle(false);
        }
    };

    // ─── Track application ────────────────────────────────────────────────────
    // The user EXPLICITLY creates or updates the application record.
    // This is NEVER triggered automatically by clicking "Apply Now".

    const handleTrackSubmit = async () => {
        if (submittingTrack) return;
        setSubmittingTrack(true);
        setTrackError(null);
        try {
            if (appId) {
                await updateApplication(appId, selectedStatus, notes || undefined);
            } else {
                const created = await createApplication(job.jobId, selectedStatus, notes || undefined);
                setAppId(created.id);
            }
            setHasApplied(true);
            setTrackingOpen(false);
            onApplied?.(job.jobId);
        } catch {
            // Friendly message — no technical details exposed
            setTrackError('Could not save your application. Please try again.');
        } finally {
            setSubmittingTrack(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

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
            {/* ── Stale / inactive warning ──────────────────────────── */}
            {!job.isActive && (
                <div style={{
                    fontSize: '11px',
                    color: '#f59e0b',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                }}>
                    ⚠ This listing may be outdated
                </div>
            )}

            {/* ── Header: Title + Match Score ──────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3, marginBottom: '4px' }}>
                        {job.title}
                    </h3>
                    {job.company && (
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{job.company}</span>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: `${scoreColor(job.matchScore)}22`,
                        border: `1px solid ${scoreColor(job.matchScore)}55`,
                        borderRadius: '20px', padding: '4px 10px',
                    }}>
                        <span style={{ fontSize: '13px' }}>🎯</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: scoreColor(job.matchScore) }}>
                            {job.matchScore}%
                        </span>
                    </div>
                    {job.confidence && (
                        <span style={{
                            fontSize: '10px', fontWeight: 600, color: conf.text,
                            background: conf.bg, border: `1px solid ${conf.border}`,
                            borderRadius: '10px', padding: '1px 7px', letterSpacing: '0.04em',
                        }}>
                            {job.confidence}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Recommended Career ───────────────────────────────── */}
            {job.recommendedCareer && (
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'rgba(99,102,241,0.13)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '8px', padding: '4px 10px', width: 'fit-content',
                }}>
                    <span style={{ fontSize: '11px' }}>✦</span>
                    <span style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>
                        {job.recommendedCareer}
                    </span>
                </div>
            )}

            {/* ── Meta: Location, Type, Salary ─────────────────────── */}
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
                {job.locationMatch && job.locationMatch.status !== 'UNAVAILABLE' && (
                    <span style={{ fontSize: '11px', color: locationStatusColor(job.locationMatch.status) }}>
                        {job.locationMatch.status === 'MATCHED' ? '✓ Location match' :
                            job.locationMatch.status === 'PARTIAL' ? '~ Partial location' : '✗ Location mismatch'}
                    </span>
                )}
            </div>

            {/* ── Snippet ──────────────────────────────────────────── */}
            {job.snippet && (
                <p style={{
                    margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {job.snippet}
                </p>
            )}

            {/* ── Explanation ──────────────────────────────────────── */}
            {job.explanation && (
                <p style={{
                    margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.55, fontStyle: 'italic',
                    borderLeft: '2px solid rgba(99,102,241,0.35)', paddingLeft: '10px',
                }}>
                    {job.explanation}
                </p>
            )}

            {/* ── Matched Skills + Gaps ─────────────────────────────── */}
            {(job.matchedSkills.length > 0 || gaps.length > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {job.matchedSkills.slice(0, 5).map(skill => (
                        <span key={skill} style={{
                            fontSize: '11px', color: '#10b981',
                            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: '12px', padding: '2px 8px',
                        }}>✓ {skill}</span>
                    ))}
                    {gaps.slice(0, 3).map(skill => (
                        <span key={skill} style={{
                            fontSize: '11px', color: '#f59e0b',
                            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                            borderRadius: '12px', padding: '2px 8px',
                        }}>⚠ {skill}</span>
                    ))}
                </div>
            )}

            {/* ── Match Details Collapsible ─────────────────────────── */}
            {(job.eduExperienceMatch || job.locationMatch) && (
                <div>
                    <button
                        onClick={() => setShowDetails(p => !p)}
                        style={{
                            background: 'none', border: 'none', color: '#475569',
                            fontSize: '11px', cursor: 'pointer', padding: 0,
                            display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                    >
                        {showDetails ? '▲ Hide match details' : '▼ Show match details'}
                    </button>
                    {showDetails && (
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {job.eduExperienceMatch && (
                                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '6px' }}>
                                    <span style={{ color: job.eduExperienceMatch.status === 'MATCHED' ? '#10b981' : '#475569', flexShrink: 0 }}>
                                        {job.eduExperienceMatch.status === 'MATCHED' ? '🎓 ✓' : '🎓 —'}
                                    </span>
                                    <span>{job.eduExperienceMatch.detail}</span>
                                </div>
                            )}
                            {job.locationMatch && (
                                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '6px' }}>
                                    <span style={{ color: locationStatusColor(job.locationMatch.status), flexShrink: 0 }}>📍</span>
                                    <span>{job.locationMatch.detail}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Applied Badge ─────────────────────────────────────── */}
            {hasApplied && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', color: statusColors[selectedStatus] ?? statusColors['APPLIED'],
                    background: `${statusColors[selectedStatus] ?? statusColors['APPLIED']}18`,
                    border: `1px solid ${statusColors[selectedStatus] ?? statusColors['APPLIED']}44`,
                    borderRadius: '8px', padding: '6px 10px',
                }}>
                    ✓ Tracked: {selectedStatus}
                </div>
            )}

            {/* ── Save Error ────────────────────────────────────────── */}
            {saveError && (
                <p style={{ margin: 0, fontSize: '11px', color: '#fca5a5' }}>{saveError}</p>
            )}

            {/* ── Action Row: Save + Apply Now ─────────────────────── */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {/* Save button — independent from application status */}
                <button onClick={handleSaveToggle} disabled={savingToggle} style={{
                    flex: 1, padding: '8px 12px', borderRadius: '8px',
                    border: `1px solid ${isSaved ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}`,
                    background: isSaved ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                    color: isSaved ? '#f87171' : '#94a3b8',
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease',
                }}>
                    {savingToggle ? '…' : isSaved ? '♥ Saved' : '♡ Save'}
                </button>

                {/* Apply Now — opens external URL ONLY. No automatic application record. */}
                <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        flex: 2, padding: '8px 12px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff', fontSize: '12px', fontWeight: 600,
                        textDecoration: 'none', textAlign: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                    Apply Now ↗
                </a>
            </div>

            {/* ── Track Application Panel ───────────────────────────── */}
            {/* This is the ONLY way an application record is created.  */}
            {/* It is an explicit user action, never triggered by Apply. */}
            {!trackingOpen ? (
                <button
                    onClick={() => setTrackingOpen(true)}
                    style={{
                        width: '100%', padding: '7px', borderRadius: '8px',
                        border: '1px dashed rgba(99,102,241,0.35)',
                        background: 'transparent', color: '#94a3b8',
                        fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s',
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
                    📋 {hasApplied ? `Update Tracking (${selectedStatus})` : 'Track This Application'}
                </button>
            ) : (
                <div style={{
                    background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                        Record your progress on this application. CareerNova does not submit applications on your behalf — this is self-reported tracking only.
                    </p>

                    {/* Status picker */}
                    <div>
                        <label style={{ fontSize: '11px', color: '#6366f1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                            Application Status
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {ALL_STATUSES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSelectedStatus(s)}
                                    style={{
                                        padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                                        border: selectedStatus === s ? `1px solid ${statusColors[s]}66` : '1px solid rgba(255,255,255,0.1)',
                                        background: selectedStatus === s ? `${statusColors[s]}18` : 'transparent',
                                        color: selectedStatus === s ? statusColors[s] : '#64748b',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes field */}
                    <div>
                        <label style={{ fontSize: '11px', color: '#6366f1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Interview date, recruiter name, next steps…"
                            rows={2}
                            maxLength={1000}
                            style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.03)', color: '#f1f5f9',
                                fontSize: '12px', resize: 'none', outline: 'none', fontFamily: 'inherit',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {/* Error */}
                    {trackError && (
                        <p style={{ margin: 0, fontSize: '11px', color: '#fca5a5' }}>{trackError}</p>
                    )}

                    {/* Submit + Cancel */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleTrackSubmit}
                            disabled={submittingTrack}
                            style={{
                                flex: 2, padding: '8px', borderRadius: '8px',
                                background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                                color: '#a5b4fc', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            {submittingTrack ? 'Saving…' : 'Save Track'}
                        </button>
                        <button
                            onClick={() => { setTrackingOpen(false); setTrackError(null); }}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px',
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#64748b', fontSize: '12px', cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobCard;
