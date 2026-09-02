import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/Input';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = 'Password', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        label={label}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        }
        {...props}
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
