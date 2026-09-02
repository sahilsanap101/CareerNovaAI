import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Wrench, FolderGit2, Star, ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/Card';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Spinner } from '@/components/ui/Loader';
import { recommendationApi } from '@/api/recommendation.api';

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['studentAnalytics'],
    queryFn: recommendationApi.getAnalytics,
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <Breadcrumb />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary-500" />
          Engineering Career Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visual insights into your technical skills, portfolio projects, domain alignment, and readiness score.
        </p>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <CardContent>
            <p className="text-xs font-semibold text-slate-400 uppercase">Readiness Score</p>
            <p className="text-3xl font-extrabold text-primary-600 mt-1">{analytics?.readinessScore}/100</p>
            <p className="text-xs text-slate-500 mt-0.5">Overall engineering readiness</p>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Skills</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{analytics?.totalSkillsCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Assessed technical skills</p>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <p className="text-xs font-semibold text-slate-400 uppercase">Portfolio Projects</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{analytics?.projectsCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Completed project entries</p>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <p className="text-xs font-semibold text-slate-400 uppercase">Certifications</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{analytics?.certificationsCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Verified credentials</p>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Category Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Wrench className="h-4 w-4 text-primary-500" />
              Skill Distribution by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.skillCategories}>
                  <XAxis dataKey="category" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Tech Stack Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <FolderGit2 className="h-4 w-4 text-accent-500" />
              Project Technology Stack Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              {analytics?.projectTechDistribution.length === 0 ? (
                <p className="text-xs text-slate-400">No project tech stack data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.projectTechDistribution}
                      dataKey="count"
                      nameKey="technology"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ technology }) => technology}
                    >
                      {analytics?.projectTechDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths vs Weak Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-green-600">
              <Star className="h-4 w-4" />
              Core Skill Strengths (Proficiency ≥ 4/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.strengths.length === 0 ? (
              <p className="text-xs text-slate-400">Rate your skills at 4 or 5 to see strengths here.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analytics?.strengths.map((str) => (
                  <Badge key={str} variant="success" className="py-1 px-3">
                    {str}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-amber-600">
              <ShieldAlert className="h-4 w-4" />
              Weak Areas & Skill Gaps (Proficiency ≤ 2/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.weakAreas.length === 0 ? (
              <p className="text-xs text-slate-400">No low proficiency skills recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analytics?.weakAreas.map((weak) => (
                  <Badge key={weak} variant="warning" className="py-1 px-3">
                    {weak}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
