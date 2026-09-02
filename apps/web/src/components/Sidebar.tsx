import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Settings,
  Zap,
  LogOut,
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
import { clsx } from 'clsx';

import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { APP_ROUTES } from '@pathforge/shared-constants';

const mainNavItems = [
  { label: 'Dashboard', href: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Profile & Skills', href: APP_ROUTES.PROFILE, icon: User },
  { label: 'Settings', href: APP_ROUTES.SETTINGS, icon: Settings },
];

const byserNavItems = [
  { label: 'Recommendations', href: APP_ROUTES.RECOMMENDATIONS, icon: Sparkles },
  { label: 'Career Comparison', href: APP_ROUTES.CAREER_COMPARISON, icon: ArrowLeftRight },
  { label: 'Analytics', href: APP_ROUTES.ANALYTICS, icon: BarChart3 },
];

const roadmapNavItems = [
  { label: 'Adaptive Roadmap', href: APP_ROUTES.ROADMAP, icon: Map },
  { label: 'Skill Dependency Graph', href: APP_ROUTES.SKILL_GRAPH, icon: GitFork },
  { label: 'Weekly Planner', href: APP_ROUTES.PLANNER, icon: Calendar },
];

const aiNavItems = [
  { label: 'AIOS Career System', href: APP_ROUTES.AI, icon: Bot },
  { label: 'Resume Intelligence', href: APP_ROUTES.RESUME_INTELLIGENCE, icon: FileText },
  { label: 'Interview Coach', href: APP_ROUTES.INTERVIEW_COACH, icon: Mic },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      void navigate(APP_ROUTES.LOGIN);
    }
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-sm">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
          PATH<span className="text-primary-600 dark:text-primary-400">FORGE</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
            Main
          </p>
          <div className="space-y-0.5">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }: { isActive: boolean }) =>
                  clsx('sidebar-item', isActive && 'active')
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* AIOS Intelligence Section */}
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-violet-500 uppercase tracking-wider">
            AIOS Intelligence
          </p>
          <div className="space-y-0.5">
            {aiNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }: { isActive: boolean }) =>
                  clsx('sidebar-item', isActive && 'active')
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* BYSER Engine Section */}
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            BYSER Engine
          </p>
          <div className="space-y-0.5">
            {byserNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }: { isActive: boolean }) =>
                  clsx('sidebar-item', isActive && 'active')
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Adaptive Roadmap Section */}
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-accent-500 uppercase tracking-wider">
            Learning Ecosystem
          </p>
          <div className="space-y-0.5">
            {roadmapNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }: { isActive: boolean }) =>
                  clsx('sidebar-item', isActive && 'active')
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Avatar name={user?.fullName} src={user?.profile?.profileImage} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {user?.fullName ?? 'User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => void handleLogout()}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
