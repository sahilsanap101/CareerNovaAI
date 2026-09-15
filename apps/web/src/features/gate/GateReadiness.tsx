import { useState, useEffect } from 'react';
import { gateApi, type GateReadinessResponse } from './api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Target, Activity, CheckCircle, Database } from 'lucide-react';

export function GateReadiness() {
    const [readiness, setReadiness] = useState<GateReadinessResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHow, setShowHow] = useState(false);

    useEffect(() => {
        const fetchReadiness = async () => {
            try {
                setLoading(true);
                const data = await gateApi.getGateReadiness();
                setReadiness(data);
            } catch (err: any) {
                if (err?.response?.status !== 404) {
                    setError("Unable to load your readiness assessment right now. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchReadiness();
    }, []);

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader /></div>;
    }

    if (error) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex justify-center text-center">
                <p className="text-red-500 font-medium">{error}</p>
            </div>
        );
    }

    if (!readiness) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center h-[50vh]">
                <Activity className="w-12 h-12 text-slate-400 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Preparation Readiness</h1>
                <p className="text-slate-500 max-w-md">No preparation data recorded. Start recording activity to see your assessment.</p>
            </div>
        );
    }

    const { dimensions, overallScore, overallStatus, dataCoverage, generatedAt, observations } = readiness;

    const renderDimension = (title: string, dim: { score: number | null, basis: string }) => {
        return (
            <Card className="p-6 border flex flex-col justify-between">
                <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</h3>
                    <div className="flex items-center gap-2 mb-4">
                        {dim.score !== null ? (
                            <>
                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{Math.round(dim.score)}</span>
                                <span className="text-slate-500 font-medium text-sm">/ 100</span>
                            </>
                        ) : (
                            <span className="text-sm font-medium text-slate-500 italic">Not enough data</span>
                        )}
                    </div>
                </div>
                <div className="mt-auto">
                    <p className="text-xs text-slate-500">Basis:</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1 leading-tight">{dim.basis}</p>
                </div>
            </Card>
        );
    };

    const validScores = Object.entries(dimensions)
        .filter(([_, dim]) => dim.score !== null)
        .map(([key, dim]) => ({ key, score: dim.score as number }))
        .sort((a, b) => a.score - b.score);

    const dimNames: Record<string, string> = {
        topicProgress: 'Topic Progress',
        studyConsistency: 'Study Consistency',
        practiceActivity: 'Practice Activity',
        practiceAccuracy: 'Practice Accuracy',
        mockPerformance: 'Mock Performance',
        mistakeManagement: 'Mistake Management',
        revisionDiscipline: 'Revision Discipline'
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <Target className="w-8 h-8 text-primary-500" />
                    Preparation Readiness
                </h1>
                <p className="text-slate-500 mt-2">Based on your recorded CareerNova preparation data.</p>
            </div>

            {/* Overall Score */}
            <Card className="p-8 border-2 border-primary-50 dark:border-primary-900/20 bg-primary-50/30 dark:bg-slate-800/50 flex flex-col items-center justify-center text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Preparation Readiness</h2>
                {overallScore !== null ? (
                    <>
                        <div className="flex items-end gap-2 justify-center mb-2">
                            <span className="text-5xl font-extrabold text-primary-600 dark:text-primary-400">{Math.round(overallScore)}</span>
                            <span className="text-xl font-bold text-slate-400 pb-1">/ 100</span>
                        </div>
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 capitalize">{overallStatus}</p>
                        <p className="text-sm text-slate-500 mt-3 max-w-md">Based on {dataCoverage} of 7 available preparation signals.</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto italic">These bands describe your recorded preparation signals; they are not official GATE qualification thresholds.</p>
                    </>
                ) : (
                    <>
                        <p className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-2">Building your readiness profile</p>
                        <p className="text-sm text-slate-500 max-w-md">Record more study, practice, revision, and mock activity to generate a broader assessment.</p>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Data Coverage: {dataCoverage}/7 dimensions</p>
                    </>
                )}
            </Card>

            {/* Dimensions Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-slate-500" />
                    Readiness Signals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {renderDimension('Topic Progress', dimensions.topicProgress)}
                    {renderDimension('Study Consistency (28d)', dimensions.studyConsistency)}
                    {renderDimension('Practice Activity (28d)', dimensions.practiceActivity)}
                    {renderDimension('Practice Accuracy', dimensions.practiceAccuracy)}
                    {renderDimension('Mock Performance', dimensions.mockPerformance)}
                    {renderDimension('Mistake Management', dimensions.mistakeManagement)}
                    {renderDimension('Revision Discipline', dimensions.revisionDiscipline)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Observations */}
                {observations.length > 0 && (
                    <Card className="p-6 border">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-amber-500" />
                            Data-Driven Observations
                        </h2>
                        <ul className="space-y-3">
                            {observations.map((obs, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{obs}</p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Lowest signals */}
                {validScores.length > 0 && (
                    <Card className="p-6 border">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Lowest recorded readiness signals</h2>
                        <ul className="space-y-4">
                            {validScores.slice(0, 3).map((item, i) => (
                                <li key={item.key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</span>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{dimNames[item.key]}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-500">{Math.round(item.score)}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}
            </div>

            {/* How it works */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button variant="ghost" onClick={() => setShowHow(!showHow)} className="text-slate-500 w-full justify-between">
                    <span>How this assessment is calculated</span>
                    <span>{showHow ? 'Hide' : 'Show'} details</span>
                </Button>
                {showHow && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        <p className="mb-2">This assessment is entirely deterministic. It reads your recorded activity out of the platform exactly as configured natively.</p>
                        <p className="mb-2"><strong>Rule 1:</strong> It does NOT use artificial intelligence or predict your chances of qualifying the GATE exam.</p>
                        <p className="mb-2"><strong>Rule 2:</strong> Dimensions default to <em>Not enough data</em> safely instead of reporting 0% if nothing is logged within that specific sector (e.g no practice tests taken).</p>
                        <p><strong>Rule 3:</strong> The overall score averages only the dimensions providing non-null answers. 3 valid signals are strictly required to unblur the overall dashboard.</p>
                    </div>
                )}
                <p className="text-xs text-slate-400 mt-4 text-center pb-8 border-b italic">
                    Based on your recorded data. Last updated: {new Date(generatedAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}
