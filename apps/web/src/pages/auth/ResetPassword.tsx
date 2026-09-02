import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { authApi } from '@/api/auth.api';
import { resetPasswordSchema, type ResetPasswordInput } from '@pathforge/shared-zod';
import { APP_ROUTES } from '@pathforge/shared-constants';
import { useToast } from '@/hooks/useToast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const token = params.get('token') ?? '';

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully. Please log in with your new password.');
      setTimeout(() => void navigate(APP_ROUTES.LOGIN), 2000);
    },
    onError: () => toast.error('Invalid or expired reset link. Please request a new one.'),
  });

  if (!token) {
    return (
      <div className="text-center animate-fade-up">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Invalid reset link</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link to={APP_ROUTES.FORGOT_PASSWORD}>
          <Button>Request new link</Button>
        </Link>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="text-center animate-fade-up">
        <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password reset!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Set new password</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
        <input type="hidden" {...register('token')} />

        <PasswordInput
          {...register('password')}
          label="New Password"
          placeholder="Minimum 8 characters"
          error={errors.password?.message}
          required
          id="reset-password"
          autoComplete="new-password"
        />

        <PasswordInput
          {...register('confirmPassword')}
          label="Confirm New Password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          required
          id="reset-confirm-password"
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" size="lg" isLoading={mutation.isPending} id="reset-submit">
          Reset Password
        </Button>
      </form>
    </div>
  );
}
