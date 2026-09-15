import { useState, useEffect } from 'react';
import { gateApi, type GateProfileInput, type GateProfile, type GateAnalyticsResponse, type GateReadinessResponse } from './api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Target, Clock, BookOpen, BookX, Calendar, Edit3, Save, BarChart3, Library, LineChart, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GATE_YEARS = [
    { value: 2026, label: '2026' },
    { value: 2027, label: '2027' },
];

const GATE_PAPERS = [
    'CS', 'DA', 'EC', 'EE', 'ME', 'CE', 'IN', 'XE', 'XL', 'BT',
    'CH', 'CY', 'AR', 'AG', 'EY', 'GG', 'MA', 'MN', 'MT', 'PE',
    'PH', 'PI', 'ST', 'XH', 'RA', 'ES', 'GE', 'NM', 'BM'
].map(p => ({ value: p, label: p }));

const PREP_STAGES = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'STARTED', label: 'Started' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'REVISION', label: 'Revision' },
];

export function GateDashboard() {
    const [profile, setProfile] = useState<GateProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<GateProfileInput>({
        gateYear: 2027,
        paper: 'CS',
        targetScore: 75,
        weeklyHours: 20,
        preparationStage: 'STARTED',
        examDate: ''
    });

    const [topicProgress, setTopicProgress] = useState<{ percentComplete: number, completedTopics: number, totalTopics: number } | null>(null);
    const [practiceSummary, setPracticeSummary] = useState<any>(null);
    const [mistakeSummary, setMistakeSummary] = useState<any>(null);
    const [revisionSummary, setRevisionSummary] = useState<any>(null);
    const [mockSummary, setMockSummary] = useState<any>(null);
    const [analyticsData, setAnalyticsData] = useState<GateAnalyticsResponse | null>(null);
    const [readinessData, setReadinessData] = useState<GateReadinessResponse | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await gateApi.getProfile();
            if (data) {
                setProfile(data);
                setFormData({
                    gateYear: data.gateYear,
                    paper: data.paper,
                    targetScore: data.targetScore,
                    weeklyHours: data.weeklyHours,
                    preparationStage: data.preparationStage,
                    examDate: data.examDate ? (data.examDate.split('T')[0] || '') : ''
                });

                try {
                    const progress = await gateApi.getTopicProgress();
                    setTopicProgress(progress);
                } catch { /* ignore if topics fail to load here */ }

                try {
                    const pSummary = await gateApi.getPracticeSummary();
                    setPracticeSummary(pSummary);
                } catch { /* ignore */ }

                try {
                    const mSummary = await gateApi.getMistakeSummary();
                    setMistakeSummary(mSummary);
                } catch { /* ignore */ }

                try {
                    const rSummary = await gateApi.getRevisionSummary();
                    setRevisionSummary(rSummary);
                } catch { /* ignore */ }

                try {
                    const mkSummary = await gateApi.getMockSummary();
                    setMockSummary(mkSummary);
                } catch { /* ignore */ }

                try {
                    const anData = await gateApi.getGateAnalytics();
                    setAnalyticsData(anData);
                } catch { /* ignore */ }

                try {
                    const rdData = await gateApi.getGateReadiness();
                    setReadinessData(rdData);
                } catch { /* ignore */ }
            }
        } catch (err: any) {
            if (err?.response?.status !== 404) {
                setError("We couldn't load your GATE preparation. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchProfile();
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            setLoading(true);
            if (profile) {
                const updated = await gateApi.updateProfile(formData);
                setProfile(updated);
                setIsEditing(false);
                toast.success('GATE profile updated!');
            } else {
                const created = await gateApi.createProfile(formData);
                setProfile(created);
                toast.success('GATE preparation started!');
            }
        } catch (err) {
            toast.error('Failed to save profile.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile && !isEditing) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader />
                <p className="mt-4 text-slate-500">Loading your GATE preparation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <Button className="mt-4" onClick={() => { setError(null); void fetchProfile(); }}>Retry</Button>
            </div>
        );
    }

    // ─── Onboarding / Edit Form ──────────────────────────────────────────────
    if (!profile || isEditing) {
        return (
            <div className="max-w-2xl mx-auto py-8">
                <Card className="p-8 border-t-4 border-t-primary-500">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {profile ? 'Edit Preparation' : 'START YOUR GATE PREPARATION'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {profile
                                ? 'Update your GATE preparation goals and schedule.'
                                : 'Build your personalized GATE preparation workspace in CareerNova.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="GATE Year"
                                value={formData.gateYear}
                                onChange={(e) => setFormData({ ...formData, gateYear: parseInt(e.target.value, 10) })}
                                options={GATE_YEARS}
                                required
                            />
                            <Select
                                label="Paper"
                                value={formData.paper}
                                onChange={(e) => setFormData({ ...formData, paper: e.target.value })}
                                options={GATE_PAPERS}
                                required
                            />
                            <Input
                                label="Target Score"
                                type="number"
                                min={0}
                                max={100}
                                value={formData.targetScore}
                                onChange={(e) => setFormData({ ...formData, targetScore: parseInt(e.target.value, 10) || 0 })}
                                required
                            />
                            <Input
                                label="Weekly Study Hours"
                                type="number"
                                min={1}
                                max={168}
                                value={formData.weeklyHours}
                                onChange={(e) => setFormData({ ...formData, weeklyHours: parseInt(e.target.value, 10) || 0 })}
                                required
                            />
                            <Select
                                label="Preparation Stage"
                                value={formData.preparationStage}
                                onChange={(e) => setFormData({ ...formData, preparationStage: e.target.value })}
                                options={PREP_STAGES}
                                required
                            />
                            <Input
                                label="Exam Date (Optional)"
                                type="date"
                                value={formData.examDate || ''}
                                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            {profile && (
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            )}
                            <Button type="submit" className="flex-1 shrink-0" disabled={loading}>
                                {loading ? <Loader /> : profile ? 'Save Changes' : 'Start Preparation'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    }

    // ─── Dashboard Dashboard ──────────────────────────────────────────────────
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                        GATE {profile.gateYear} - {profile.paper}
                    </h1>
                    <p className="text-slate-500 mt-1 dark:text-slate-400">
                        Preparation Stage: {PREP_STAGES.find(s => s.value === profile.preparationStage)?.label || profile.preparationStage}
                    </p>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Preparation
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 flex items-center gap-4 border-l-4 border-l-primary-500">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 h-[1.8rem]">Target Score</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{profile.targetScore}</p>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4 border-l-4 border-l-accent-500">
                    <div className="p-3 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-lg">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 h-[1.8rem]">Weekly Goal</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{profile.weeklyHours} hours</p>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4 border-l-4 border-l-teal-500">
                    <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 h-[1.8rem]">Exam Date</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {profile.examDate ? new Date(profile.examDate).toLocaleDateString() : 'Not set'}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Future Sections Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <Card className="p-6 h-[200px] flex flex-col justify-center items-center text-center border">
                    <BookOpen className="w-10 h-10 text-primary-500 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Syllabus Progress</h3>
                    {topicProgress && topicProgress.totalTopics > 0 ? (
                        <div className="mt-2 w-full max-w-sm">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-600 dark:text-slate-300">Completed</span>
                                <span className="font-bold text-slate-800 dark:text-slate-100">{topicProgress.percentComplete}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${topicProgress.percentComplete}%` }}></div>
                            </div>
                            <p className="text-slate-500 text-xs mt-2">{topicProgress.completedTopics} out of {topicProgress.totalTopics} personal topics completed.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm mb-4">No topics tracked yet.</p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/syllabus'}>Track Topics</Button>
                        </>
                    )}
                </Card>

                <Card className="p-6 h-[200px] flex flex-col justify-center items-center text-center border">
                    <Calendar className="w-10 h-10 text-primary-500 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Weekly Study Plan</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-sm mb-4">Set up and track your weekly study targets and granular subject tasks.</p>
                    <Button size="sm" onClick={() => window.location.href = '/gate/planner'}>Open Planner</Button>
                </Card>

                <Card className="p-6 h-[200px] flex flex-col justify-center items-center text-center border">
                    <Clock className="w-10 h-10 text-primary-500 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Study Sessions</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-sm mb-4">Track actual time spent studying compared to your weekly target.</p>
                    <Button size="sm" onClick={() => window.location.href = '/gate/study'}>Track Study Time</Button>
                </Card>

                <Card className="p-6 h-[200px] flex flex-col justify-center items-center text-center border">
                    <BarChart3 className="w-10 h-10 text-primary-500 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Practice Performance</h3>
                    {practiceSummary && practiceSummary.totalAttempts > 0 ? (
                        <>
                            <p className="text-slate-600 font-semibold mb-2 text-sm">
                                {practiceSummary.totalAttempts} attempts · {practiceSummary.questionsAttempted} qs · {practiceSummary.overallAccuracy?.toFixed(1) || 0}% Acc
                            </p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/attempts'}>View Attempts</Button>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm mb-4">No attempts recorded yet.</p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/attempts'}>Record Attempt</Button>
                        </>
                    )}
                </Card>

                <Card className="p-6 h-[200px] flex flex-col justify-center items-center text-center border overflow-hidden group">
                    <LineChart className="w-10 h-10 text-primary-500 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Preparation Analytics</h3>
                    {analyticsData && (analyticsData.studyActivity.thisWeekSessionsCount > 0 || analyticsData.topicProgress.totalTopics > 0) ? (
                        <>
                            <p className="text-slate-600 font-semibold mb-2 text-sm mt-2">
                                {analyticsData.studyActivity.thisWeekMinutes > 0 ? `${Math.floor(analyticsData.studyActivity.thisWeekMinutes / 60)}h ${analyticsData.studyActivity.thisWeekMinutes % 60}m studied this week` : '0m studied this week'}
                            </p>
                            <p className="text-slate-500 text-xs mb-3">
                                {analyticsData.topicProgress.topicProgressPercent.toFixed(0)}% tracked topics completed
                            </p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/analytics'}>View Analytics</Button>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm mb-4">Start recording activity to see your preparation analytics.</p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/analytics'}>View Analytics</Button>
                        </>
                    )}
                </Card>

                <Card className="p-6 h-[200px] flex flex-col justify-center items-center text-center border overflow-hidden group">
                    <Activity className="w-10 h-10 text-primary-500 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Preparation Readiness</h3>
                    {readinessData && readinessData.overallScore !== null ? (
                        <>
                            <div className="flex items-end gap-1 justify-center mt-2 mb-1 text-slate-700 dark:text-slate-200 font-bold">
                                <span className="text-2xl leading-none text-primary-600 dark:text-primary-400">{Math.round(readinessData.overallScore)}</span>
                                <span className="text-sm font-semibold">/ 100</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3 font-medium capitalize">{readinessData.overallStatus}</p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/readiness'}>View Assessment</Button>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm mb-4">Building profile. Record more preparation activity to see your assessment.</p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/readiness'}>View Assessment</Button>
                        </>
                    )}
                </Card>

                <Card className="p-6 h-[200px] flex flex-col justify-center items-center text-center border">
                    <BookX className="w-10 h-10 text-red-500 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Mistakes to Review</h3>
                    {mistakeSummary && (mistakeSummary.open > 0 || mistakeSummary.needsRevision > 0) ? (
                        <>
                            <div className="flex gap-4 mt-2 mb-4 justify-center">
                                <span className="text-sm font-semibold text-red-600">{mistakeSummary.open} Open</span>
                                <span className="text-sm font-semibold text-orange-600">{mistakeSummary.needsRevision} Need Revision</span>
                            </div>
                            <Button size="sm" onClick={() => window.location.href = '/gate/mistakes'}>View Mistakes</Button>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm mb-4">No open mistakes demanding your attention currently.</p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/mistakes'}>Mistake Log</Button>
                        </>
                    )}
                </Card>

                <Card className="p-6 h-[200px] flex flex-col justify-center items-center text-center border">
                    <Library className="w-10 h-10 text-indigo-500 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Revision Hub</h3>
                    {revisionSummary && (revisionSummary.dueToday > 0 || revisionSummary.overdue > 0) ? (
                        <>
                            <div className="flex gap-4 mt-2 mb-4 justify-center">
                                {revisionSummary.overdue > 0 && <span className="text-sm font-bold text-red-600">{revisionSummary.overdue} Overdue</span>}
                                {revisionSummary.dueToday > 0 && <span className="text-sm font-semibold text-orange-500">{revisionSummary.dueToday} Due Today</span>}
                            </div>
                            <Button size="sm" onClick={() => window.location.href = '/gate/revisions'}>View Revisions</Button>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm mb-4">No revisions due today. Stay ahead!</p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/revisions'}>Manage Revisions</Button>
                        </>
                    )}
                </Card>

                <Card className="p-6 h-[200px] flex flex-col justify-center items-center text-center border relative overflow-hidden group">
                    <Target className="w-10 h-10 text-primary-500 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Mock Performance</h3>
                    {mockSummary && mockSummary.totalAttempts > 0 ? (
                        <>
                            <p className="text-slate-500 text-sm mt-1">{mockSummary.totalAttempts} Attempts</p>
                            <p className="text-slate-700 dark:text-slate-300 font-medium text-sm mt-2">
                                Best: {mockSummary.bestMarks !== null ? mockSummary.bestMarks.toFixed(1) : '-'} marks
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                                Latest: {mockSummary.latestMarks !== null ? mockSummary.latestMarks.toFixed(1) : '-'} marks
                            </p>
                            <Button size="sm" variant="ghost" className="mt-2 absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => window.location.href = '/gate/mocks'}>View Details</Button>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm mb-4">No mock attempts yet. Record your first mock result to start tracking performance.</p>
                            <Button size="sm" onClick={() => window.location.href = '/gate/mocks'}>Record Mock</Button>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
