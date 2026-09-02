import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Search } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { APP_ROUTES } from '@pathforge/shared-constants';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">PATHFORGE</span>
        </div>

        {/* 404 */}
        <div className="relative mb-6">
          <span className="text-[120px] font-extrabold leading-none text-slate-200 dark:text-slate-800 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-card flex items-center justify-center">
              <Search className="h-7 w-7 text-slate-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={APP_ROUTES.HOME}>
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />} id="not-found-home">
              Go to Home
            </Button>
          </Link>
          <Link to={APP_ROUTES.DASHBOARD}>
            <Button variant="outline" id="not-found-dashboard">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
