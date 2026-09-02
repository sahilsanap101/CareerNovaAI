import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          className={clsx(
            'input-base resize-none',
            error && 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className,
          )}
          {...props}
        />

        {error && (
          <p id={`${textareaId}-error`} role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
