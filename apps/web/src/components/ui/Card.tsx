import type { ReactNode } from 'react';
import { clsx } from 'clsx';

// ─── Card ─────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export function Card({ children, className, hoverable = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={clsx(
        'card',
        hoverable && 'hover:shadow-card-hover cursor-pointer transition-shadow duration-200',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={clsx('text-base font-semibold text-slate-900 dark:text-slate-100', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={clsx('text-sm text-slate-500 dark:text-slate-400 mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx(className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-slate-200 dark:border-slate-700', className)}>
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  error:   'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  info:    'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={clsx('badge', badgeVariants[variant], className)}>
      {children}
    </span>
  );
}
