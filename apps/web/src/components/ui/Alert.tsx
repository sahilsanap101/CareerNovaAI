import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; icon: typeof Info }> = {
  info: {
    container: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300',
    icon: Info,
  },
  success: {
    container: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    icon: CheckCircle,
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    icon: AlertTriangle,
  },
  error: {
    container: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    icon: XCircle,
  },
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const { container, icon: Icon } = variantStyles[variant];

  return (
    <div
      role="alert"
      className={clsx('flex items-start gap-3 p-4 rounded-xl border text-sm leading-relaxed', container, className)}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div>{children}</div>
      </div>
    </div>
  );
}
