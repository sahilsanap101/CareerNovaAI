import { clsx } from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'rounded-full border-slate-300 dark:border-slate-600 border-t-primary-600',
        'animate-spin',
        sizeClasses[size],
        className,
      )}
    />
  );
}

interface LoaderProps {
  fullScreen?: boolean;
  label?: string;
}

export function Loader({ fullScreen = false, label = 'Loading...' }: LoaderProps) {
  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
        aria-label={label}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-primary-100 dark:border-primary-900" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12" aria-label={label}>
      <Spinner size="lg" />
    </div>
  );
}
