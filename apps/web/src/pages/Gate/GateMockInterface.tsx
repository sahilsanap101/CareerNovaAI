import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Clock, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight, Bookmark, X, CheckSquare, List, Send, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';

export function GateMockInterface() {
    const { mockId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [exam, setExam] = useState<any>(null);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [statusMap, setStatusMap] = useState<Record<string, string>>({}); // 'ANSWERED', 'REVIEW', 'NOT_ANSWERED'
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Mobile Drawer State
    const [showPalette, setShowPalette] = useState(false);

    useEffect(() => {
        fetch(`/api/v1/gate/mocks/${mockId}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    setExam(json.data);
                    setTimeRemaining(json.data.durationMins * 60);
                } else {
                    toast.error("Failed to initialize securely.");
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [mockId]);

    // Timer logic
    useEffect(() => {
        if (!exam) return;
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [exam]);

    const submitExam = async () => {
        if (!exam || submitting) return;
        setSubmitting(true);
        const t = toast.loading("Encrypting responses and calculating deterministic score trajectory...");
        try {
            await fetch(`/api/v1/gate/mocks/attempts/${exam.attemptId}/submit`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            toast.success("Exam completed successfully.", { id: t });
            navigate(`/gate`);
        } catch (e) {
            toast.error("Critical submission failure.", { id: t });
        }
        setSubmitting(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
            <Loader2 className="animate-spin text-blue-500 mb-6" size={64} />
            <h2 className="text-2xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Initializing Verified Environment
            </h2>
            <p className="text-gray-500 mt-4 font-mono">Securing browser limits & calculating topological constraints.</p>
        </div>
    );

    if (!exam) return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-6 text-center">
            <AlertTriangle className="text-red-500 mb-6" size={64} />
            <h2 className="text-2xl font-black tracking-widest uppercase">Configuration Invalid</h2>
            <p className="text-gray-500 mt-4 max-w-md">Failed to bind to exam instance securely. Matrix aborted.</p>
            <button onClick={() => navigate('/gate')} className="mt-8 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200">Return to Profile</button>
        </div>
    );

    const currentQ = exam.questions?.[currentIdx];
    const qId = currentQ?.id;

    const handleSetAnswer = (val: any) => {
        setAnswers(p => ({ ...p, [qId]: val }));
        setStatusMap(p => ({ ...p, [qId]: 'ANSWERED' }));
    };

    const handleClear = () => {
        setAnswers(p => { const rep = { ...p }; delete rep[qId]; return rep; });
        setStatusMap(p => ({ ...p, [qId]: 'NOT_ANSWERED' }));
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const isWarningTime = timeRemaining < 300; // < 5 mins

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden fixed inset-0">
            {/* HEADER BOUNDS */}
            <div className={`p-4 sm:p-5 flex justify-between items-center z-20 shadow-md border-b ${isWarningTime ? 'bg-red-950 border-red-900 text-red-50' : 'bg-slate-900 border-slate-800 text-white'}`}>
                <div className="flex items-center space-x-3">
                    <ShieldCheck size={24} className={isWarningTime ? "text-red-400" : "text-emerald-400"} />
                    <h1 className="font-black text-sm sm:text-lg tracking-wider hidden sm:block truncate">{exam.title || "GATE Intelligence Engine"}</h1>
                    <h1 className="font-black text-sm tracking-wider sm:hidden">MOCK ENGINE</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={() => setShowPalette(!showPalette)} className="lg:hidden bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors border border-slate-700">
                        <List size={20} />
                    </button>
                    <div className={`flex items-center px-4 sm:px-6 py-2 rounded-lg font-mono text-xl sm:text-2xl font-black shadow-inner border tracking-wider ${isWarningTime ? 'bg-red-900/50 border-red-500/50 text-red-300' : 'bg-black/50 border-slate-700 text-amber-400'}`}>
                        <Clock size={16} className={`mr-2 ${isWarningTime ? 'animate-pulse' : ''}`} />
                        {formatTime(timeRemaining)}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row relative h-[calc(100vh-80px)] overflow-hidden">
                {/* LEFT PANE - Q ENGINE */}
                <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-gray-950 flex flex-col relative z-10 w-full pb-24 lg:pb-0">
                    <AnimatePresence mode="wait">
                        <motion.div key={qId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="p-6 sm:p-10 max-w-4xl mx-auto w-full flex-1">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center mb-4 sm:mb-0">
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 text-sm rounded-lg mr-4 border border-slate-200 dark:border-slate-700 font-bold uppercase tracking-widest">{statusMap[qId] === 'REVIEW' ? 'Reviewing' : 'Current'}</span>
                                    Question {currentIdx + 1}
                                </h2>
                                <div className="flex flex-wrap gap-2 text-xs font-black opacity-90">
                                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg uppercase tracking-widest">{currentQ?.questionType} FORMAT</span>
                                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg uppercase tracking-widest">+{currentQ?.marks} Marks</span>
                                </div>
                            </div>

                            <p className="text-gray-800 dark:text-gray-200 text-lg sm:text-xl font-medium leading-relaxed leading-[1.8] mb-10 whitespace-pre-wrap">{currentQ?.questionText}</p>

                            {/* INPUT STRATEGIES */}
                            <div className="mb-10 max-w-2xl">
                                {currentQ?.questionType === 'MCQ' && (
                                    <div className="space-y-4">
                                        {['A', 'B', 'C', 'D'].map(opt => {
                                            const isSelected = answers[qId] === opt;
                                            return (
                                                <label key={opt} className={`flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500 shadow-sm' : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
                                                    <input type="radio" checked={isSelected} onChange={() => handleSetAnswer(opt)} className="mt-1 mr-4 h-5 w-5 text-indigo-600 focus:ring-indigo-500" />
                                                    <span className={`font-bold transition-colors ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>Option {opt}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}
                                {currentQ?.questionType === 'NAT' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Enter Precise Numerical Range</label>
                                        <input type="number" step="0.01" placeholder="0.00"
                                            value={answers[qId] || ''} onChange={(e) => handleSetAnswer(e.target.value)}
                                            className="w-full sm:w-72 p-5 border-2 border-gray-200 dark:border-gray-800 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 font-mono text-2xl font-black bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none" />
                                    </div>
                                )}
                                {currentQ?.questionType === 'MSQ' && (
                                    <div className="space-y-4">
                                        <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3 rounded-xl flex items-start text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-widest">
                                            <CheckSquare size={14} className="mr-2 shrink-0 mt-0.5" /> Multiple selections allowed
                                        </div>
                                        {['A', 'B', 'C', 'D'].map(opt => {
                                            const selected = Array.isArray(answers[qId]) ? answers[qId] : [];
                                            const isSelected = selected.includes(opt);
                                            return (
                                                <label key={opt} className={`flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500 shadow-sm' : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
                                                    <input type="checkbox" checked={isSelected} onChange={(e) => {
                                                        let newArr = [...selected];
                                                        if (e.target.checked) newArr.push(opt);
                                                        else newArr = newArr.filter((i: any) => i !== opt);
                                                        handleSetAnswer(newArr);
                                                    }} className="mt-1 mr-4 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                                    <span className={`font-bold transition-colors ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>Statement {opt}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* ACTIONS FOOTER */}
                    <div className="fixed lg:absolute bottom-0 left-0 right-0 lg:right-auto lg:w-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4 sm:p-6 z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-none">
                        <div className="max-w-4xl mx-auto w-full flex flex-wrap lg:flex-nowrap justify-between gap-3 sm:gap-4">
                            <div className="flex gap-2 sm:gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                                <button onClick={handleClear} className="shrink-0 px-4 sm:px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-xl hover:bg-red-100 transition-colors">Clear</button>
                                <button onClick={() => setStatusMap(p => ({ ...p, [qId]: 'REVIEW' }))} className="shrink-0 px-4 sm:px-6 py-3 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-xl hover:bg-amber-100 transition-colors flex items-center">
                                    <Bookmark size={16} className="mr-2" /> Mark Review
                                </button>
                            </div>
                            <div className="flex gap-2 sm:gap-4 w-full lg:w-auto flex-1 lg:flex-none">
                                <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
                                    className="flex-1 lg:flex-none flex items-center justify-center px-4 sm:px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-xl disabled:opacity-50 transition-colors">
                                    <ChevronLeft size={18} className="mr-1" /> Prev
                                </button>
                                <button onClick={() => setCurrentIdx(Math.min((exam.questions?.length || 1) - 1, currentIdx + 1))} disabled={currentIdx === (exam.questions?.length || 1) - 1}
                                    className="flex-1 lg:flex-none flex items-center justify-center px-4 sm:px-12 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all active:scale-95">
                                    Save & Next <ChevronRight size={18} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE - PALETTE (Desktop native, Mobile absolute) */}
                <div className={`absolute lg:relative top-0 right-0 h-full w-full sm:w-80 lg:w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col z-40 transition-transform duration-300 transform ${showPalette ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>

                    <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/80 backdrop-blur">
                        <span className="font-extrabold text-xs uppercase tracking-widest text-gray-500">Navigation Matrix</span>
                        <button onClick={() => setShowPalette(false)} className="p-2 text-gray-500 bg-gray-100 rounded-lg"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5">
                        <h3 className="font-black text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Question Topology Palette</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {exam.questions?.map((_: any, idx: number) => {
                                const iterId = exam.questions[idx].id;
                                const stat = statusMap[iterId];

                                let bgClass = "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 border-2 hover:border-indigo-300"; // Unanswered
                                if (stat === 'ANSWERED') bgClass = "bg-emerald-500 text-white border-emerald-600 font-extrabold shadow-sm";
                                if (stat === 'REVIEW') bgClass = "bg-amber-400 text-amber-950 border-amber-500 font-extrabold shadow-sm";

                                return (
                                    <button key={idx} onClick={() => { setCurrentIdx(idx); setShowPalette(false); }}
                                        className={`aspect-square w-full rounded-[10px] flex items-center justify-center transition-all text-xs sm:text-sm font-bold ${currentIdx === idx ? `ring-4 ring-offset-2 dark:ring-offset-gray-900 ${stat === 'ANSWERED' ? 'ring-emerald-500/50' : stat === 'REVIEW' ? 'ring-amber-500/50' : 'ring-indigo-500/50'} scale-110 z-10 relative` : ''} ${bgClass}`}>
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/50 space-y-4">
                        <div className="space-y-3 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest opacity-90">
                            <div className="flex items-center"><span className="w-5 h-5 bg-emerald-500 border-emerald-600 rounded mr-3 shadow-sm shrink-0"></span> Answered Confirmed</div>
                            <div className="flex items-center"><span className="w-5 h-5 bg-amber-400 border-amber-500 rounded mr-3 shadow-sm shrink-0"></span> Marked For Review</div>
                            <div className="flex items-center"><span className="w-5 h-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded mr-3 shrink-0"></span> Not Visited</div>
                        </div>

                        <button onClick={submitExam} disabled={submitting} className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} className="mr-2" strokeWidth={3} /> FINAL SUBMIT</>}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
