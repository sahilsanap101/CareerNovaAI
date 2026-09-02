import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Failed to load data',
  message = 'An error occurred while fetching information from the server.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50">
      <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
}
