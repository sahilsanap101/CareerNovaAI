import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Bookmark, CheckCircle2, XCircle, AlertTriangle, AlertCircle, ChevronLeft, ChevronRight, PlaySquare, FileText, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export function GatePracticeEngine() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [evaluations, setEvaluations] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [mistakeType, setMistakeType] = useState<string>('');
    const [confidence, setConfidence] = useState<string>('HIGH');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/v1/gate/practice/session', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: 5, focusWeakAreas: true, focusPrereqs: true })
        })
            .then(res => res.json())
            .then(json => {
                if (json.success) setQuestions(json.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleAnswerSubmit = async (q: any) => {
        const answerKey = answers[q.id];
        if (!answerKey || String(answerKey).trim() === '') {
            toast.error("Please select or input an answer bounds before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/v1/gate/practice/attempt/${q.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ answerKey, timeSpentMs: 45000, confidence, mistakeType: mistakeType || undefined })
            });
            const data = await res.json();
            if (data.success) {
                setEvaluations({ ...evaluations, [q.id]: data.data });
                setMistakeType('');
                setConfidence('HIGH');
                toast.success("Answer securely mapped against logic bounds.");
            } else {
                toast.error("Evaluation failed constraints.");
            }
        } catch (e) {
            toast.error("Network disruption.");
        }
        setSubmitting(false);
    };

    const handleBookmark = async (id: string) => {
        try {
            await fetch(`/api/v1/gate/questions/${id}/bookmark`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success("Question permanently booked to Revision Database.");
        } catch (e) {
            toast.error("Bookmark sync disruption.");
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 min-h-[80vh] flex flex-col justify-center items-center">
                <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Initializing AI Practice Target</h2>
                <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-pulse rounded-full" style={{ width: '60%' }}></div>
                </div>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center min-h-[60vh] flex flex-col justify-center items-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4 text-4xl">📭</div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Workspace Exthausted</h2>
                <p className="text-gray-500 mb-6">No verified Questions available globally matching your DAG metrics.</p>
                <button onClick={() => navigate('/gate')} className="bg-indigo-600 px-6 py-2 rounded-xl text-white font-bold hover:bg-indigo-700">Return to Profile</button>
            </div>
        );
    }

    const q = questions[currentIndex];
    const evalData = evaluations[q.id];

    return (
        <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 sm:px-6 min-h-screen flex flex-col">

            {/* HEADER & METADATA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-600/30">
                        <PlaySquare size={20} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Intelligence Engine</h1>
                </div>

                {/* PROGRESS PAGINATION */}
                <div className="flex items-center space-x-1 sm:bg-white sm:dark:bg-gray-800 sm:px-3 sm:py-1.5 rounded-full sm:shadow-sm sm:border border-gray-100 dark:border-gray-700">
                    {questions.map((_, idx) => (
                        <div key={idx} onClick={() => setCurrentIndex(idx)}
                            className={`h-2.5 rounded-full transition-all cursor-pointer ${idx === currentIndex ? 'w-8 bg-indigo-600' : evaluations[questions[idx].id] ? 'w-2.5 bg-gray-400 dark:bg-gray-600' : 'w-2.5 bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                    <span className="ml-3 text-xs font-black text-gray-500">{currentIndex + 1} / {questions.length}</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 sm:p-8 flex flex-col">

                    {/* SOURCE PROVENANCE TAG (STRICT VERIFICATION) */}
                    {!q.isOfficial && q.status !== 'VERIFIED' && (
                        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-200 text-xs font-bold p-3 rounded-xl flex items-start">
                            <AlertTriangle size={16} className="mr-2 shrink-0 mt-0.5" />
                            <span><strong>NOTICE: Synthetic Configuration.</strong> Not an official GATE PYQ. Evaluated via algorithmic fallback logic.</span>
                        </div>
                    )}

                    {/* Q METADATA BAR */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl mb-8 border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-wrap space-x-2 text-xs font-black uppercase tracking-widest text-gray-500">
                            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-200/50">
                                {q.questionType}
                            </span>
                            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200/50">
                                +{q.marks} Marks
                            </span>
                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg">
                                Diff: {q.difficulty}
                            </span>
                        </div>
                        <button onClick={() => handleBookmark(q.id)} className="group flex items-center text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors uppercase tracking-widest">
                            <Bookmark size={14} className="mr-1.5 group-hover:fill-current" /> Bookmark
                        </button>
                    </div>

                    {/* QUESTION CONTENT */}
                    <div className="text-lg sm:text-xl text-gray-800 dark:text-gray-200 mb-8 whitespace-pre-wrap font-medium leading-relaxed leading-[1.7]">{q.content}</div>

                    <div className="mt-auto">
                        {/* NAT INPUT */}
                        {q.questionType === 'NAT' && !evalData && (
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Numerical Value</label>
                                <input type="number" step="0.01" className="w-full sm:w-64 p-4 text-center border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-2xl font-black focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all"
                                    placeholder="0.00" value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
                            </div>
                        )}

                        {/* MSQ CHECKBOXES */}
                        {q.questionType === 'MSQ' && !evalData && q.options && (
                            <div className="mb-8 space-y-3">
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Select Multiple Responses</label>
                                {q.options.map((opt: any, i: number) => {
                                    const currentStr = answers[q.id] || "";
                                    const char = String.fromCharCode(65 + i);
                                    const isSelected = currentStr.includes(char);
                                    return (
                                        <label key={i} className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800/80'}`}>
                                            <input type="checkbox" className="mt-1 mr-4 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all" checked={isSelected}
                                                onChange={() => {
                                                    let newAns = currentStr.split(',').filter(Boolean);
                                                    if (isSelected) newAns = newAns.filter((c: string) => c !== char);
                                                    else newAns.push(char);
                                                    setAnswers({ ...answers, [q.id]: newAns.sort().join(',') });
                                                }} />
                                            <div className="flex-1 pt-0.5">
                                                <span className="font-extrabold mr-2 opacity-60 text-sm tracking-wider">{char}.</span> {opt}
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        )}

                        {/* MCQ RADIOS */}
                        {q.questionType === 'MCQ' && !evalData && q.options && (
                            <div className="mb-8 space-y-3">
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Select Single Response</label>
                                {q.options.map((opt: any, i: number) => {
                                    const char = String.fromCharCode(65 + i);
                                    const isSelected = answers[q.id] === char;
                                    return (
                                        <label key={i} className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800/80'}`}>
                                            <input type="radio" name={`mcq_${q.id}`} className="mt-1 mr-4 h-5 w-5 border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={isSelected}
                                                onChange={() => setAnswers({ ...answers, [q.id]: char })} />
                                            <div className="flex-1 pt-0.5">
                                                <span className="font-extrabold mr-2 opacity-60 text-sm tracking-wider">{char}.</span> {opt}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {/* ACTIONS & EVALUATION */}
                        <AnimatePresence mode="wait">
                            {!evalData ? (
                                <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                        <select className="flex-1 bg-white dark:bg-gray-800 border-none rounded-xl p-3 sm:p-4 text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={confidence} onChange={e => setConfidence(e.target.value)}>
                                            <option value="HIGH">High Confidence Matrix</option>
                                            <option value="LOW">Low Certainty (Guessing Bounds)</option>
                                        </select>
                                        <select className="flex-1 bg-white dark:bg-gray-800 border-none rounded-xl p-3 sm:p-4 text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={mistakeType} onChange={e => setMistakeType(e.target.value)}>
                                            <option value="">-- (Optional) Error Class --</option>
                                            <option value="CONCEPTUAL">I don't know the core concept</option>
                                            <option value="CALCULATION">Silly calculation mistake</option>
                                            <option value="READING">Misread the question bounds</option>
                                            <option value="TIME_PRESSURE">Rushed due to time</option>
                                        </select>
                                    </div>
                                    <button onClick={() => handleAnswerSubmit(q)} disabled={submitting}
                                        className="w-full relative inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-75 disabled:cursor-not-allowed">
                                        {submitting ? <Loader2 className="animate-spin" size={24} /> : "Submit To Intelligence Engine"}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div key="eval" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 sm:p-8 rounded-3xl ${evalData.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/30'} border-2 shadow-sm`}>
                                    <div className="flex items-center mb-4">
                                        {evalData.isCorrect ? <CheckCircle2 size={32} className="text-emerald-500 mr-3 shrink-0" /> : <XCircle size={32} className="text-rose-500 mr-3 shrink-0" />}
                                        <div>
                                            <h3 className={`font-black tracking-tight text-2xl ${evalData.isCorrect ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                                                {evalData.isCorrect ? 'Correct Path' : 'Incorrect Topology'}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-6">
                                        Calculated Yield: <strong className={`text-base font-black px-2 py-1 rounded bg-white dark:bg-gray-800 shadow-sm border ${evalData.earnedMarks > 0 ? 'text-emerald-600' : 'text-rose-600'} dark:border-gray-700`}>{evalData.earnedMarks?.toFixed(2)}</strong> marks.
                                    </p>

                                    {!evalData.isCorrect && evalData.suggestedMistakeCategory && !mistakeType && (
                                        <div className="flex items-start bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 p-4 font-bold rounded-xl mb-6 shadow-sm">
                                            <Zap size={18} className="mr-2 mt-0.5 shrink-0" />
                                            System detected: {evalData.suggestedMistakeCategory} bias. Use tracking overrides to log explicitly.
                                        </div>
                                    )}

                                    {/* REPEATED ERROR INTELLIGENCE TARGETS */}
                                    {evalData.recommendations && evalData.recommendations.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800 border-2 border-rose-100 dark:border-rose-900 p-5 rounded-2xl mb-6 shadow-sm">
                                            <h4 className="flex items-center text-rose-800 dark:text-rose-400 text-sm font-black uppercase tracking-wider mb-3">
                                                <AlertTriangle size={16} className="mr-2" /> Error Core Detected
                                            </h4>
                                            <ul className="space-y-2">
                                                {evalData.recommendations.map((rec: string, i: number) => (
                                                    <li key={i} className="text-gray-700 dark:text-gray-300 font-medium text-sm flex items-start">
                                                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 mr-2 shrink-0 border border-rose-200"></span> {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                                        <span className="flex items-center text-gray-400 font-bold uppercase tracking-widest text-xs mb-3">
                                            <FileText size={14} className="mr-2" /> Logical Override Explanation
                                        </span>
                                        {evalData.explanation || "No explanation bounds provided for this node block."}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* NAVIGATION CONTROLS */}
            <div className="flex justify-between items-center mt-6">
                <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}
                    className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold disabled:opacity-30 p-2 transition-colors">
                    <ChevronLeft size={20} className="mr-1" /> Back
                </button>
                <div className="flex-1 text-center">
                    <button onClick={() => navigate('/gate')} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Suspend Session</button>
                </div>
                <button disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold disabled:opacity-30 p-2 transition-colors">
                    Next <ChevronRight size={20} className="ml-1" />
                </button>
            </div>

        </div>
    );
}
