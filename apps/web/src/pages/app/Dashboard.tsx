import { Link } from 'react-router-dom';
import {
  ArrowRight,
  User,
  CheckCircle,
  Wrench,
  FolderGit2,
  Award,
  Target,
  Zap,
  Sparkles,
  ArrowLeftRight,
  BarChart3,
  Map,
  GitFork,
  Calendar,
  Bot,
  FileText,
  Mic,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useAuthStore } from '@/store/auth.store';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { formatDate } from '@pathforge/shared-utils';
import { APP_ROUTES } from '@pathforge/shared-constants';

// ─── Profile Completion Card ──────────────────────────────────────

function ProfileCompletionCard() {
  const { completion, studentData } = useStudentProfile();
  const percentage = completion?.completionPercentage ?? 0;
  const missing = completion?.missingSections ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Completion</CardTitle>
          <Badge variant={percentage === 100 ? 'success' : percentage > 50 ? 'warning' : 'error'}>
            {percentage}%
          </Badge>
        </div>
        <CardDescription>Complete your profile wizard to prepare for career recommendations.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 mb-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {missing.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Missing sections:</p>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((sec) => (
                <Badge key={sec} variant="default">{sec}</Badge>
              ))}
            </div>
            <Link to={APP_ROUTES.PROFILE}>
              <Button variant="ghost" size="sm" className="mt-2 text-primary-600 dark:text-primary-400" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                Complete Profile Wizard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Student profile is 100% complete!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────

const quickActions = [
  { label: 'AIOS Career System', href: APP_ROUTES.AI, icon: Bot, color: 'text-violet-500' },
  { label: 'Resume Intelligence', href: APP_ROUTES.RESUME_INTELLIGENCE, icon: FileText, color: 'text-purple-500' },
  { label: 'Interview Coach', href: APP_ROUTES.INTERVIEW_COACH, icon: Mic, color: 'text-rose-500' },
  { label: 'Adaptive Roadmap', href: APP_ROUTES.ROADMAP, icon: Map, color: 'text-primary-500' },
  { label: 'Top 5 Career Matches', href: APP_ROUTES.RECOMMENDATIONS, icon: Sparkles, color: 'text-sky-500' },
  { label: 'Engineering Analytics', href: APP_ROUTES.ANALYTICS, icon: BarChart3, color: 'text-emerald-500' },
];

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.href}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <a.icon className={`h-4 w-4 ${a.color}`} aria-hidden="true" />
              <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                {a.label}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuthStore();
  const { studentData } = useStudentProfile();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const skillsCount = studentData?.skills.length ?? 0;
  const projectsCount = studentData?.projects.length ?? 0;
  const certsCount = studentData?.certifications.length ?? 0;
  const targetRole = studentData?.careerGoal?.preferredJobRole || 'Not specified yet';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-center gap-4 mt-2">
        <Avatar name={user?.fullName} src={studentData?.profile?.profileImage ?? undefined} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {greeting()}, {user?.fullName?.split(' ')[0] ?? 'Student'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Overview of your engineering skills, projects, and career profile for {formatDate(new Date())}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <CardContent>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills Tracked</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{skillsCount}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Technical proficiencies</p>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projects</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{projectsCount}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Portfolio entries</p>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Certifications</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{certsCount}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Verified credentials</p>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Goal</p>
            <p className="text-sm font-bold text-primary-600 dark:text-primary-400 truncate mt-2">{targetRole}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Preferred career role</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ProfileCompletionCard />
          <QuickActions />
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Recent Skills */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary-500" />
                  Technical Skills Summary
                </CardTitle>
                <Link to={APP_ROUTES.PROFILE}>
                  <Button variant="ghost" size="sm">Manage Skills</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {studentData?.skills.length === 0 ? (
                <p className="text-sm text-slate-400">No skills added yet. Add your skills in the profile wizard.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {studentData?.skills.map((s) => (
                    <Badge key={s.id} variant="default" className="py-1 px-2.5 text-xs">
                      {s.skill.name} • Level {s.proficiency}/5
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-accent-500" />
                  Portfolio Projects
                </CardTitle>
                <Link to={APP_ROUTES.PROFILE}>
                  <Button variant="ghost" size="sm">Add Project</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {studentData?.projects.length === 0 ? (
                <p className="text-sm text-slate-400">No projects added yet.</p>
              ) : (
                <div className="space-y-3">
                  {studentData?.projects.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{p.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-2">Tech: {p.technologies}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
