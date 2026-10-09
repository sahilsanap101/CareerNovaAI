import { Target, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CareerTopSectionProps {
  generatedAt?: string;
  completeness: number;
  strategyMessage?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function CareerTopSection({ generatedAt, completeness, strategyMessage, onRefresh, isRefreshing }: CareerTopSectionProps) {
  const formattedDate = generatedAt 
    ? new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric' 
      }).format(new Date(generatedAt))
    : 'Never';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Career Recommendations
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl ml-13">
          {strategyMessage || 'Based on your academic profile, skills, interests, projects, and platform experience. Our deterministic engine maps your profile against active tech domains.'}
        </p>
        {strategyMessage?.includes('Complete Career Assessment') && (
          <Link 
            to="/profile/assessment" 
            className="ml-13 mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 dark:text-primary-400 rounded-lg text-sm font-medium transition-colors"
          >
            Take Career Assessment <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 w-full md:w-auto">
        
        {/* Meta Stats */}
        <div className="flex flex-col gap-1 text-sm mr-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Updated: {formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Profile Match Quality:</span>
            <span className={`font-medium ${
              completeness >= 70 ? 'text-green-600 dark:text-green-400' :
              completeness >= 40 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {completeness}%
            </span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Analyzing...' : 'Generate Matches'}
        </button>
      </div>
    </div>
  );
}
