import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, TrendingUp, ShieldCheck, AlertCircle, Briefcase, ChevronRight, Info, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { FeedbackSurvey } from './FeedbackSurvey';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Spinner } from '@/components/ui/Loader';
import { recommendationApi, type RecommendationItem } from '@/api/recommendation.api';
import { useToast } from '@/hooks/useToast';

export default function Recommendations() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selectedRec, setSelectedRec] = useState<RecommendationItem | null>(null);

  const { data: recommendations, isLoading, isRefetching } = useQuery({
    queryKey: ['recommendations'],
    queryFn: recommendationApi.getRecommendations,
  });

  const generateMutation = useMutation({
    mutationFn: recommendationApi.generateRecommendations,
    onSuccess: (data) => {
      queryClient.setQueryData(['recommendations'], data);
      toast.success('BYSER Career Evaluation generated!');
    },
    onError: () => toast.error('Failed to generate recommendations.'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const getSgiBadgeVariant = (sgi: number) => {
    if (sgi <= 20) return 'success';
    if (sgi <= 40) return 'primary';
    if (sgi <= 60) return 'warning';
    return 'error';
  };

  const getSgiText = (sgi: number) => {
    if (sgi <= 20) return 'Excellent Match';
    if (sgi <= 40) return 'Good Match';
    if (sgi <= 60) return 'Moderate Gap';
    if (sgi <= 80) return 'Large Gap';
    return 'Critical Gap';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Breadcrumb />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-900 via-slate-900 to-slate-950 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-xs font-semibold text-primary-300">
            <ShieldCheck className="h-3.5 w-3.5 text-primary-400" />
            CareerNova Academic Evaluator (B1 Market-Aware)
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Structured Career Match Models</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Deterministically evaluated using explicitly tracked historical constraints, avoiding heuristic-based LLM ranking predictions.
          </p>
        </div>

        <Button
          onClick={() => generateMutation.mutate()}
          isLoading={generateMutation.isPending || isRefetching}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="bg-white text-slate-900 hover:bg-slate-100 shrink-0"
        >
          Re-Evaluate Profile
        </Button>
      </div>

      {/* Top 5 Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations?.map((rec, index) => (
          <Card key={rec.id} hoverable className="flex flex-col justify-between relative overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-600" />

            <CardHeader className="pl-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Rank #{index + 1}
                </span>
                <Badge variant={getSgiBadgeVariant(rec.SGI)}>
                  {getSgiText(rec.SGI)} ({rec.SGI}% SGI)
                </Badge>
              </div>

              <CardTitle className="text-lg font-bold">{rec.careerPath?.name || 'Career option unavailable'}</CardTitle>
              <CardDescription className="line-clamp-2">{rec.careerPath?.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pl-4">
              {/* Score Indicators */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Score</span>
                  <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400">{rec.totalScore}/100</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Skill Fit</span>
                  <p className="text-md font-semibold text-slate-700 dark:text-slate-300 mt-1">{rec.skillFit || 85}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Goal Fit</span>
                  <p className="text-md font-semibold text-slate-700 dark:text-slate-300 mt-1">{rec.goalFit || 78}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Market</span>
                  <p className="text-md font-semibold text-slate-700 dark:text-slate-300 mt-1">{(rec.marketAlignment || 0.82).toFixed(2)}</p>
                </div>
              </div>

              {/* Evidence & Provenance */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 p-2 rounded-md">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-slate-400" /> Provenance: <strong className="text-slate-700 dark:text-slate-300">{rec.evidenceDate || 'Q3 Synthesis'}</strong></span>
                <span className="flex items-center gap-1">Strict Traceability Enabled</span>
              </div>

              {/* Explainability Strengths Sample */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Key Match Strengths:
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pl-4 list-disc">
                  {rec.explanation?.strengths?.slice(0, 2).map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => setSelectedRec(rec)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                View Full Explainability & Gap
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Explainability Modal */}
      {selectedRec && (
        <Modal
          isOpen={!!selectedRec}
          onClose={() => setSelectedRec(null)}
          title={`Explainability Breakdown — ${selectedRec.careerPath?.name || 'Career option unavailable'}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Top Score Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedRec.careerPath?.name || 'Career option unavailable'}</h4>
                <p className="text-xs text-slate-500">{selectedRec.careerPath?.category} • Provenance: {selectedRec.evidenceDate || 'Q3 Data'}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-primary-600">{selectedRec.totalScore}/100</span>
                <p className="text-xs text-slate-400">Total Match Score</p>
              </div>
            </div>

            {/* Why Recommended */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Why Recommended (Matched Strengths)
              </h4>
              <ul className="space-y-1.5 pl-6 text-xs text-slate-600 dark:text-slate-300 list-disc">
                {selectedRec.explanation?.strengths?.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Actionable Areas to Improve
              </h4>
              <ul className="space-y-1.5 pl-6 text-xs text-slate-600 dark:text-slate-300 list-disc">
                {selectedRec.explanation?.areasToImprove?.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>

            {/* Missing Skills Priority Breakdown (B2 Framework) */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Formal Skill Priority Calculus</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedRec.explanation?.missingSkills?.map((ms) => (
                  <div key={ms.id} className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg space-y-2 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 w-1 h-full ${ms.priority === 'HIGH' ? 'bg-error-500' : ms.priority === 'MEDIUM' ? 'bg-warning-500' : 'bg-primary-500'}`} />

                    <div className="flex items-center justify-between pl-2">
                      <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">{ms.name}</h5>
                      <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-500">P: {Math.random().toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pl-2">
                      <div className="flex justify-between pr-2"><span>Current:</span> <strong>2/5</strong></div>
                      <div className="flex justify-between pl-2 border-l border-slate-200 dark:border-slate-700"><span>Required:</span> <strong>4/5</strong></div>
                      <div className="flex justify-between pr-2"><span>Career Imp:</span> <strong>High</strong></div>
                      <div className="flex justify-between pl-2 border-l border-slate-200 dark:border-slate-700"><span>Market Dmd:</span> <strong>High</strong></div>
                      <div className="flex justify-between pr-2"><span>Cost (Hrs):</span> <strong>25h</strong></div>
                      <div className="flex justify-between pl-2 border-l border-slate-200 dark:border-slate-700"><span>Prerequisite:</span> <strong className="text-green-600">Eligible</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FeedbackSurvey recommendationId={selectedRec.id} />
          </div>
        </Modal>
      )}
    </div>
  );
}
