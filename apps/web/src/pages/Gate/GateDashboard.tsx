import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Target, CalendarDays, BookOpen, Activity, AlertCircle, ChevronRight, Star, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

export function GateDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/v1/gate/dashboard', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    setData(json.data);
                } else {
                    setError(json.error || 'Failed to sync diagnostic bounds.');
                }
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Skeleton Loader matching actual layout dimensions
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between border border-gray-100 dark:border-gray-700/50 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                    </div>
                    <div className="mt-4 md:mt-0 bg-gray-100 dark:bg-gray-700 h-24 w-24 rounded-2xl"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-gray-800 h-40 rounded-2xl border border-gray-100 dark:border-gray-700/50 animate-pulse flex flex-col justify-between p-6">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Meaningful Empty State for non-onboarded users
    if (!data || error) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 sm:p-12 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-6 rounded-full text-blue-600 dark:text-blue-400">
                    <Target size={48} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">No GATE Profile Detected</h2>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm sm:text-base">To generate deterministic study matrices, we need to map your exact preparation stage against verified GATE benchmarks.</p>
                </div>
                {error && (
                    <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                        <AlertCircle size={16} /><span>{error}</span>
                    </div>
                )}
                <button onClick={() => navigate('/gate/onboarding')} className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-xl shadow-blue-600/20">
                    Begin Configuration
                    <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        );
    }

    const { header, metrics, dailyRecommendation, weakAreas } = data;
    const isLegacy = header.targetYear < new Date().getFullYear();

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

                {/* DYNAMIC HEADER */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-100 dark:border-gray-700/50">
                    <div className="flex flex-col space-y-3 w-full md:w-auto">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                GATE {header.targetYear} <span className="text-blue-600 dark:text-blue-500">{header.paperCode}</span>
                            </h1>
                            {isLegacy ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 ring-1 ring-amber-500/30">
                                    <ShieldAlert size={12} className="mr-1.5 flex-shrink-0" /> Legacy Reference
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-emerald-500/20 dark:text-emerald-300 ring-1 ring-emerald-500/30">
                                    <ShieldCheck size={12} className="mr-1.5 flex-shrink-0" /> Active Profile
                                </span>
                            )}
                        </div>

                        {isLegacy && (
                            <div className="text-xs sm:text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-amber-800 dark:text-amber-200 font-medium flex items-start">
                                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                Using historical syllabus mappings. Excludes current-cycle dynamic drift vectors.
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <span className="flex items-center"><Target size={16} className="mr-1.5" /> Target: {header.targetScore}/100</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
                            <span className="flex items-center"><Activity size={16} className="mr-1.5" /> {header.preparationStage} Stage</span>
                        </div>
                    </div>

                    <div className="mt-6 md:mt-0 w-full md:w-auto bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900/50 p-5 rounded-2xl flex flex-col items-center justify-center border border-blue-100 dark:border-gray-700 shadow-inner">
                        {header.daysRemaining !== null ? (
                            <>
                                <span className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {header.daysRemaining}
                                </span>
                                <span className="mt-1 flex items-center text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    <CalendarDays size={14} className="mr-1.5" /> Days Until Exam
                                </span>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-center space-y-1">
                                <CalendarDays size={24} className="text-gray-400 mb-1" />
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Awaiting Dates</span>
                                <span className="text-xs text-gray-400">Not formally scheduled</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* METRICS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* ESTIMATE */}
                    <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 sm:p-7 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-wider flex items-center">
                                <Activity size={14} className="mr-1.5 text-blue-500" /> Projected Score
                            </h3>
                        </div>
                        {metrics.hasEnoughData ? (
                            <div className="flex items-baseline space-x-1">
                                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{metrics.estimatedScore?.toFixed(1) || '--'}</span>
                                <span className="text-gray-400 font-bold">/ 100</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <span className="text-3xl font-black text-gray-300 dark:text-gray-700 tracking-tighter">--.-</span>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed">Submit at least 2 full diagnostic constraints to unlock projections.</p>
                            </div>
                        )}
                    </div>

                    {/* OVERALL MASTERY */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 sm:p-7 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-wider flex items-center">
                                <BookOpen size={14} className="mr-1.5 text-emerald-500" /> Avg Topic Mastery
                            </h3>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                                <Star size={24} className="text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{metrics.topicMastery.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* ACTIONABLE TODAY (Gradient) */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-800 dark:to-blue-900 rounded-3xl shadow-lg border border-indigo-500/30 p-6 sm:p-7 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Zap size={64} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-indigo-200 font-bold uppercase text-xs tracking-wider mb-3 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span> Priority Sequence
                            </h3>
                            <h4 className="font-extrabold text-xl sm:text-2xl text-white leading-tight mb-2">{dailyRecommendation.actionableTask}</h4>
                            <p className="text-sm text-indigo-100/90 font-medium leading-relaxed line-clamp-2">{dailyRecommendation.details}</p>
                        </div>
                        <div className="relative z-10 mt-6 flex justify-between items-center bg-black/20 p-2 pl-4 rounded-xl backdrop-blur-sm">
                            <span className="text-sm font-bold text-white">{dailyRecommendation.duration}</span>
                            <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-extrabold shadow-sm hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-indigo-600">
                                Launch Sync
                            </button>
                        </div>
                    </div>
                </div>

                {/* BOTTOM GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* MISTAKE TOPOLOGIES */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 sm:p-8 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white flex items-center">
                                <AlertCircle size={20} className="mr-2 text-red-500" strokeWidth={2.5} /> Weak Topologies
                            </h3>
                        </div>

                        {weakAreas.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
                                <ShieldCheck size={32} className="text-emerald-500 mb-2" opacity={0.5} />
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complete more modules to project mistake categories.</p>
                            </div>
                        ) : (
                            <ul className="flex-1 flex flex-col justify-center space-y-3">
                                {weakAreas.slice(0, 4).map((w: any, idx: number) => (
                                    <li key={idx} className="group flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-default border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                                        <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-300 truncate mr-3">{w.type}</span>
                                        <span className="flex-shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300 font-extrabold text-xs">
                                            {w.count} errors
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* OPERATIONS CENTER */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 sm:p-8 flex flex-col h-full">
                        <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white mb-6">Operations Center</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                            {[
                                { title: 'Verified Syllabus', bg: 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/30', route: `/gate/${header.targetYear}` },
                                { title: 'Practice Engine', bg: 'bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30', route: '/gate/practice' },
                                { title: 'Full Mock Mapping', bg: 'bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800/30', route: '/gate/mocks' },
                                { title: 'Readiness Analytics', bg: 'bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/30', route: '/gate/readiness' },
                            ].map((btn, idx) => (
                                <button key={idx} onClick={() => navigate(btn.route)} className={`flex items-center justify-between p-4 rounded-2xl font-bold text-sm border transition-all hover:scale-[1.02] active:scale-[0.98] ${btn.bg}`}>
                                    {btn.title}
                                    <ChevronRight size={16} strokeWidth={3} className="opacity-70" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
