// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, TrendingUp, AlertTriangle, ShieldCheck, Activity, Target, SlidersHorizontal, BarChart2 } from 'lucide-react';

export function GateReadinessDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scenario, setScenario] = useState<any>(null);
    const [simulating, setSimulating] = useState(false);

    // Default what-if sliders
    const [sliders, setSliders] = useState({
        masteryAvg: 0,
        pyqAccuracy: 0,
        practiceAccuracy: 0,
        consistencyScore: 0
    });

    const fetchReadiness = () => {
        setLoading(true);
        fetch('/api/v1/gate/readiness/GATE2024', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    setData(json.data);
                    if (json.data?.breakdown) {
                        setSliders({
                            masteryAvg: json.data.breakdown.masteryAvg || 0,
                            pyqAccuracy: json.data.breakdown.pyqAccuracy || 0,
                            practiceAccuracy: json.data.breakdown.practiceAccuracy || 0,
                            consistencyScore: json.data.breakdown.consistencyScore || 0
                        });
                    }
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchReadiness(); }, []);

    const runCounterfactual = async () => {
        setSimulating(true);
        try {
            const res = await fetch('/api/v1/gate/readiness/GATE2024/what-if', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ overrides: sliders })
            });
            const json = await res.json();
            if (json.success) setScenario(json.data);
        } catch (e) { }
        setSimulating(false);
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 min-h-[80vh] flex flex-col justify-center items-center">
            <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aggregating Dimensional readiness limits</h2>
            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 animate-pulse rounded-full" style={{ width: '45%' }}></div>
            </div>
        </div>
    );

    if (!data) return (
        <div className="max-w-7xl mx-auto py-12 px-4 text-center">
            <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Insufficient Data Vectors</h2>
            <p className="text-gray-500 mt-2">Cannot calculate deterministic readiness until you complete initial diagnostic limits.</p>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

            {/* HEADER */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden">
                <div className="absolute -right-8 -top-8 text-indigo-50 dark:text-gray-700/30">
                    <Activity size={180} strokeWidth={1} />
                </div>
                <div className="relative z-10 w-full">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                        <BarChart2 size={14} /><span>Matrix Engine</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Readiness Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium sm:text-lg max-w-2xl">Deterministic metrics mapping directly onto historical performance limits bounding actual statistical yield.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* OVERALL READINESS SCORE */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center relative overflow-hidden group">
                    <h3 className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-6 flex items-center">
                        <Target size={16} className="mr-2" /> Overall Formula Score
                    </h3>

                    <div className="flex flex-col items-center justify-center flex-1">
                        <div className="relative flex items-center justify-center mb-6">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle cx="96" cy="96" r="88" className="text-gray-100 dark:text-gray-700/50" strokeWidth="12" stroke="currentColor" fill="transparent" />
                                <motion.circle initial={{ strokeDashoffset: 553 }} animate={{ strokeDashoffset: 553 - (553 * data.overallReadiness) / 100 }} transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="96" cy="96" r="88" className="text-indigo-600 dark:text-indigo-400" strokeWidth="12" strokeDasharray="553" stroke="currentColor" fill="transparent" strokeLinecap="round" />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{Math.round(data.overallReadiness)}</span>
                                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Percent</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-6 border-t border-gray-100 dark:border-gray-700/50 text-left">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Official Prediction Output</h4>
                        {data.scoreEstimation.value ? (
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{Math.round(data.scoreEstimation.value)}</span>
                                    <span className="text-sm font-bold text-gray-400 ml-1">marks</span>
                                </div>
                                <div className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1.5 rounded-lg font-bold">
                                    {data.scoreEstimation.statusMessage || "Verified Estimate"}
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30">
                                <ShieldCheck size={14} className="inline mr-1" /> {data.scoreEstimation.statusMessage}
                            </div>
                        )}
                    </div>
                </div>

                {/* BREAKDOWN METRICS GRID */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: "Syllabus Extent", val: data.breakdown.syllabusCoverage, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/10" },
                        { label: "Mastery Avg", val: data.breakdown.masteryAvg, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/10" },
                        { label: "PYQ Accuracy", val: data.breakdown.pyqAccuracy, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
                        { label: "Practice Yield", val: data.breakdown.practiceAccuracy, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/10" },
                        { label: "Mock Baseline", val: data.breakdown.mockAvgPercent, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-900/10" },
                        { label: "Revision Health", val: data.breakdown.revisionHealth, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/10" },
                        { label: "Consistency", val: data.breakdown.consistencyScore, color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800" },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                            <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{stat.label}</div>
                            <div className="flex items-end justify-between">
                                <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>{Math.round(stat.val || 0)}%</div>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-4">
                                <div className={`h-1.5 rounded-full ${stat.bg.split(' ')[0].replace('bg-', 'bg-').replace('-50', '-500')}`} style={{ width: `${Math.round(stat.val || 0)}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MARKS LEAKAGE - STRICT METRICS ALIGNMENT */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-black mb-6 text-gray-900 dark:text-white flex items-center">
                    <TrendingUp size={20} className="mr-2 text-rose-500" strokeWidth={2.5} /> Error Classifications & Leakage
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    {[
                        { title: "Careless Base", val: data.marksLeakage.CARELESS, bg: "bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 border-rose-100 dark:border-rose-900/30" },
                        { title: "Calculations", val: data.marksLeakage.CALCULATION, bg: "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-100 dark:border-amber-900/30" },
                        { title: "Concepts Lost", val: data.marksLeakage.CONCEPTUAL, bg: "bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-100 dark:border-purple-900/30" },
                        { title: "Uncertainty/Guess", val: data.marksLeakage.UNCERTAIN, bg: "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600" },
                        { title: "Total Lost", val: data.marksLeakage.TOTAL, bg: "bg-gray-900 dark:bg-black text-white border-gray-800 outline outline-2 outline-offset-2 outline-gray-200 dark:outline-gray-700" }
                    ].map((leak, idx) => (
                        <div key={idx} className={`p-5 rounded-2xl border ${leak.bg} flex flex-col justify-center`}>
                            <div className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">{leak.title}</div>
                            <div className="text-2xl sm:text-3xl font-black tracking-tighter">{leak.val}m</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* COUNTERFACTUAL ENGINE */}
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 rounded-3xl shadow-2xl p-6 sm:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <SlidersHorizontal size={140} />
                </div>

                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-4 flex items-center tracking-tight">
                        <Zap size={24} className="mr-3 text-amber-400" /> Scenario Generator
                    </h2>
                    <p className="text-sm sm:text-base font-medium opacity-80 max-w-3xl mb-10 leading-relaxed">
                        Adjust independent vectors to re-engage the algorithmic constraints. This calculates bounding limits simulating your exact trajectory if you secure these adjustments ahead of the official exam cycle.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-10">
                        {/* MASTERY SLIDER */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-black uppercase tracking-widest text-indigo-200">Scale Mastery To</label>
                                <span className="text-lg font-black text-white">{Math.round(sliders.masteryAvg)}%</span>
                            </div>
                            <input type="range" min={data.breakdown?.masteryAvg || 0} max="100" value={sliders.masteryAvg} onChange={(e) => setSliders(p => ({ ...p, masteryAvg: Number(e.target.value) }))}
                                className="w-full h-3 bg-indigo-950/50 rounded-full appearance-none cursor-pointer border border-indigo-700/50 accent-amber-400" />
                        </div>

                        {/* PYQ ACCURACY SLIDER */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-black uppercase tracking-widest text-indigo-200">Scale PYQ Exactness</label>
                                <span className="text-lg font-black text-white">{Math.round(sliders.pyqAccuracy)}%</span>
                            </div>
                            <input type="range" min={data.breakdown?.pyqAccuracy || 0} max="100" value={sliders.pyqAccuracy} onChange={(e) => setSliders(p => ({ ...p, pyqAccuracy: Number(e.target.value) }))}
                                className="w-full h-3 bg-indigo-950/50 rounded-full appearance-none cursor-pointer border border-indigo-700/50 accent-amber-400" />
                        </div>

                        {/* CONSISTENCY SLIDER */}
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-black uppercase tracking-widest text-indigo-200">Consistency Hold</label>
                                <span className="text-lg font-black text-white">{Math.round(sliders.consistencyScore)}%</span>
                            </div>
                            <input type="range" min={data.breakdown?.consistencyScore || 0} max="100" value={sliders.consistencyScore} onChange={(e) => setSliders(p => ({ ...p, consistencyScore: Number(e.target.value) }))}
                                className="w-full h-3 bg-indigo-950/50 rounded-full appearance-none cursor-pointer border border-indigo-700/50 accent-amber-400" />
                        </div>
                    </div>

                    <button onClick={runCounterfactual} disabled={simulating}
                        className="bg-amber-400 hover:bg-amber-300 text-amber-900 px-8 py-4 rounded-xl font-black shadow-lg shadow-amber-400/20 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center">
                        {simulating ? <Loader2 className="animate-spin mr-2" /> : <Zap size={18} className="mr-2" strokeWidth={3} />}
                        EXECUTE DIFFERENTIAL
                    </button>

                    <AnimatePresence>
                        {scenario && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8">
                                <div className="bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-indigo-500/30">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-300 mb-1">Delta Formula Extent</div>
                                        <div className="text-3xl font-black text-emerald-400 tracking-tighter">+{scenario.deltaReadiness.toFixed(1)}<span className="text-lg">%</span></div>
                                    </div>
                                    <div className="border-t sm:border-t-0 sm:border-l border-indigo-500/30 pt-4 sm:pt-0">
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-300 mb-1">Absolute Score Cap</div>
                                        <div className="text-3xl font-black text-white tracking-tighter disabled:opacity-50">{scenario.estimatedScoreDelta !== null ? Math.round(scenario.baselineReadiness) : '--'}</div>
                                    </div>
                                    <div className="border-t sm:border-t-0 sm:border-l border-indigo-500/30 pt-4 sm:pt-0 bg-emerald-900/20 sm:bg-transparent -mx-6 sm:mx-0 -mb-6 sm:mb-0 p-6 sm:p-0 rounded-b-2xl sm:rounded-none">
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-300 mb-1">Projected Score Delta</div>
                                        <div className="text-3xl font-black text-amber-400 tracking-tighter">{scenario.estimatedScoreDelta !== null ? `+${scenario.estimatedScoreDelta.toFixed(1)}` : 'Blocked'}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
