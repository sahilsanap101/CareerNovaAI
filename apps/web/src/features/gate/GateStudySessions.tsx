import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/ui/Loader';
import { Clock, Calendar, Edit2, Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import { gateApi, GateStudySession, StudySessionSummary, GatePersonalTopic, GateStudyTask, GateStudySessionInput } from './api';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export function GateStudySessions() {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<GateStudySession[]>([]);
    const [summary, setSummary] = useState<StudySessionSummary | null>(null);
    const [plannedMinutes, setPlannedMinutes] = useState(0);
    const [topics, setTopics] = useState<GatePersonalTopic[]>([]);
    const [tasks, setTasks] = useState<GateStudyTask[]>([]);

    // UI states
    const [showForm, setShowForm] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form data
    const [formData, setFormData] = useState<GateStudySessionInput>({
        topicId: '',
        studyTaskId: '',
        startedAt: new Date().toISOString().substring(0, 16),
        durationMinutes: 60,
        sessionType: 'STUDY',
        notes: ''
    });

    const now = new Date();
    const currWeekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
    const currWeekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [fetchedTopics, fetchedTasks, fetchedSessions, fetchedSummary, fetchedWeekly] = await Promise.all([
                gateApi.getTopics().catch(() => []),
                gateApi.getStudyTasks(currWeekStart, currWeekEnd).catch(() => []),
                gateApi.getStudySessions(currWeekStart, currWeekEnd).catch(() => []),
                gateApi.getStudySessionSummary(currWeekStart, currWeekEnd).catch(() => null),
                gateApi.getWeeklySummary(currWeekStart, currWeekEnd).catch(() => null),
            ]);

            setTopics(fetchedTopics);
            setTasks(fetchedTasks);
            setSessions(fetchedSessions);
            setSummary(fetchedSummary);
            setPlannedMinutes(fetchedWeekly?.plannedMinutes || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: GateStudySessionInput = {
                ...formData,
                topicId: formData.topicId || null,
                studyTaskId: formData.studyTaskId || null,
                startedAt: new Date(formData.startedAt).toISOString(),
            };

            if (editingSessionId) {
                await gateApi.updateStudySession(editingSessionId, payload);
            } else {
                await gateApi.createStudySession(payload);
            }

            setShowForm(false);
            setEditingSessionId(null);
            setFormData({
                topicId: '',
                studyTaskId: '',
                startedAt: new Date().toISOString().substring(0, 16),
                durationMinutes: 60,
                sessionType: 'STUDY',
                notes: ''
            });
            await fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to save session');
        }
    };

    const handleEdit = (s: GateStudySession) => {
        const localDate = new Date(s.startedAt);
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

        setFormData({
            topicId: s.topicId || '',
            studyTaskId: s.studyTaskId || '',
            startedAt: localDate.toISOString().slice(0, 16),
            durationMinutes: s.durationMinutes,
            sessionType: s.sessionType as any,
            notes: s.notes || ''
        });
        setEditingSessionId(s.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this study session?')) return;
        try {
            await gateApi.deleteStudySession(id);
            await fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    if (loading && !summary) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary-500" />
                        GATE Study Sessions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Track the time you actually spend preparing.</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="whitespace-nowrap">
                        <PlusCircle className="w-4 h-4 mr-2" /> Record Study Session
                    </Button>
                )}
            </div>

            {/* Form Modal/Section */}
            {showForm && (
                <Card className="p-6 border-primary-100 dark:border-primary-900 border-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{editingSessionId ? 'Edit Study Session' : 'Record Study Session'}</h2>
                    </div>
                    {error && <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg flex"><AlertCircle className="w-4 h-4 mr-2 inline" /> {error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date & Time</label>
                                <Input type="datetime-local" value={formData.startedAt} onChange={e => setFormData({ ...formData, startedAt: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Duration (Minutes)</label>
                                <Input type="number" min="1" max="1440" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })} required />
                            </div>
                            <Select
                                label="Session Type"
                                value={formData.sessionType}
                                onChange={e => setFormData({ ...formData, sessionType: e.target.value as any })}
                                options={[
                                    { value: 'STUDY', label: 'Study' },
                                    { value: 'REVISION', label: 'Revision' },
                                    { value: 'PRACTICE', label: 'Practice' },
                                    { value: 'PYQ', label: 'Previous Year Questions (PYQ)' },
                                    { value: 'MOCK', label: 'Mock Test' },
                                    { value: 'OTHER', label: 'Other' },
                                ]}
                            />
                            <Select
                                label="Topic (Optional)"
                                value={formData.topicId || ''}
                                onChange={e => setFormData({ ...formData, topicId: e.target.value })}
                                options={[
                                    { value: '', label: topics.length === 0 ? 'No personal topics available' : 'General / No Topic' },
                                    ...topics.map(t => ({ value: t.id, label: t.title }))
                                ]}
                            />
                            <Select
                                label="Planner Task (Optional)"
                                value={formData.studyTaskId || ''}
                                onChange={e => setFormData({ ...formData, studyTaskId: e.target.value })}
                                options={[
                                    { value: '', label: tasks.length === 0 ? 'No planner tasks available this week' : 'General / No Task' },
                                    ...tasks.map(t => ({ value: t.id, label: t.title }))
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                            <Input value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="What did you accomplish?" />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingSessionId(null); setError(null); }}>Cancel</Button>
                            <Button type="submit">Save Session</Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-5 flex flex-col justify-center border-t-4 border-t-purple-500">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">TODAY</h3>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-bold">{formatTime(summary?.todayMinutes || 0)}</p>
                            <p className="text-sm text-slate-500 mt-1">Study Time</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 flex flex-col justify-center border-t-4 border-t-primary-500">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">THIS WEEK</h3>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-bold">{formatTime(summary?.weekMinutes || 0)}</p>
                            <p className="text-sm text-slate-500 mt-1">Actual Study</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-medium text-slate-400">{formatTime(plannedMinutes)}</p>
                            <p className="text-xs text-slate-500">Planned</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 flex flex-col justify-center border-t-4 border-t-emerald-500">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">SESSIONS THIS WEEK</h3>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-bold">{summary?.weekSessionCount || 0}</p>
                            <p className="text-sm text-slate-500 mt-1">Total</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-medium text-slate-400">{summary?.sessionCount || 0}</p>
                            <p className="text-xs text-slate-500">Lifetime</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Sessions */}
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-8 mb-4">RECENT SESSIONS</h2>

            {sessions.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 bg-transparent">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No study sessions recorded yet.</h3>
                    <p className="text-slate-500 mt-2">Record the time you spend studying to build your preparation history.</p>
                    <Button className="mt-4" onClick={() => setShowForm(true)}><PlusCircle className="mr-2 w-4 h-4" /> Record Study Session</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map(s => (
                        <Card key={s.id} className="p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{s.topic?.title || 'General Session'}</h3>
                                <div className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">{s.sessionType}</div>
                            </div>

                            <div className="flex items-center text-sm text-slate-500 mb-4 gap-4">
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {s.durationMinutes} min</span>
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {format(new Date(s.startedAt), 'MMM d, yyyy')}</span>
                            </div>

                            {s.studyTask && (
                                <div className="text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded mb-3">
                                    <span className="font-semibold">Task: </span> {s.studyTask.title}
                                </div>
                            )}

                            {s.notes && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-4">"{s.notes}"</p>
                            )}

                            <div className="mt-auto flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}><Edit2 className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
