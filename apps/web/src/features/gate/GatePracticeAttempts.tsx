import { useEffect, useState } from 'react';
import { gateApi, GatePracticeAttempt, PracticeSummary, GatePersonalTopic } from './api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Target, Activity, Clock, Percent, List, Link as LinkIcon, Edit, Trash, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export function GatePracticeAttempts() {
    const [summary, setSummary] = useState<PracticeSummary | null>(null);
    const [attempts, setAttempts] = useState<GatePracticeAttempt[]>([]);
    const [topics, setTopics] = useState<GatePersonalTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        topicId: 'ALL',
        attemptType: 'PRACTICE' as any,
        sourceName: '',
        sourceUrl: '',
        paperCode: '',
        paperYear: '',
        attemptDate: format(new Date(), 'yyyy-MM-dd'),
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unattemptedQuestions: 0,
        marksObtained: '',
        durationMinutes: '',
        difficulty: 'NONE',
        notes: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [sumRes, attRes, topicsRes] = await Promise.all([
                gateApi.getPracticeSummary(),
                gateApi.getPracticeAttempts(),
                gateApi.getTopics()
            ]);
            setSummary(sumRes);
            setAttempts(attRes);
            setTopics(topicsRes);
        } catch (error) {
            console.error('Error fetching practice attempts', error);
            toast.error('Failed to load practice attempts');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({
            topicId: 'ALL',
            attemptType: 'PRACTICE',
            sourceName: '',
            sourceUrl: '',
            paperCode: '',
            paperYear: '',
            attemptDate: format(new Date(), 'yyyy-MM-dd'),
            totalQuestions: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            unattemptedQuestions: 0,
            marksObtained: '',
            durationMinutes: '',
            difficulty: 'NONE',
            notes: ''
        });
        setIsCompleteModalOpen(true);
    };

    const openEditModal = (attempt: GatePracticeAttempt) => {
        setEditingId(attempt.id);
        setFormData({
            topicId: attempt.topicId || 'ALL',
            attemptType: attempt.attemptType,
            sourceName: attempt.sourceName,
            sourceUrl: attempt.sourceUrl || '',
            paperCode: attempt.paperCode || '',
            paperYear: attempt.paperYear ? attempt.paperYear.toString() : '',
            attemptDate: attempt.attemptDate.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
            totalQuestions: attempt.totalQuestions,
            correctAnswers: attempt.correctAnswers,
            incorrectAnswers: attempt.incorrectAnswers,
            unattemptedQuestions: attempt.unattemptedQuestions,
            marksObtained: attempt.marksObtained !== null ? attempt.marksObtained.toString() : '',
            durationMinutes: attempt.durationMinutes !== null ? attempt.durationMinutes.toString() : '',
            difficulty: attempt.difficulty || 'NONE',
            notes: attempt.notes || ''
        });
        setIsCompleteModalOpen(true);
    };

    const saveAttempt = async () => {
        if (!formData.sourceName) {
            toast.error('Source Name is required');
            return;
        }

        // Strict Validation: Math
        if (formData.correctAnswers + formData.incorrectAnswers + formData.unattemptedQuestions !== formData.totalQuestions) {
            toast.error(`Validation Failed: Correct (${formData.correctAnswers}) + Incorrect (${formData.incorrectAnswers}) + Unattempted (${formData.unattemptedQuestions}) must equal Total Questions (${formData.totalQuestions}).`);
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                attemptType: formData.attemptType,
                sourceName: formData.sourceName,
                totalQuestions: formData.totalQuestions,
                correctAnswers: formData.correctAnswers,
                incorrectAnswers: formData.incorrectAnswers,
                unattemptedQuestions: formData.unattemptedQuestions,
            };

            if (formData.topicId && formData.topicId !== 'ALL') payload.topicId = formData.topicId;
            if (formData.sourceUrl) payload.sourceUrl = formData.sourceUrl.trim();
            if (formData.paperCode) payload.paperCode = formData.paperCode;
            if (formData.paperYear) payload.paperYear = parseInt(formData.paperYear);
            if (formData.attemptDate) payload.attemptDate = new Date(formData.attemptDate).toISOString();
            if (formData.marksObtained !== '') payload.marksObtained = parseFloat(formData.marksObtained);
            if (formData.durationMinutes !== '') payload.durationMinutes = parseInt(formData.durationMinutes);
            if (formData.difficulty !== 'NONE') payload.difficulty = formData.difficulty;
            if (formData.notes) payload.notes = formData.notes;

            if (editingId) {
                await gateApi.updatePracticeAttempt(editingId, payload);
                toast.success('Attempt updated successfully');
            } else {
                await gateApi.createPracticeAttempt(payload);
                toast.success('Attempt saved successfully');
            }
            setIsCompleteModalOpen(false);
            void fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save attempt');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteAttempt = async (id: string) => {
        if (!confirm('Are you sure you want to delete this practice attempt?')) return;
        try {
            await gateApi.deletePracticeAttempt(id);
            toast.success('Deleted successfully');
            void fetchData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (isLoading) return <div>Loading Practice Attempts...</div>;

    const renderAccuracy = (correct: number, attempted: number) => {
        if (attempted === 0) return '—';
        return `${Math.round((correct / attempted) * 100)}%`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary-500" />
                        Practice Performance Journal
                    </h2>
                    <p className="text-slate-500">Record and track your practice accuracy strictly.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => window.location.href = '/gate/practice'}>Practice Resources</Button>
                    <Button onClick={openCreateModal} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Record Attempt
                    </Button>
                </div>
            </div>

            {summary && attempts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-blue-500">
                            <span className="text-sm text-slate-500 uppercase font-semibold">Total Attempts</span>
                            <span className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{summary.totalAttempts}</span>
                        </Card>
                        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-purple-500">
                            <span className="text-sm text-slate-500 uppercase font-semibold">Qs Attempted</span>
                            <span className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{summary.questionsAttempted}</span>
                        </Card>
                        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-green-500">
                            <span className="text-sm text-slate-500 uppercase font-semibold">Overall Accuracy</span>
                            <span className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">
                                {Number(summary.questionsAttempted) === 0 ? '—' : `${summary.overallAccuracy.toFixed(1)}%`}
                            </span>
                        </Card>
                        <Card className="p-5 flex flex-col justify-center bg-slate-50 dark:bg-slate-800 border">
                            <span className="text-sm text-slate-500 uppercase font-semibold">Summary</span>
                            <div className="text-sm font-medium mt-1 text-slate-700 dark:text-slate-200">
                                <span className="text-green-600 dark:text-green-400">{summary.correct} Correct</span> <br />
                                <span className="text-red-500 dark:text-red-400">{summary.incorrect} Incorrect</span>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-xl font-bold">Attempt History</h3>
                            {attempts.map(attempt => {
                                const accuracy = renderAccuracy(attempt.correctAnswers, attempt.attemptedQuestions);
                                return (
                                    <Card key={attempt.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${attempt.attemptType === 'MOCK' ? 'bg-purple-100 text-purple-700' :
                                                    attempt.attemptType === 'PYQ' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {attempt.attemptType}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                                    {attempt.sourceName}
                                                    {attempt.sourceUrl && (
                                                        <a href={attempt.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline inline-flex items-center gap-1 ml-1" title="External URL">
                                                            <LinkIcon className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </span>
                                                {(attempt.paperCode || attempt.paperYear) && (
                                                    <span className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                                                        {attempt.paperYear} {attempt.paperCode}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                                {attempt.topic ? attempt.topic.title : 'General / No Topic Selected'}
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1" title="Duration">
                                                    <Clock className="w-4 h-4" /> {attempt.durationMinutes ? `${attempt.durationMinutes}m` : '—'}
                                                </span>
                                                <span className="flex items-center gap-1" title="Questions Attempted / Total">
                                                    <List className="w-4 h-4" /> {attempt.attemptedQuestions} / {attempt.totalQuestions} Attempted
                                                </span>
                                                {attempt.marksObtained !== null && (
                                                    <span className="font-semibold text-primary-600">Marks: {attempt.marksObtained}</span>
                                                )}
                                                <span className="text-xs text-slate-400 ml-auto">
                                                    {format(new Date(attempt.attemptDate), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            {attempt.notes && (
                                                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 italic border-l-2 pl-2">
                                                    "{attempt.notes}"
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 min-w-[120px]">
                                            <div className="text-center sm:text-right">
                                                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Accuracy</div>
                                                <div className="text-2xl font-bold mb-1" style={{ color: accuracy === '—' ? '#94a3b8' : parseFloat(accuracy) >= 70 ? '#10b981' : parseFloat(accuracy) >= 50 ? '#f59e0b' : '#ef4444' }}>
                                                    {accuracy}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    <span className="text-green-500">{attempt.correctAnswers}</span> / <span className="text-red-500">{attempt.incorrectAnswers}</span> / <span className="text-slate-400">{attempt.unattemptedQuestions}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3 w-full sm:w-auto justify-end">
                                                <Button size="icon" variant="ghost" onClick={() => openEditModal(attempt)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteAttempt(attempt.id)}>
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="space-y-6">
                            <Card className="p-5 mt-10 lg:mt-0">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Percent className="w-5 h-5" /> Performance by Topic</h3>
                                <div className="space-y-4">
                                    {Object.entries(summary.byTopic || {}).map(([title, stats]) => (
                                        <div key={title} className="border-b last:border-0 pb-3 last:pb-0">
                                            <div className="font-semibold text-sm mb-1">{title}</div>
                                            <div className="flex justify-between items-center text-xs text-slate-500">
                                                <span>{stats.attempts} Attempt{stats.attempts !== 1 ? 's' : ''}</span>
                                                <span>{stats.questions} Qs</span>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">{renderAccuracy(stats.correct, stats.questions)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {Object.keys(summary.byTopic || {}).length === 0 && (
                                        <div className="text-sm text-slate-500 italic">No topic data available.</div>
                                    )}
                                </div>
                            </Card>

                            <Card className="p-5">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5" /> Performance by Type</h3>
                                <div className="space-y-4">
                                    {Object.entries(summary.byType || {}).map(([type, stats]) => (
                                        <div key={type} className="flex justify-between items-center text-sm border-b last:border-0 pb-2 last:pb-0">
                                            <span className="font-semibold text-slate-700 dark:text-slate-200">{type}</span>
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{stats.attempts} attempts</span>
                                            <span className="font-bold">{renderAccuracy(stats.correct, stats.questions)}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            ) : (
                <Card className="p-10 text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 border-dashed">
                    <Target className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No practice attempts recorded yet</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Record your PYQ, practice, or mock results here to mathematically track actual correctness arrays safely away from AI predictions.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={openCreateModal}>Record Practice Attempt</Button>
                        <Button variant="outline" onClick={() => window.location.href = '/gate/practice'}>Practice Resources</Button>
                    </div>
                </Card>
            )}

            <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title={editingId ? 'Edit Practice Attempt' : 'Record Practice Attempt'} size="lg">
                <div className="max-h-[65vh] overflow-y-auto px-1 py-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                        <Select
                            label="Attempt Type"
                            value={formData.attemptType}
                            onChange={e => setFormData({ ...formData, attemptType: e.target.value as any })}
                            options={[
                                { value: 'PYQ', label: 'PYQ (Previous Year Question Pattern)' },
                                { value: 'PRACTICE', label: 'General Topic Practice' },
                                { value: 'MOCK', label: 'Mock Test Series' }
                            ]}
                        />

                        <div className="space-y-1">
                            <Select
                                label="Topic (Optional)"
                                value={formData.topicId}
                                onChange={e => setFormData({ ...formData, topicId: e.target.value })}
                                options={[
                                    { value: 'ALL', label: 'General / No Topic Selected' },
                                    ...topics.map(t => ({ value: t.id, label: t.title }))
                                ]}
                            />
                            {topics.length === 0 && <span className="text-xs text-blue-500">Need topics? Add via Syllabus tab.</span>}
                        </div>

                        <Input label="Source Name (Required)" placeholder="e.g. Official GATE, Testbook, GO" value={formData.sourceName} onChange={e => setFormData({ ...formData, sourceName: e.target.value })} />
                        <Input label="Source URL (Optional)" placeholder="https://" value={formData.sourceUrl} onChange={e => setFormData({ ...formData, sourceUrl: e.target.value })} />

                        <Input label="Paper Code (Optional)" placeholder="e.g. CS, EC, ME" value={formData.paperCode} onChange={e => setFormData({ ...formData, paperCode: e.target.value })} />
                        <Input type="number" label="Paper Year (Optional)" placeholder="e.g. 2024" value={formData.paperYear} onChange={e => setFormData({ ...formData, paperYear: e.target.value })} />

                        <div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Strict Validation Counters</label>
                            <p className="text-xs text-slate-500 mb-2">Correct + Incorrect + Unattempted MUST equal Total Questions.</p>
                        </div>

                        <Input type="number" min="0" label="Total Questions Context" value={formData.totalQuestions.toString()} onChange={e => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) || 0 })} />
                        <Input type="number" min="0" label="Correct Answers" value={formData.correctAnswers.toString()} onChange={e => setFormData({ ...formData, correctAnswers: parseInt(e.target.value) || 0 })} />

                        <Input type="number" min="0" label="Incorrect Answers" value={formData.incorrectAnswers.toString()} onChange={e => setFormData({ ...formData, incorrectAnswers: parseInt(e.target.value) || 0 })} />
                        <Input type="number" min="0" label="Unattempted Questions" value={formData.unattemptedQuestions.toString()} onChange={e => setFormData({ ...formData, unattemptedQuestions: parseInt(e.target.value) || 0 })} />

                        <div className="col-span-1 md:col-span-2 pt-2 pb-2">
                            <div className={`p-2 rounded text-xs font-mono font-bold ${(formData.correctAnswers + formData.incorrectAnswers + formData.unattemptedQuestions) === formData.totalQuestions ? 'bg-green-100 text-green-700' : formData.totalQuestions === 0 ? 'bg-slate-100' : 'bg-red-100 text-red-700'}`}>
                                MATH CHECK: {formData.correctAnswers + formData.incorrectAnswers + formData.unattemptedQuestions} === {formData.totalQuestions} Total
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Input type="number" step="0.5" label="Marks Recorded (Optional)" placeholder="e.g. 52.5" value={formData.marksObtained} onChange={e => setFormData({ ...formData, marksObtained: e.target.value })} />
                            <p className="text-[10px] text-slate-400 -mt-1 ml-1">Do not rely on this for generic practice.</p>
                        </div>
                        <Input type="number" min="1" label="Duration (Minutes, Optional)" placeholder="e.g. 180" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })} />

                        <Input type="date" label="Date" value={formData.attemptDate} onChange={e => setFormData({ ...formData, attemptDate: e.target.value })} />

                        <Select
                            label="Your Difficulty Rating"
                            value={formData.difficulty}
                            onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                            options={[
                                { value: 'NONE', label: 'Unspecified' },
                                { value: 'EASY', label: 'Easy' },
                                { value: 'MEDIUM', label: 'Medium' },
                                { value: 'HARD', label: 'Hard' }
                            ]}
                        />

                        <div className="col-span-1 md:col-span-2">
                            <Textarea rows={2} label="Personal Notes (Optional)" placeholder="Silly mistakes on math section..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => void saveAttempt()} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Attempt'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
