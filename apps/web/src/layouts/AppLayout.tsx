import { Outlet } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { Avatar } from '@/components/ui/Avatar';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';

export function AppLayout() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="main-content flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 px-6 shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx={12} cy={12} r={4} /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
              )}
            </button>

            {/* Notifications */}
            <button
              className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-600" aria-hidden="true" />
            </button>

            {/* Avatar */}
            <Avatar name={user?.fullName} src={user?.profile?.profileImage} size="sm" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
