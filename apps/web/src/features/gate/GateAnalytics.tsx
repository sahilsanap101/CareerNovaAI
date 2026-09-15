import { useState, useEffect } from 'react';
import { gateApi, GateAnalyticsResponse, GateProfile } from './api';
import { Loader } from '@/components/ui/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Target, Clock, Calendar, CheckCircle2, AlertCircle, RefreshCw, BarChart2, Library, BookOpen, Clock3 } from 'lucide-react';

export function GateAnalytics() {
    const [data, setData] = useState<GateAnalyticsResponse | null>(null);
    const [profile, setProfile] = useState<GateProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [p, d] = await Promise.all([
                    gateApi.getProfile(),
                    gateApi.getGateAnalytics()
                ]);
                setProfile(p);
                setData(d);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader /></div>;
    }

    if (!data || !profile) {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Preparation Analytics</h2>
                <p className="text-muted-foreground p-6 border border-dashed rounded-lg bg-secondary/20">
                    Your preparation analytics will build as you record study activity, practice attempts, revisions, and mock results. Start recording activity to see your preparation analytics.
                </p>
            </div>
        );
    }

    const { overview, studyActivity, topicProgress, practicePerformance, mistakes, revisions, mocks, recentActivity } = data;

    const noDataYet = (
        <span className="text-muted-foreground text-sm font-normal italic ml-2">No data recorded</span>
    );

    const formatMins = (mins: number) => {
        if (!mins) return '0h 0m';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Preparation Analytics</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    A comprehensive, purely descriptive overview of your recorded GATE preparation activity without predictive assumptions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 border rounded-xl bg-card shadow-sm border-l-4 border-l-blue-500">
                    <p className="text-sm font-medium text-slate-500">Target GATE Year</p>
                    <p className="text-2xl font-bold">{profile.gateYear} ({profile.paper})</p>
                </div>
                <div className="p-5 border rounded-xl bg-card shadow-sm border-l-4 border-l-green-500">
                    <p className="text-sm font-medium text-slate-500">Topics Completed</p>
                    <p className="text-2xl font-bold">{topicProgress.totalTopics > 0 ? `${topicProgress.completedTopics} / ${topicProgress.totalTopics}` : noDataYet}</p>
                </div>
                <div className="p-5 border rounded-xl bg-card shadow-sm border-l-4 border-l-purple-500">
                    <p className="text-sm font-medium text-slate-500">Total Practice/PYQ/Mocks</p>
                    <p className="text-2xl font-bold">{practicePerformance.total}</p>
                </div>
                <div className="p-5 border rounded-xl bg-card shadow-sm border-l-4 border-l-orange-500">
                    <p className="text-sm font-medium text-slate-500">Open Mistakes / Revisions</p>
                    <p className="text-2xl font-bold">{mistakes.open} <span className="text-lg text-slate-400 font-normal">/</span> {revisions.pending}</p>
                </div>
            </div>

            {/* SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* STUDY ACTIVITY */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><Clock className="w-5 h-5 text-accent-500" /> Study Activity (This Week)</h3>
                    <div className="p-5 border rounded-xl bg-card">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-slate-500">Weekly Target</p>
                                <p className="font-semibold">{overview.targetWeeklyMinutes ? formatMins(overview.targetWeeklyMinutes) : 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Sessions</p>
                                <p className="font-semibold">{studyActivity.thisWeekSessionsCount} recorded this week</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Planned this week</p>
                                <p className="font-semibold">{formatMins(studyActivity.plannedThisWeekMinutes)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Completed this week</p>
                                <p className="font-semibold text-green-600">{formatMins(studyActivity.thisWeekMinutes)}</p>
                            </div>
                        </div>
                        <p className="text-sm border-t pt-3 text-muted-foreground bg-secondary/10 px-3 py-2 rounded-md">
                            You have recorded {formatMins(studyActivity.thisWeekMinutes)} against your {overview.targetWeeklyMinutes ? formatMins(overview.targetWeeklyMinutes) : 'N/A'} weekly target.
                        </p>
                    </div>
                </div>

                {/* TOPIC PROGRESS */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Topic Progress</h3>
                    <div className="p-5 border rounded-xl bg-card">
                        {topicProgress.totalTopics > 0 ? (
                            <>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-3xl font-bold">{topicProgress.topicProgressPercent.toFixed(1)}%</span>
                                    <span className="text-sm text-slate-500">of tracked topics marked completed</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
                                    <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${topicProgress.topicProgressPercent}%` }}></div>
                                </div>
                                <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                                    <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> {topicProgress.completedTopics} Completed</div>
                                    <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-blue-400"></span> {topicProgress.learningTopics} Learning</div>
                                    <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-orange-400"></span> {topicProgress.revisionTopics} Needs Revision</div>
                                    <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-slate-300"></span> {topicProgress.notStartedTopics} Not Started</div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">{noDataYet}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PRACTICE PERFORMANCE */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><BarChart2 className="w-5 h-5 text-blue-500" /> Practice Performance (Accuracy)</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 border rounded-xl bg-card text-center">
                            <p className="text-xs text-slate-500">PYQ Accuracy</p>
                            <p className="text-xl font-bold mt-1 text-slate-700">{practicePerformance.accuracyPyq !== null ? `${practicePerformance.accuracyPyq.toFixed(1)}%` : '-'}</p>
                            <p className="text-xs text-slate-400">{practicePerformance.pyq} attempts</p>
                        </div>
                        <div className="p-4 border rounded-xl bg-card text-center">
                            <p className="text-xs text-slate-500">Practice Acc.</p>
                            <p className="text-xl font-bold mt-1 text-slate-700">{practicePerformance.accuracyPractice !== null ? `${practicePerformance.accuracyPractice.toFixed(1)}%` : '-'}</p>
                            <p className="text-xs text-slate-400">{practicePerformance.practice} attempts</p>
                        </div>
                        <div className="p-4 border rounded-xl bg-card text-center">
                            <p className="text-xs text-slate-500">Mock Acc.</p>
                            <p className="text-xl font-bold mt-1 text-slate-700">{practicePerformance.accuracyMock !== null ? `${practicePerformance.accuracyMock.toFixed(1)}%` : '-'}</p>
                            <p className="text-xs text-slate-400">{practicePerformance.mock} attempts</p>
                        </div>
                    </div>
                </div>

                {/* MOCK OVERVIEW */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><Target className="w-5 h-5 text-red-500" /> Mock Test Overview</h3>
                    <div className="p-4 border rounded-xl bg-card grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-slate-500">Total Attempts</p>
                            <p className="text-xl font-bold">{mocks.totalAttempts || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Latest Marks</p>
                            <p className="text-xl font-bold">{mocks.latestMarks !== null ? mocks.latestMarks.toFixed(1) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Best Marks</p>
                            <p className="text-xl font-bold text-green-600">{mocks.bestMarks !== null ? mocks.bestMarks.toFixed(1) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Average Marks</p>
                            <p className="text-xl font-bold">{mocks.averageMarks !== null ? mocks.averageMarks.toFixed(1) : '-'}</p>
                        </div>
                    </div>
                    {mocks.totalAttempts > 0 ? (
                        <p className="text-xs text-slate-500 italic block">
                            * Note: Marks reflect recorded scores natively. They are descriptive indicators of past mock performances explicitly tracked inside your Mock tab. They are not extrapolated AIR predictions.
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 italic block">No recorded mock marks available for analysis.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* MISTAKE OVERVIEW */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><AlertCircle className="w-5 h-5 text-orange-500" /> Mistake Categories Overview</h3>
                    <div className="p-5 border rounded-xl bg-card">
                        {mistakes.total > 0 ? (
                            <div className="space-y-3">
                                <div className="flex gap-4 mb-4 text-sm font-medium border-b pb-2">
                                    <span className="text-red-500">{mistakes.open} Open</span>
                                    <span className="text-orange-500">{mistakes.needsRevision} Needs Revision</span>
                                    <span className="text-green-500">{mistakes.resolved} Resolved</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {Object.entries(mistakes.byCategory).map(([cat, count]) => (
                                        <div key={cat} className="flex justify-between items-center bg-slate-50 p-2 rounded-md">
                                            <span className="capitalize">{cat.replace('_', ' ').toLowerCase()}</span>
                                            <span className="font-semibold bg-slate-200 px-2 rounded-full text-xs">{count}</span>
                                        </div>
                                    ))}
                                </div>
                                {mistakes.total > 3 && <p className="text-xs text-muted-foreground italic mt-3 pt-3 border-t">Most recorded mistakes classify under categorized tags chronologically above.</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">{noDataYet}</p>
                        )}
                    </div>
                </div>

                {/* REVISION HUB OVERVIEW */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><Library className="w-5 h-5 text-teal-500" /> Revision Overview</h3>
                    <div className="p-5 border rounded-xl bg-card text-center">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-3xl font-bold text-red-500">{revisions.overdue}</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Overdue</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-orange-500">{revisions.dueToday}</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Due Today</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-blue-500">{revisions.upcoming}</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Upcoming</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-green-500">{revisions.completed}</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2"><RefreshCw className="w-5 h-5 text-slate-600" /> Recent Activity Log</h3>
                <div className="border rounded-xl bg-card overflow-hidden">
                    {recentActivity.length > 0 ? (
                        <div className="divide-y text-sm">
                            {recentActivity.map((r, i) => (
                                <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {r.type === 'Session' && <Clock3 className="w-4 h-4 text-blue-500" />}
                                        {r.type === 'Practice' && <Target className="w-4 h-4 text-indigo-500" />}
                                        {r.type === 'Mistake' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                        {r.type === 'Revision' && <Library className="w-4 h-4 text-teal-500" />}
                                        <div>
                                            <span className="font-semibold text-xs text-slate-500 block mb-0.5">{r.type}</span>
                                            <span className="font-medium text-slate-700">{r.desc}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                                        {new Date(r.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No recent activity found. Log sessions, attempts, or mistakes to build your timeline.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
