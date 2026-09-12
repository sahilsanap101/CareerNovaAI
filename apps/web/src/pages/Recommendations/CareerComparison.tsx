import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Layers, ArrowLeftRight, Check, X, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Spinner } from '@/components/ui/Loader';
import { recommendationApi } from '@/api/recommendation.api';

export function CareerComparison() {
  const { data: careerPaths, isLoading: loadingPaths } = useQuery({
    queryKey: ['careerPaths'],
    queryFn: recommendationApi.getCareerPaths,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const { data: comparisonData, isLoading: loadingComparison } = useQuery({
    queryKey: ['careerComparison', selectedIds],
    queryFn: () => recommendationApi.compareCareerPaths(selectedIds),
    enabled: selectedIds.length >= 2,
  });

  if (loadingPaths) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  // Format Recharts data
  const chartData = [
    { factor: 'Skills (35%)' },
    { factor: 'Interests (20%)' },
    { factor: 'Projects (15%)' },
    { factor: 'Academic (10%)' },
    { factor: 'Certifications (10%)' },
    { factor: 'Coding (5%)' },
    { factor: 'Goals (5%)' },
  ];

  if (comparisonData) {
    comparisonData.forEach((item) => {
      item.evaluation.factors?.forEach((f, idx) => {
        if (chartData[idx]) {
          (chartData[idx] as Record<string, unknown>)[item.careerPath.name] = f.score;
        }
      });
    });
  }

  const COLORS = ['#6366f1', '#a855f7', '#06b6d4'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Breadcrumb />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6 text-primary-500" />
          Side-by-Side Career Path Comparison
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select 2 or 3 career paths to evaluate required skills, salary growth, and BYSER suitability scores.
        </p>
      </div>

      {/* Select Career Paths Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Select Paths to Compare (Max 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {careerPaths?.map((cp) => {
              const isSelected = selectedIds.includes(cp.id);
              return (
                <button
                  key={cp.id}
                  onClick={() => toggleSelect(cp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isSelected
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                >
                  {cp.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {selectedIds.length < 2 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-2">
            <Sparkles className="h-8 w-8 text-primary-400 mx-auto" />
            <p className="text-sm text-slate-500">Please select at least 2 career paths above to generate side-by-side comparison.</p>
          </CardContent>
        </Card>
      ) : loadingComparison ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-6">
          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisonData?.map((item) => {
              const path = item.careerPath as typeof item.careerPath & {
                averageSalary?: string;
                growthRate?: string;
                demandLevel?: string;
              };
              return (
                <Card key={path.id} className="border-t-4 border-t-primary-500">
                  <CardHeader>
                    <CardTitle>{path.name}</CardTitle>
                    <CardDescription>{path.category}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-400">BYSER Match Score</span>
                      <p className="text-3xl font-extrabold text-primary-600">{item.evaluation.totalScore}/100</p>
                      <p className="text-xs text-slate-500 mt-1">SGI Gap: {item.evaluation.SGI}% ({item.evaluation.sgiCategory})</p>
                    </div>

                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Avg Salary:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{path.averageSalary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Growth Rate:</span>
                        <span className="font-semibold text-green-600">{path.growthRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Demand Level:</span>
                        <Badge variant="default">{path.demandLevel}</Badge>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {path.requiredSkills?.map((req) => (
                          <Badge key={req.skill.id} variant="default" className="text-xs">
                            {req.skill.name} (w:{req.importanceWeight})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Recharts Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>BYSER Factor Comparison Chart</CardTitle>
              <CardDescription>Detailed factor score comparison across selected career paths</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="factor" stroke="#888888" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#888888" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    {comparisonData?.map((item, idx) => (
                      <Bar key={item.careerPath.id} dataKey={item.careerPath.name} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
