import { forwardRef, type SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, required, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            className={clsx(
              'input-base appearance-none pr-10',
              error && 'border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {error && (
          <p id={`${selectId}-error`} role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
