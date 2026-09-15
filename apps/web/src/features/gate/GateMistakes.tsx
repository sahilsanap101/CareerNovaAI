import { useEffect, useState } from 'react';
import { gateApi, GateMistake, MistakeSummary, GatePersonalTopic, GatePracticeAttempt } from './api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { BookX, Filter, Plus, Edit, AlertTriangle, AlertCircle, CheckCircle, Repeat, Target, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export function GateMistakes() {
    const [summary, setSummary] = useState<MistakeSummary | null>(null);
    const [mistakes, setMistakes] = useState<GateMistake[]>([]);
    const [topics, setTopics] = useState<GatePersonalTopic[]>([]);
    const [attempts, setAttempts] = useState<GatePracticeAttempt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [revisionMistakeId, setRevisionMistakeId] = useState<string | null>(null);
    const [revisionTitle, setRevisionTitle] = useState('');
    const [revisionDate, setRevisionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [revisionPriority, setRevisionPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

    // Filters
    const [filters, setFilters] = useState({
        status: 'ALL',
        priority: 'ALL',
        category: 'ALL',
        difficulty: 'ALL',
        topicId: 'ALL',
        practiceAttemptId: 'ALL',
        needsRevision: 'ALL',
        search: ''
    });

    // Form
    const [formData, setFormData] = useState({
        title: '',
        topicId: 'ALL',
        practiceAttemptId: 'ALL',
        category: 'CONCEPTUAL' as any,
        difficulty: 'NONE',
        priority: 'MEDIUM' as any,
        status: 'OPEN' as any,
        needsRevision: true,
        mistakeDate: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        correctConcept: '',
        notes: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [sumRes, mistakesRes, topicsRes, attemptsRes] = await Promise.all([
                gateApi.getMistakeSummary(),
                gateApi.getMistakes({ ...filters }),
                gateApi.getTopics(),
                gateApi.getPracticeAttempts()
            ]);
            setSummary(sumRes);
            setMistakes(mistakesRes);
            setTopics(topicsRes);
            setAttempts(attemptsRes);
        } catch (error) {
            toast.error('Failed to load mistakes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => { void fetchData(); }, 300);
        return () => clearTimeout(timeout);
    }, [filters]); // Refetch on filter change

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({
            title: '',
            topicId: 'ALL',
            practiceAttemptId: 'ALL',
            category: 'CONCEPTUAL',
            difficulty: 'NONE',
            priority: 'MEDIUM',
            status: 'OPEN',
            needsRevision: true,
            mistakeDate: format(new Date(), 'yyyy-MM-dd'),
            description: '',
            correctConcept: '',
            notes: ''
        });
        setIsCompleteModalOpen(true);
    };

    const openEditModal = (mistake: GateMistake) => {
        setEditingId(mistake.id);
        setFormData({
            title: mistake.title,
            topicId: mistake.topicId || 'ALL',
            practiceAttemptId: mistake.practiceAttemptId || 'ALL',
            category: mistake.category,
            difficulty: mistake.difficulty || 'NONE',
            priority: mistake.priority,
            status: mistake.status,
            needsRevision: mistake.needsRevision,
            mistakeDate: mistake.mistakeDate ? format(new Date(mistake.mistakeDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            description: mistake.description || '',
            correctConcept: mistake.correctConcept || '',
            notes: mistake.notes || ''
        });
        setIsCompleteModalOpen(true);
    };

    const saveMistake = async () => {
        if (!formData.title.trim()) {
            toast.error('Brief title required');
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                title: formData.title,
                category: formData.category,
                priority: formData.priority,
                status: formData.status,
                needsRevision: formData.needsRevision,
                mistakeDate: formData.mistakeDate ? new Date(formData.mistakeDate).toISOString() : null
            };

            if (formData.topicId && formData.topicId !== 'ALL') payload.topicId = formData.topicId;
            if (formData.practiceAttemptId && formData.practiceAttemptId !== 'ALL') payload.practiceAttemptId = formData.practiceAttemptId;
            if (formData.difficulty !== 'NONE') payload.difficulty = formData.difficulty;
            if (formData.description) payload.description = formData.description;
            if (formData.correctConcept) payload.correctConcept = formData.correctConcept;
            if (formData.notes) payload.notes = formData.notes;

            if (editingId) {
                await gateApi.updateMistake(editingId, payload);
                toast.success('Mistake updated');
            } else {
                await gateApi.createMistake(payload);
                toast.success('Mistake recorded');
            }
            setIsCompleteModalOpen(false);
            void fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatus = async (mistake: GateMistake) => {
        try {
            await gateApi.updateMistake(mistake.id, { status: mistake.status === 'OPEN' ? 'RESOLVED' : 'OPEN' });
            toast.success(mistake.status === 'OPEN' ? 'Marked as Resolved' : 'Reopened Mistake');
            void fetchData();
        } catch (e) { toast.error('Failed to update status'); }
    };

    const deleteMistake = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this mistake log?')) return;
        try {
            await gateApi.deleteMistake(id);
            toast.success('Deleted');
            void fetchData();
        } catch (err) { toast.error('Failed to delete'); }
    };

    const openRevisionModal = (mistake: GateMistake) => {
        setRevisionMistakeId(mistake.id);
        setRevisionTitle(`Revise: ${mistake.title}`);
        setRevisionDate(format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd')); // Tomorrow
        setRevisionPriority(mistake.priority);
        setIsRevisionModalOpen(true);
    };

    const scheduleRevision = async () => {
        if (!revisionMistakeId) return;
        try {
            const mistake = mistakes.find(m => m.id === revisionMistakeId);

            const payload: any = {
                mistakeId: revisionMistakeId,
                title: revisionTitle,
                scheduledDate: new Date(revisionDate).toISOString(),
                priority: revisionPriority,
                status: 'PENDING'
            };
            if (mistake?.topicId) payload.topicId = mistake.topicId;
            if (mistake?.practiceAttemptId) payload.practiceAttemptId = mistake.practiceAttemptId;

            await gateApi.createGateRevision(payload);
            toast.success('Revision explicitly scheduled.');
            setIsRevisionModalOpen(false);
        } catch (e) {
            toast.error('Failed to schedule revision');
        }
    };

    const categoryLabels: Record<string, string> = {
        CONCEPTUAL: "Conceptual", CALCULATION: "Calculation", MEMORY: "Memory", MISREAD_QUESTION: "Misread Question",
        TIME_MANAGEMENT: "Time Management", CARELESS_ERROR: "Careless Error", APPLICATION: "Application", OTHER: "Other"
    };

    // Find explicitly repeated title strings
    const repeats = mistakes.reduce((acc, mistake) => {
        const titleNormalized = mistake.title.trim().toLowerCase();
        acc[titleNormalized] = (acc[titleNormalized] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (isLoading && !summary) return <div className="p-8">Loading Mistake Log...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookX className="w-6 h-6 text-red-500" />
                        Mistake Log
                    </h2>
                    <p className="text-slate-500">Record exactly what you got wrong and why, strictly isolating logic traps.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={openCreateModal} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4" /> Record Mistake
                    </Button>
                </div>
            </div>

            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 flex flex-col justify-center border-l-4 border-l-blue-500">
                        <span className="text-sm font-semibold text-slate-500">Total Recorded</span>
                        <span className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{summary.total}</span>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10">
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">Open Mistakes</span>
                        <span className="text-3xl font-bold mt-1 text-red-700 dark:text-red-300">{summary.open}</span>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center border-l-4 border-l-green-500">
                        <span className="text-sm font-semibold text-slate-500">Resolved</span>
                        <span className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{summary.resolved}</span>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center border-l-4 border-l-orange-500">
                        <span className="text-sm font-semibold text-slate-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Needs Revision</span>
                        <span className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{summary.needsRevision}</span>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Sidebar Filters */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-4 space-y-4 sticky top-6">
                        <h3 className="font-bold flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
                        <Input placeholder="Search mistakes..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />

                        <Select label="Status" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                            options={[{ value: 'ALL', label: 'All Statuses' }, { value: 'OPEN', label: 'Open' }, { value: 'RESOLVED', label: 'Resolved' }]} />

                        <Select label="Priority" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}
                            options={[{ value: 'ALL', label: 'All Priorities' }, { value: 'HIGH', label: 'High Priority' }, { value: 'MEDIUM', label: 'Medium Priority' }, { value: 'LOW', label: 'Low Priority' }]} />

                        <Select label="Needs Revision" value={filters.needsRevision} onChange={e => setFilters({ ...filters, needsRevision: e.target.value })}
                            options={[{ value: 'ALL', label: 'Any Revision Status' }, { value: 'YES', label: 'Needs Revision' }, { value: 'NO', label: 'No Revision Needed' }]} />

                        <Select label="Category" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}
                            options={[{ value: 'ALL', label: 'All Categories' }, ...Object.entries(categoryLabels).map(([k, v]) => ({ value: k, label: v }))]} />

                        <Select label="Topic" value={filters.topicId} onChange={e => setFilters({ ...filters, topicId: e.target.value })}
                            options={[{ value: 'ALL', label: 'All Topics' }, ...topics.map(t => ({ value: t.id, label: t.title }))]} />

                        {summary && Object.keys(summary.byTopic).length > 0 && (
                            <div className="mt-6 pt-4 border-t">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Recorded mistakes by topic</h4>
                                <div className="space-y-2 text-xs">
                                    {Object.entries(summary.byTopic).map(([t, stat]) => (
                                        <div key={t} className="flex justify-between items-center">
                                            <span className="truncate pr-2 font-medium" title={t}>{t}</span>
                                            <span className="shrink-0 bg-slate-100 dark:bg-slate-800 px-1 rounded">{stat.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-4">
                    {mistakes.length === 0 ? (
                        <Card className="p-10 text-center flex flex-col items-center justify-center border-dashed">
                            <BookX className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold mb-1">No mistakes found</h3>
                            <p className="text-slate-500 mb-4 text-sm max-w-sm">
                                {Object.values(filters).some(v => v !== 'ALL' && v !== '') ?
                                    "Try clearing your filters to see more mistakes." :
                                    "Log mistakes from your practice sessions so you can revisit the concepts that need attention."
                                }
                            </p>
                            <Button onClick={openCreateModal}>Record a Mistake</Button>
                        </Card>
                    ) : (
                        mistakes.map(mistake => {
                            const titleNormalized = (mistake.title || '').trim().toLowerCase();
                            const isRepeat = (repeats[titleNormalized] || 0) > 1;

                            return (
                                <Card key={mistake.id} className={`overflow-hidden transition-all duration-200 border-l-4 ${mistake.status === 'RESOLVED' ? 'border-l-green-500 opacity-80 bg-slate-50 dark:bg-slate-900' : 'border-l-red-500'}`}>
                                    <div className="p-4 md:p-5">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {mistake.status === 'RESOLVED' ? (
                                                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> RESOLVED</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> OPEN</span>
                                                    )}
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded 
                                                        ${mistake.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                            mistake.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-700'}`}>
                                                        {mistake.priority} PRIORITY
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-500 border rounded px-1.5 py-0.5">{categoryLabels[mistake.category]}</span>
                                                    {mistake.difficulty && <span className="text-xs text-slate-500 ml-1">Rating: {mistake.difficulty}</span>}
                                                </div>

                                                <div>
                                                    <h3 className={`text-lg font-bold flex items-center gap-2 ${mistake.status === 'RESOLVED' ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {mistake.title}
                                                        {isRepeat && mistake.status === 'OPEN' && (
                                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap not-italic normal-case"><Repeat className="w-3 h-3" /> Repeated Mistake</span>
                                                        )}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-1">
                                                        <span>{mistake.topic?.title || 'General / No Topic'}</span>
                                                        <span className="text-slate-400">{mistake.mistakeDate ? format(new Date(mistake.mistakeDate), 'MMM d, yyyy') : ''}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded text-sm text-red-900 dark:text-red-200">
                                                    <span className="font-bold flex items-center gap-1 mb-1"><AlertTriangle className="w-4 h-4" /> What went wrong:</span>
                                                    {mistake.description || <span className="italic text-red-400">No description provided.</span>}
                                                </div>

                                                {mistake.correctConcept && (
                                                    <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded text-sm text-green-900 dark:text-green-200 mt-2">
                                                        <span className="font-bold flex items-center gap-1 mb-1"><CheckCircle className="w-4 h-4" /> Correct Concept / Takeaway:</span>
                                                        {mistake.correctConcept}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 pb-1">
                                                    {mistake.practiceAttemptId && mistake.practiceAttempt && (
                                                        <span className="flex items-center gap-1 underline decoration-slate-300">
                                                            <Target className="w-3 h-3" /> From Practice Attempt: {mistake.practiceAttempt.attemptType} ({mistake.practiceAttempt.paperCode ? `${mistake.practiceAttempt.paperYear} ${mistake.practiceAttempt.paperCode}` : mistake.practiceAttempt.sourceName})
                                                        </span>
                                                    )}
                                                    {mistake.needsRevision && (
                                                        <span className="flex items-center gap-1 font-semibold text-orange-600 bg-orange-50 px-1.5 rounded"><Clock className="w-3 h-3" /> Tagged for Revision</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4 justify-end md:justify-start">
                                                <Button size="sm" variant={(mistake.status === 'OPEN' ? undefined : 'outline') as any} className={mistake.status === 'OPEN' ? 'bg-green-600 hover:bg-green-700 text-white' : ''} onClick={() => void toggleStatus(mistake)}>
                                                    {mistake.status === 'OPEN' ? 'Mark Resolved' : 'Reopen Mistake'}
                                                </Button>
                                                {mistake.status === 'OPEN' && (
                                                    <Button size="sm" variant="secondary" className="bg-primary/10 text-primary-700 hover:bg-primary/20" onClick={() => openRevisionModal(mistake)}>
                                                        Schedule Revision
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline" onClick={() => openEditModal(mistake)}>Edit</Button>
                                                <Button size="sm" variant="ghost" className="text-red-500 mt-auto" onClick={() => void deleteMistake(mistake.id)}>Delete</Button>
                                            </div>

                                        </div>
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>

            <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title={editingId ? 'Edit Mistake Log' : 'Record Mistake'} size="lg">
                <div className="max-h-[70vh] overflow-y-auto px-1 py-1">
                    <p className="text-sm text-slate-500 mb-4">Log a specific mistake to trace gaps and logic traps explicitly.</p>

                    <div className="space-y-4">
                        <Input label="Short Title (What did you do wrong?)" placeholder="e.g. Confused deadlock prevention and avoidance" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} maxLength={200} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select label="Topic (Optional)" value={formData.topicId} onChange={e => setFormData({ ...formData, topicId: e.target.value })} options={[{ value: 'ALL', label: 'General / No Topic' }, ...topics.map(t => ({ value: t.id, label: t.title }))]} />
                            <Select label="Practice Attempt (Optional)" value={formData.practiceAttemptId} onChange={e => setFormData({ ...formData, practiceAttemptId: e.target.value })} options={[{ value: 'ALL', label: 'Unlinked' }, ...attempts.map(a => ({ value: a.id, label: `${a.attemptType} - ${a.sourceName}` }))]} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select label="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} options={Object.entries(categoryLabels).map(([k, v]) => ({ value: k, label: v }))} />
                            <Select label="Difficulty of Concept" value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} options={[{ value: 'NONE', label: 'Unspecified' }, { value: 'EASY', label: 'Easy' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HARD', label: 'Hard' }]} />
                            <Select label="Priority to Review" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} />
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <Textarea rows={3} label="What Went Wrong?" placeholder="I used the wrong condition when applying the scheduling formula..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} maxLength={2000} />
                        </div>

                        <div>
                            <Textarea rows={3} label="Correct Concept / What I Should Remember" placeholder="Check whether the process is preemptive before applying..." value={formData.correctConcept} onChange={e => setFormData({ ...formData, correctConcept: e.target.value })} maxLength={2000} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50 dark:bg-slate-900 p-3 rounded border">
                            <Select label="Mistake Status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'OPEN', label: 'Open (Needs attention)' }, { value: 'RESOLVED', label: 'Resolved (Understood)' }]} />
                            <div className="flex items-center gap-3 mt-4 md:mt-2">
                                <input type="checkbox" id="needs-rev" className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300" checked={formData.needsRevision} onChange={e => setFormData({ ...formData, needsRevision: e.target.checked })} />
                                <label htmlFor="needs-rev" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Flag for Future Revision</label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Miscellaneous Notes (Optional)" placeholder="e.g. Page 42 in textbook" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} maxLength={1000} />
                            <Input type="date" label="Date of Mistake" value={formData.mistakeDate} onChange={e => setFormData({ ...formData, mistakeDate: e.target.value })} />
                        </div>

                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => void saveMistake()} disabled={isSaving}>
                        {isSaving ? 'Saving...' : (editingId ? 'Save Changes' : 'Record Mistake')}
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isRevisionModalOpen} onClose={() => setIsRevisionModalOpen(false)} title="Manually Schedule Revision" size="sm">
                <div className="px-1 py-1 space-y-4">
                    <p className="text-sm text-slate-500">Explicitly track this mistake in your Revision Hub.</p>
                    <Input label="Revision Title" value={revisionTitle} onChange={e => setRevisionTitle(e.target.value)} />
                    <Input type="date" label="Scheduled Date" value={revisionDate} onChange={e => setRevisionDate(e.target.value)} />
                    <Select label="Priority" value={revisionPriority} onChange={e => setRevisionPriority(e.target.value as any)}
                        options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button variant="outline" onClick={() => setIsRevisionModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => void scheduleRevision()}>Confirm Schedule</Button>
                </div>
            </Modal>
        </div>
    );
}
