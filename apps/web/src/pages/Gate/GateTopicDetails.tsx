import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Network, Lock, Unlock, NetworkIcon, CheckCircle, ChevronRight, Activity, Percent } from 'lucide-react';

export function GateTopicDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [topo, setTopo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/v1/gate/topics/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(json => {
                if (json.success) setTopo(json.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-6">
                <div className="flex items-center space-x-2 text-gray-400 mb-6">
                    <ArrowLeft size={16} /><span>Return</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 w-1/3 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 w-2/3 rounded-md mb-8"></div>
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 w-full rounded-2xl mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!topo) return (
        <div className="p-12 text-center text-red-500 font-bold flex flex-col items-center">
            <Network size={48} className="mb-4 opacity-50" />
            Failed to load topic hierarchy. Broken topological edge.
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
            <button onClick={() => navigate(-1)} className="group text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 mb-6 font-bold flex items-center transition-colors">
                <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Syllabus Navigation
            </button>

            <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-3xl shadow-xl shadow-blue-900/5 sm:border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <NetworkIcon size={180} />
                </div>

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-8 relative z-10">
                    <div className="mb-6 sm:mb-0">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                            <span>Syllabus Node</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">{topo.title}</h1>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">{topo.description || "Core GATE Subject Topic."}</p>
                    </div>
                    <div className="flex bg-blue-50 dark:bg-gray-900 border border-blue-100 dark:border-gray-700 rounded-2xl p-4 min-w-[140px] flex-col items-center justify-center">
                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Bounded Mastery</span>
                        <div className="flex items-center text-3xl font-black text-blue-600 dark:text-blue-500">
                            {topo.mastery.toFixed(1)}<Percent size={18} strokeWidth={4} className="ml-0.5 opacity-50" />
                        </div>
                    </div>
                </div>

                {/* ALGORITHM ASSESSMENT */}
                <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 flex flex-col sm:flex-row items-start relative z-10">
                    <div className="mb-4 sm:mb-0 sm:mr-6 bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-2xl p-4 text-center min-w-[100px] flex-shrink-0">
                        <span className="block text-[10px] uppercase font-bold opacity-80 tracking-widest mb-1">Priority</span>
                        <span className="block text-3xl font-black">{topo.priority.priorityScore.toFixed(0)}</span>
                    </div>
                    <div className="pt-2">
                        <h3 className="font-extrabold text-indigo-900 dark:text-indigo-200 text-lg flex items-center mb-1">
                            <Activity size={18} className="mr-2" /> Algorithmic Assessment
                        </h3>
                        <p className="text-indigo-700/80 dark:text-indigo-300/80 text-sm font-medium leading-relaxed whitespace-pre-line">
                            {topo.priority.explanation}
                        </p>
                    </div>
                </div>

                {/* DIRECTED ACYCLIC GRAPH BOUNDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {/* REQUIRES (PREREQUISITES) */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs font-black mb-5 flex items-center">
                            <Lock size={14} className="mr-2 text-rose-500" /> Required Foundations
                        </h3>
                        {topo.prerequisitesGateTarget && topo.prerequisitesGateTarget.length > 0 ? (
                            <ul className="space-y-3">
                                {topo.prerequisitesGateTarget.map((req: any, i: number) => (
                                    <li key={i} onClick={() => navigate(`/gate/topics/${req.prereqTopic.id}`)}
                                        className="group cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-rose-200 dark:hover:border-rose-900 transition-all flex items-center justify-between">
                                        <div>
                                            <span className="block font-bold text-sm text-gray-900 dark:text-white transition-colors">{req.prereqTopic.title}</span>
                                            <span className="block text-[11px] font-bold text-rose-500 mt-1 uppercase tracking-wider">Dependency Constraint</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <CheckCircle size={28} className="text-emerald-500 mb-2" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Root Node</span>
                                <span className="text-xs text-gray-500 mt-1">No prerequisites. Safe to execute.</span>
                            </div>
                        )}
                    </div>

                    {/* UNLOCKS (DEPENDENT NODES) */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs font-black mb-5 flex items-center">
                            <Unlock size={14} className="mr-2 text-emerald-500" /> Downstream Nodes
                        </h3>
                        <div className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 text-xs font-extrabold p-3 rounded-xl mb-5 inline-flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                            Unlocks {topo.downstreamNodesUnlocked} topic matrices
                        </div>

                        {topo.prerequisitesGatePrereq && topo.prerequisitesGatePrereq.length > 0 ? (
                            <ul className="space-y-3">
                                {topo.prerequisitesGatePrereq.map((dep: any, i: number) => (
                                    <li key={i} onClick={() => navigate(`/gate/topics/${dep.targetTopic.id}`)}
                                        className="group cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-900 transition-all flex items-center justify-between">
                                        <div>
                                            <span className="block font-bold text-sm text-gray-900 dark:text-white transition-colors">{dep.targetTopic.title}</span>
                                            <span className="block text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Blocked by Current Node</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <Activity size={28} className="text-gray-400 mb-2" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Terminal Node</span>
                                <span className="text-xs text-gray-500 mt-1">Leaf endpoint in standard syllabus.</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
