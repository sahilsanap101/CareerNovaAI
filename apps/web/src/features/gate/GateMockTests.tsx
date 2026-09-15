import { useState, useEffect } from 'react';
import { gateApi, GatePracticeAttempt } from './api';
import { Target, ExternalLink, PlusCircle, Calendar, Trash2, Edit2, Info, CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export function GateMockTests() {
    const [mockAttempts, setMockAttempts] = useState<GatePracticeAttempt[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Form State
    const [sourceName, setSourceName] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [paperCode, setPaperCode] = useState('');
    const [paperYear, setPaperYear] = useState('');
    const [attemptDate, setAttemptDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [totalQuestions, setTotalQuestions] = useState('65');
    const [correctAnswers, setCorrectAnswers] = useState('0');
    const [incorrectAnswers, setIncorrectAnswers] = useState('0');
    const [unattemptedQuestions, setUnattemptedQuestions] = useState('0');
    const [marksObtained, setMarksObtained] = useState('');
    const [percentile, setPercentile] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('180');
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [attempts, s] = await Promise.all([
                gateApi.getPracticeAttempts(undefined, undefined, undefined, 'MOCK'),
                gateApi.getMockSummary()
            ]);
            setMockAttempts(attempts);
            setSummary(s);
        } catch (error) {
            console.error('Failed to load mock tests', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenForm = (attempt?: GatePracticeAttempt) => {
        if (attempt) {
            setEditId(attempt.id);
            setSourceName(attempt.sourceName);
            setSourceUrl(attempt.sourceUrl || '');
            setPaperCode(attempt.paperCode || '');
            setPaperYear(attempt.paperYear?.toString() || '');
            setAttemptDate(format(new Date(attempt.attemptDate), 'yyyy-MM-dd'));
            setTotalQuestions(attempt.totalQuestions.toString());
            setCorrectAnswers(attempt.correctAnswers.toString());
            setIncorrectAnswers(attempt.incorrectAnswers.toString());
            setUnattemptedQuestions(attempt.unattemptedQuestions.toString());
            setMarksObtained(attempt.marksObtained?.toString() || '');
            setPercentile(attempt.percentile?.toString() || '');
            setDurationMinutes(attempt.durationMinutes?.toString() || '');
            setDifficulty(attempt.difficulty || 'MEDIUM');
            setNotes(attempt.notes || '');
        } else {
            setEditId(null);
            setSourceName('');
            setSourceUrl('');
            setPaperCode('');
            setPaperYear('');
            setAttemptDate(format(new Date(), 'yyyy-MM-dd'));
            setTotalQuestions('65');
            setCorrectAnswers('0');
            setIncorrectAnswers('0');
            setUnattemptedQuestions('0');
            setMarksObtained('');
            setPercentile('');
            setDurationMinutes('180');
            setDifficulty('MEDIUM');
            setNotes('');
        }
        setIsFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const tQ = parseInt(totalQuestions);
        const cA = parseInt(correctAnswers);
        const iA = parseInt(incorrectAnswers);
        const uQ = parseInt(unattemptedQuestions);

        if (cA + iA + uQ !== tQ) {
            toast.error('Correct, incorrect, and unattempted must sum precisely to total questions');
            return;
        }

        const payload: any = {
            attemptType: 'MOCK',
            sourceName,
            sourceUrl: sourceUrl || null,
            paperCode: paperCode || null,
            paperYear: paperYear ? parseInt(paperYear) : null,
            attemptDate: new Date(attemptDate).toISOString(),
            totalQuestions: tQ,
            attemptedQuestions: cA + iA,
            correctAnswers: cA,
            incorrectAnswers: iA,
            unattemptedQuestions: uQ,
            marksObtained: marksObtained ? parseFloat(marksObtained) : null,
            percentile: percentile ? parseFloat(percentile) : null,
            durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
            difficulty,
            notes: notes || null
        };

        try {
            if (editId) {
                await gateApi.updatePracticeAttempt(editId, payload);
                toast.success('Mock attempt updated');
            } else {
                await gateApi.createPracticeAttempt(payload);
                toast.success('Mock attempt recorded');
            }
            setIsFormOpen(false);
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save mock attempt');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mock attempt?')) return;
        try {
            await gateApi.deletePracticeAttempt(id);
            toast.success('Mock attempt deleted');
            loadData();
        } catch {
            toast.error('Failed to delete attempt');
        }
    };

    // Trend Data Logic
    const trendData = mockAttempts
        .filter(m => m.marksObtained !== null)
        .sort((a, b) => new Date(a.attemptDate).getTime() - new Date(b.attemptDate).getTime())
        .map(m => ({
            date: format(new Date(m.attemptDate), 'MMM d'),
            marks: m.marksObtained,
            accuracy: m.attemptedQuestions > 0 ? Number(((m.correctAnswers / m.attemptedQuestions) * 100).toFixed(1)) : 0
        }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mock Tests</h1>
                    <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
                        Record and track your GATE mock performance. This relies purely on your actual performance data without fabricated metrics.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm()} className="whitespace-nowrap">
                    <PlusCircle className="w-4 h-4 mr-2" /> Record Mock Attempt
                </Button>
            </div>

            {/* MOCK TEST RESOURCES MAP */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 border rounded-lg bg-card/60 shadow-sm border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                        <CheckCircle2 className="w-5 h-5" /> Official GATE Resources
                    </h3>
                    <ul className="mt-4 space-y-3">
                        <li>
                            <a href="https://gate2027.iitm.ac.in/" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:underline hover:text-blue-500 transition-colors">
                                Official GATE 2027 Website <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </li>
                        <li>
                            <a href="https://gate2027.iitm.ac.in/exam_papers_and_syllabus" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:underline hover:text-blue-500 transition-colors">
                                Exam Papers & Syllabus <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="p-5 border rounded-lg bg-card/60 shadow-sm border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                        <AlertCircle className="w-5 h-5" /> External Practice Resources
                    </h3>
                    <ul className="mt-4 space-y-3">
                        <li>
                            <a href="https://testbook.com/gate/mock-test" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:underline hover:text-blue-500 transition-colors">
                                Testbook Mock Tests <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </li>
                        <li>
                            <a href="https://www.geeksforgeeks.org/gate/" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm hover:underline hover:text-blue-500 transition-colors">
                                GeeksforGeeks GATE <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* SUMMARY WIDGETS */}
            {mockAttempts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-xl bg-card">
                        <p className="text-sm text-muted-foreground font-medium">Total Mocks</p>
                        <p className="text-2xl font-bold mt-1">{summary?.totalAttempts || 0}</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-card">
                        <p className="text-sm text-muted-foreground font-medium">Best Marks</p>
                        <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-500">
                            {summary?.bestMarks !== null ? summary.bestMarks.toFixed(1) : '-'}
                        </p>
                    </div>
                    <div className="p-4 border rounded-xl bg-card">
                        <p className="text-sm text-muted-foreground font-medium">Average Marks</p>
                        <p className="text-2xl font-bold mt-1">
                            {summary?.averageMarks !== null ? summary.averageMarks.toFixed(1) : '-'}
                        </p>
                    </div>
                    <div className="p-4 border rounded-xl bg-card">
                        <p className="text-sm text-muted-foreground font-medium">Average Accuracy</p>
                        <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                            {summary?.averageAccuracy !== null ? `${summary.averageAccuracy.toFixed(1)}%` : '-'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-10 border rounded-xl bg-secondary/30 text-center border-dashed">
                    <Target className="w-12 h-12 mx-auto text-slate-400 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold">No mock attempts recorded yet.</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        Record your first mock result to start building your performance history.
                    </p>
                </div>
            )}

            {/* TREND CHARTS */}
            {mockAttempts.length > 0 && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="p-5 border rounded-lg bg-card">
                        <h3 className="font-semibold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" /> Performance Trend (Marks)
                        </h3>
                        {trendData.length > 0 ? (
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Line type="monotone" dataKey="marks" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Marks Obtained" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-20 bg-secondary/30 rounded-md">
                                Add marks to your mock attempts to see your performance trend.
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-4 italic text-center">Trend uses recorded mock marks only.</p>
                    </div>

                    <div className="p-5 border rounded-lg bg-card">
                        <h3 className="font-semibold mb-6 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-500" /> Accuracy Trend (%)
                        </h3>
                        {trendData.length > 0 ? (
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Accuracy %" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-20 bg-secondary/30 rounded-md">
                                Accurate trend computation requires attempted answered questions data.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* MOCK HISTORY TABLE */}
            <div className="pt-4">
                <h2 className="text-xl font-bold mb-4">Mock History</h2>
                <div className="border rounded-lg bg-card overflow-hidden">
                    {mockAttempts.length > 0 ? (
                        <div className="divide-y">
                            {mockAttempts.map(item => (
                                <div key={item.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-muted/50 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{item.sourceName}</h4>
                                            {item.sourceUrl && (
                                                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(item.attemptDate), 'MMM d, yyyy')}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.durationMinutes || '-'} min</span>
                                            {item.paperCode && (
                                                <><span>•</span><span>{item.paperCode} {item.paperYear}</span></>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-6 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs mb-0.5">Marks</p>
                                            <p className="font-semibold">{item.marksObtained !== null ? item.marksObtained : '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs mb-0.5">Accuracy</p>
                                            <p className="font-semibold text-blue-500">
                                                {item.attemptedQuestions > 0 ? `${((item.correctAnswers / item.attemptedQuestions) * 100).toFixed(1)}%` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs mb-0.5">Percentile</p>
                                            <p className="font-semibold text-purple-500">
                                                {item.percentile !== null ? item.percentile : <span className="text-slate-400 font-normal">Not provided</span>}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-end md:justify-start gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenForm(item)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            No mock attempts recorded yet.
                        </div>
                    )}
                </div>
            </div>

            {/* RECORD MOCK MODAL */}
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editId ? "Edit Mock Attempt" : "Record Mock Attempt"} size="lg">
                <form onSubmit={handleSave} className="space-y-4 px-1 py-1">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Mock/Test Name (Source)" value={sourceName} onChange={e => setSourceName(e.target.value)} required placeholder="e.g. Testbook Full Mock 1" />
                        <Input label="Attempt Date" type="date" value={attemptDate} onChange={e => setAttemptDate(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Source URL (Optional)" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." />
                        <div className="grid grid-cols-2 gap-2">
                            <Input label="Paper Code (Opt)" value={paperCode} onChange={e => setPaperCode(e.target.value)} placeholder="CS" />
                            <Input label="Year (Opt)" type="number" value={paperYear} onChange={e => setPaperYear(e.target.value)} placeholder="2027" />
                        </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 mt-4 space-y-4">
                        <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2"><Target className="w-4 h-4" /> Performance Metrics</h4>
                        <div className="grid grid-cols-4 gap-3">
                            <Input label="Total Qs" type="number" value={totalQuestions} onChange={e => setTotalQuestions(e.target.value)} required min="1" />
                            <Input label="Correct" type="number" value={correctAnswers} onChange={e => setCorrectAnswers(e.target.value)} required min="0" />
                            <Input label="Incorrect" type="number" value={incorrectAnswers} onChange={e => setIncorrectAnswers(e.target.value)} required min="0" />
                            <Input label="Unattempt" type="number" value={unattemptedQuestions} onChange={e => setUnattemptedQuestions(e.target.value)} required min="0" />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Correct + Incorrect + Unattempted exactly equals Total. System rejects invalid sums.</p>

                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <Input label="Marks Obtained" type="number" step="0.1" value={marksObtained} onChange={e => setMarksObtained(e.target.value)} placeholder="Optional" />
                            <Input label="External Percentile" type="number" step="0.1" min="0" max="100" value={percentile} onChange={e => setPercentile(e.target.value)} placeholder="Optional (%)" />
                            <Input label="Duration (mins)" type="number" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} placeholder="180" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Difficulty" value={difficulty} onChange={(e: any) => setDifficulty(e.target.value)} options={[
                            { value: 'EASY', label: 'Easy' },
                            { value: 'MEDIUM', label: 'Medium' },
                            { value: 'HARD', label: 'Hard' }
                        ]} />
                        <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any insights..." />
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Mock Attempt</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
