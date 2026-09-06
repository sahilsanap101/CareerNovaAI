import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Info,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';

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
            <Sparkles className="h-3.5 w-3.5 text-primary-400" />
            BYSER Recommendation Engine v3.0
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Your Top 5 Explainable Career Matches</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Deterministically evaluated against 38 technical skills, domain interests, portfolio projects, academic CGPA, and career goals.
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
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-xs text-slate-400">BYSER Score</span>
                  <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{rec.totalScore}/100</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Confidence</span>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-1">{rec.confidence}%</p>
                </div>
              </div>

              {/* Salary & Demand */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Avg Salary: <strong className="text-slate-800 dark:text-slate-200">{rec.careerPath?.averageSalary || 'N/A'}</strong></span>
                <span>Growth: <strong className="text-green-600">{rec.careerPath?.growthRate || 'N/A'}</strong></span>
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
                <p className="text-xs text-slate-500">{selectedRec.careerPath?.category} • Demand: {selectedRec.careerPath?.demandLevel}</p>
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

            {/* Missing Skills Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Missing Required Skills & Priority</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRec.explanation?.missingSkills?.map((ms) => (
                  <Badge
                    key={ms.id}
                    variant={ms.priority === 'HIGH' ? 'error' : ms.priority === 'MEDIUM' ? 'warning' : 'default'}
                    className="py-1 px-2.5"
                  >
                    {ms.name} ({ms.priority} Priority)
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
