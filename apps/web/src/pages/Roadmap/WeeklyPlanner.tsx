import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Spinner } from '@/components/ui/Loader';
import { roadmapApi } from '@/api/roadmap.api';

export function WeeklyPlanner() {
  const { data: planner, isLoading } = useQuery({
    queryKey: ['weeklyPlanner'],
    queryFn: roadmapApi.getWeeklyPlanner,
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const completionPct = Math.round(((planner?.completedHours ?? 4.5) / (planner?.estimatedHours ?? 10)) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Breadcrumb />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary-500" />
          Smart Weekly Learning Planner
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Automatically balanced Monday-Sunday study schedule based on your target learning pace.
        </p>
      </div>

      {/* Overview Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Week #{planner?.weekNumber ?? 1} Goal Progress</h3>
              <p className="text-xs text-slate-500">
                Completed {planner?.completedHours ?? 4.5}h of {planner?.estimatedHours ?? 10}h target
              </p>
            </div>
            <span className="text-2xl font-extrabold text-primary-600">{completionPct}%</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Monday-Sunday Days Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {planner?.days.map((day) => (
          <Card key={day.day} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">{day.day}</CardTitle>
                <Badge variant={day.status === 'COMPLETED' ? 'success' : day.status === 'IN_PROGRESS' ? 'warning' : 'default'}>
                  {day.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{day.task}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5 text-primary-500" />
                <span>Est: {day.hours} hours</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
