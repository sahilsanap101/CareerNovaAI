import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, required, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={clsx(
              'input-base',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 3.75a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4zm-.75 7a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
