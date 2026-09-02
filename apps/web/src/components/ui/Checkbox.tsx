import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id, checked, ...props }, ref) => {
    const checkboxId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            aria-invalid={!!error}
            className={clsx(
              'h-4 w-4 rounded border border-slate-300 dark:border-slate-600',
              'text-primary-600 focus:ring-primary-500/20 focus:ring-2 focus:ring-offset-0',
              'bg-white dark:bg-slate-800 transition-colors cursor-pointer',
              error && 'border-red-500',
              className,
            )}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className="text-sm leading-tight">
            {label && (
              <label htmlFor={checkboxId} className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            )}
            {error && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
