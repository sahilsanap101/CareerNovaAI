import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

// ─── Style Maps ───────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  primary: clsx(
    'bg-primary-600 text-white shadow-sm',
    'hover:bg-primary-700 active:bg-primary-800',
    'focus-visible:ring-primary-500',
    'disabled:bg-primary-300',
  ),
  secondary: clsx(
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'hover:bg-slate-200 dark:hover:bg-slate-700',
    'focus-visible:ring-slate-400',
  ),
  ghost: clsx(
    'text-slate-600 dark:text-slate-400',
    'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
    'focus-visible:ring-slate-400',
  ),
  outline: clsx(
    'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300',
    'hover:bg-slate-50 dark:hover:bg-slate-800',
    'focus-visible:ring-slate-400',
  ),
  destructive: clsx(
    'bg-red-600 text-white',
    'hover:bg-red-700 active:bg-red-800',
    'focus-visible:ring-red-500',
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:   'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md:   'h-9 px-4 text-sm gap-2 rounded-lg',
  lg:   'h-11 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-9 w-9 rounded-lg',
};

// ─── Spinner ──────────────────────────────────────────────────────

function ButtonSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Button Component ─────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'select-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <ButtonSpinner />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
