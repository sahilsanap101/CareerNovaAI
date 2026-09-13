import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, BrainCircuit, CalendarClock, AlertTriangle, ShieldCheck, CheckCircle2, FileText, Activity, Layers, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export function GateRevisionHub() {
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const fetchDashboard = () => {
        // Only trigger hard loading screen implicitly if no initial bound exists.
        if (!dashboard) setLoading(true);
        fetch('/api/v1/gate/revisions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(res => res.json())
            .then(json => {
                if (json.success) setDashboard(json.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchDashboard(); }, []);

    const handleResolve = async (id: string) => {
        setProcessing(true);
        const t = toast.loading("Marking error topology resolved...");
        try {
            await fetch(`/api/v1/gate/revisions/mistake/${id}/resolve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success("Mistake correctly excised from matrix.", { id: t });
            fetchDashboard();
        } catch (e) {
            toast.error("Network sync disrupted.", { id: t });
        }
        setProcessing(false);
    };

    const submitRevisionScore = async (topicId: string, score: number) => {
        setProcessing(true);
        const t = toast.loading("Applying spaced repetition interval bounds...");
        try {
            await fetch(`/api/v1/gate/revisions/evaluate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ topicId, performanceScore: score })
            });
            toast.success("Algorithm successfully adapted memory decay parameters.", { id: t });
            setActivePrompt(null);
            fetchDashboard();
        } catch (e) {
            toast.error("Algorithm evaluation halted.", { id: t });
        }
        setProcessing(false);
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[80vh]">
            <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
            <h2 className="text-xl font-bold dark:text-white">Mapping Memory Decay Topologies...</h2>
        </div>
    );

    const hasDue = dashboard?.dueToday?.length > 0 || dashboard?.overdue?.length > 0;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

            {/* HEADER */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BrainCircuit size={160} />
                </div>

                <div className="relative z-10 w-full mb-6 md:mb-0">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                        <Activity size={14} /><span>Spaced Repetition Algorithm</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">Revision Hub</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Dynamic spaced repetition mappings actively countering strict cognitive decay.</p>
                </div>

                {!hasDue && (
                    <div className="relative z-10 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 p-4 rounded-2xl flex items-center shadow-sm">
                        <ShieldCheck size={32} className="text-emerald-500 mr-4" />
                        <div>
                            <h3 className="font-extrabold text-emerald-900 dark:text-emerald-400">All Nodes Secure</h3>
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500/70 uppercase tracking-widest mt-0.5">No immediate bounds due</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* SPACING QUEUE */}
                <div className="space-y-6">
                    {/* OVERDUE SEQUENCE (PENALIZED) */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-rose-100 dark:border-rose-900/30 overflow-hidden relative">
                        <div className="bg-rose-50/80 dark:bg-rose-900/20 px-6 py-4 border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-rose-800 dark:text-rose-400 flex items-center">
                                <AlertTriangle size={16} className="mr-2 shrink-0" strokeWidth={3} /> Overdue Focus Penalty
                            </h2>
                            <span className="bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100 text-xs font-bold px-2 py-0.5 rounded-md">{dashboard?.overdue?.length}</span>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                            {dashboard?.overdue?.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-500">
                                    <CheckCircle2 size={32} className="mb-2 opacity-50" />
                                    <span className="font-bold text-sm tracking-wide">Perfect Pacing Bounds Maintained.</span>
                                </div>
                            ) : (
                                dashboard?.overdue?.map((item: any) => (
                                    <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="font-extrabold text-gray-900 dark:text-white mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{item.topic.title}</div>
                                                <div className="text-xs text-rose-500/80 dark:text-rose-400/80 font-bold tracking-widest uppercase">Past Review Date Boundary</div>
                                            </div>
                                            <button onClick={() => submitRevisionScore(item.topicId, 85)} disabled={processing}
                                                className="shrink-0 bg-white dark:bg-gray-800 border-2 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50">
                                                Force Clear (Mock Verify)
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* DUE TODAY */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 overflow-hidden relative">
                        <div className="bg-indigo-50/80 dark:bg-indigo-900/20 px-6 py-4 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-300 flex items-center">
                                <CalendarClock size={16} className="mr-2 shrink-0" strokeWidth={3} /> Required Sequences Today
                            </h2>
                            <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 text-xs font-bold px-2 py-0.5 rounded-md">{dashboard?.dueToday?.length}</span>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto pb-4">
                            {dashboard?.dueToday?.length === 0 ? (
                                <div className="p-8 text-center">
                                    <span className="text-gray-400 font-bold text-sm tracking-wide">Queue exhausted correctly.</span>
                                </div>
                            ) : (
                                dashboard?.dueToday?.map((item: any) => (
                                    <div key={item.id} className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                                            <div>
                                                <div className="font-extrabold text-gray-900 dark:text-white mb-1 leading-tight">{item.topic.title}</div>
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-black tracking-widest uppercase flex items-center">
                                                    <Layers size={12} className="mr-1" /> Active Streak: {item.reviewCount} iterations
                                                </div>
                                            </div>
                                            <button onClick={() => setActivePrompt(activePrompt === item.id ? null : item.id)} className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors shadow-sm">
                                                {activePrompt === item.id ? 'Cancel' : 'Evaluate Retention'}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {activePrompt === item.id && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-2">
                                                        <span className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest text-center">Assign Honest Cognitive Rating</span>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                            <button disabled={processing} onClick={() => submitRevisionScore(item.topicId, 100)} className="bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl transition-all">
                                                                <span className="block font-black text-lg">Easy</span>
                                                                <span className="block text-[10px] opacity-70 font-bold uppercase tracking-wider">Flawless Recall</span>
                                                            </button>
                                                            <button disabled={processing} onClick={() => submitRevisionScore(item.topicId, 75)} className="bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 p-3 rounded-xl transition-all">
                                                                <span className="block font-black text-lg">Good</span>
                                                                <span className="block text-[10px] opacity-70 font-bold uppercase tracking-wider">Minor Hesitation</span>
                                                            </button>
                                                            <button disabled={processing} onClick={() => submitRevisionScore(item.topicId, 30)} className="bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 p-3 rounded-xl transition-all">
                                                                <span className="block font-black text-lg">Hard</span>
                                                                <span className="block text-[10px] opacity-70 font-bold uppercase tracking-wider">Concepts Forgotten</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* MISTAKE BOOK */}
                <div className="bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full border border-gray-800">
                    <div className="bg-black/50 px-6 py-5 border-b border-gray-800 flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-100 flex items-center">
                            <Target size={18} className="mr-2 text-rose-500" strokeWidth={3} /> Authentic Mistake Log
                        </h2>
                        <span className="text-xs text-gray-500 font-bold tracking-widest">{dashboard?.mistakes?.length || 0} Open</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[800px]">
                        {dashboard?.mistakes?.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <Target size={48} className="text-gray-700 mb-4" />
                                <span className="font-bold text-gray-500">No active mistakes mapped.</span>
                                <span className="text-gray-600 text-sm mt-1">Algorithm indicates flawless execution bounds.</span>
                            </div>
                        ) : (
                            dashboard?.mistakes?.map((mistake: any) => (
                                <div key={mistake.id} className="bg-gray-800/80 rounded-2xl p-5 border border-gray-700/50 transition-colors hover:border-gray-600">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-rose-950/50 text-rose-400 border border-rose-900 text-xs font-black px-2.5 py-1 rounded shadow-sm tracking-widest">
                                            {mistake.mistakeType} ERR
                                        </span>
                                        <button onClick={() => handleResolve(mistake.id)} disabled={processing} className="text-xs font-bold text-gray-400 hover:text-emerald-400 underline decoration-gray-600 hover:decoration-emerald-400 underline-offset-4 transition-colors disabled:opacity-50">
                                            Mark Resolved
                                        </button>
                                    </div>

                                    <p className="text-gray-300 font-medium text-sm leading-relaxed mb-4 border-l-2 border-gray-700 pl-3 italic">
                                        "{mistake.question?.content.substring(0, 150)}..."
                                    </p>

                                    {mistake.notes && (
                                        <div className="bg-amber-900/10 border border-amber-900/30 rounded-xl p-3 mb-3 flex items-start">
                                            <FileText size={16} className="text-amber-500 shrink-0 mr-2 mt-0.5" />
                                            <span className="text-sm font-medium text-amber-200/90">{mistake.notes}</span>
                                        </div>
                                    )}

                                    {mistake.correctApproach && (
                                        <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-xl p-3 flex items-start mt-2">
                                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mr-2 mt-0.5" />
                                            <span className="text-sm font-medium text-emerald-200/90"><strong className="text-emerald-400">TRUTH:</strong> {mistake.correctApproach}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
