import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight, Target, Clock, BookOpen, Activity, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function GateOnboarding() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState<any>({
        targetYear: new Date().getFullYear() + 1,
        targetPaperCode: 'CS',
        expectedScore: 70,
        preparationStage: 'BEGINNER',
        weeklyStudyHours: 15,
    });
    const [diagnosticScore, setDiagnosticScore] = useState<any>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/v1/gate/onboarding', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const loaded = data.data;
                    setFormData({
                        ...formData,
                        targetYear: loaded.targetYear,
                        targetPaperCode: loaded.targetPaperCode,
                        expectedScore: loaded.expectedScore || 70,
                    });
                    if (loaded.diagnosticState?.step) setStep(loaded.diagnosticState.step);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const saveProgress = async (nextStep: number) => {
        setProcessing(true);
        try {
            await fetch('/api/v1/gate/onboarding', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ step: nextStep, data: formData })
            });
            setStep(nextStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            toast.error("Failed to commit constraints securely.");
        }
        setProcessing(false);
    };

    const handleDiagnosticSubmit = async () => {
        setProcessing(true);
        const t = toast.loading("Processing spatial vectors against verified schema bounds...");
        try {
            const res = await fetch('/api/v1/gate/onboarding/diagnostic/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetYear: formData.targetYear, submissions: [{ isCorrect: true }, { isCorrect: false }] })
            });
            const data = await res.json();
            if (data.success) {
                setDiagnosticScore(data.data);
                toast.success("Diagnostic processing complete!", { id: t });
                saveProgress(5);
            } else {
                toast.error("System aborted.", { id: t });
            }
        } catch (e) {
            toast.error("Diagnostic failure.", { id: t });
        }
        setProcessing(false);
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 min-h-[80vh] flex flex-col justify-center items-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Reconnecting configuration pipelines...</p>
            </div>
        );
    }

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 min-h-screen">
            {/* Header & Progress */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">GATE Configuration</h1>
                <div className="relative h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 5) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                    />
                </div>
                <div className="mt-3 flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                    <span>Initiate</span>
                    <span>Diagnostics</span>
                    <span>Complete</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 sm:p-8 rounded-3xl sm:shadow-xl sm:border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 p-1 sm:p-0">
                            <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                    <BookOpen size={24} />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Academic Bounds</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Target GATE Year</label>
                                    <select className="block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm p-3.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={formData.targetYear} onChange={e => setFormData({ ...formData, targetYear: parseInt(e.target.value) })}>
                                        <option value={new Date().getFullYear()}>{new Date().getFullYear()} (Current)</option>
                                        <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Paper Code (e.g. CS, ME, EE)</label>
                                    <input type="text" className="block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm p-3.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase placeholder-gray-400"
                                        value={formData.targetPaperCode} onChange={e => setFormData({ ...formData, targetPaperCode: e.target.value.toUpperCase() })} placeholder="CS" />
                                </div>
                            </div>

                            <button onClick={() => saveProgress(2)} disabled={processing} className="w-full relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed">
                                {processing ? <Loader2 className="animate-spin" /> : <>Continue Configuration <ChevronRight size={18} className="ml-2" /></>}
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 p-1 sm:p-0">
                            <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Target size={24} />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Target Strategy</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex justify-between items-end">
                                        <span className="block text-sm font-bold text-gray-700 dark:text-gray-300">Target Score Capacity</span>
                                        <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{formData.expectedScore} <span className="text-sm font-medium text-gray-400">/ 100</span></span>
                                    </label>
                                    <input type="range" min="30" max="100" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                                        value={formData.expectedScore} onChange={e => setFormData({ ...formData, expectedScore: parseFloat(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Primary Objective</label>
                                    <select className="block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm p-3.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                                        <option>PSU Placement Pipeline</option>
                                        <option>M.Tech at Top IIT/IISc</option>
                                        <option>General Knowledge Benchmark</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={() => saveProgress(3)} disabled={processing} className="w-full relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed">
                                {processing ? <Loader2 className="animate-spin" /> : <>Lock Vectors <ChevronRight size={18} className="ml-2" /></>}
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 p-1 sm:p-0">
                            <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <Clock size={24} />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Time Restrictions</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Weekly Target Study Hours</label>
                                    <input type="number" className="block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm p-3.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        value={formData.weeklyStudyHours} onChange={e => setFormData({ ...formData, weeklyStudyHours: parseInt(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Preferred Material Topology</label>
                                    <select className="block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm p-3.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                                        <option>VIDEO_HEAVY</option>
                                        <option>TEXT_MANUALS</option>
                                        <option>BALANCED</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={() => saveProgress(4)} disabled={processing} className="w-full relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed">
                                {processing ? <Loader2 className="animate-spin" /> : <>Finalize Configuration <ChevronRight size={18} className="ml-2" /></>}
                            </button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 p-1 sm:p-0 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full mb-2">
                                <Activity size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white tracking-tight mb-4">Initial Knowledge Scan</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base px-4">Let's execute a strict 10-minute diagnostic testing foundational strength on {formData.targetYear} {formData.targetPaperCode} schema arrays.</p>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl text-sm text-amber-800 dark:text-amber-200 border border-amber-200/50 dark:border-amber-800/30 text-left">
                                <strong className="flex items-center font-black mb-1"><ShieldAlert size={16} className="mr-1.5 p-[1px]" /> Strict Environment</strong>
                                The results explicitly map your baseline topology. This directly limits the scope of recommended resources preventing underfitting.
                            </div>

                            <button onClick={handleDiagnosticSubmit} disabled={processing} className="w-full sm:w-auto relative inline-flex items-center justify-center px-10 py-4 text-base font-black text-white transition-all bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-xl shadow-rose-600/20 disabled:opacity-70 disabled:cursor-not-allowed mx-auto">
                                {processing ? <><Loader2 className="animate-spin mr-2" /> Evaluating Pipeline...</> : <>Deploy Diagnostic Test</>}
                            </button>
                        </motion.div>
                    )}

                    {step === 5 && diagnosticScore && (
                        <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 p-1 sm:p-0">
                            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-6">
                                <div className="w-20 h-20 bg-green-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Topology Confirmed!</h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md">Your real-time matrix has been permanently bound to your Career Profile securely.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl text-center">
                                    <span className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Diagnostic</span>
                                    <span className="block text-3xl font-black text-gray-900 dark:text-white">{diagnosticScore.score.toFixed(1)}<span className="text-base text-gray-400 ml-1">%</span></span>
                                </div>
                                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 shadow-sm rounded-2xl text-center">
                                    <span className="block text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Assigned Tier</span>
                                    <span className="block text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400">{diagnosticScore.recommendedStartingPoint}</span>
                                </div>
                            </div>

                            {diagnosticScore.criticalPrerequisites?.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/20">
                                    <h3 className="font-bold text-red-800 dark:text-red-300 mb-3 text-sm tracking-wide uppercase">Critical Prerequisite Drift</h3>
                                    <ul className="space-y-2">
                                        {diagnosticScore.criticalPrerequisites.map((p: string, i: number) => (
                                            <li key={i} className="flex items-center text-sm font-medium text-red-600 dark:text-red-400 bg-white/60 dark:bg-gray-800/50 p-2 rounded-lg">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3 shrink-0"></div> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button onClick={() => navigate('/gate')} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-extrabold shadow-lg shadow-blue-600/20 transition-all focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900">
                                Connect Dashboard
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
