import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@pathforge/shared-zod';
import { APP_ROUTES } from '@pathforge/shared-constants';
import { useToast } from '@/hooks/useToast';

export default function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const toast = useToast();

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data),
    onSuccess: () => setEmailSent(true),
    onError: () => toast.error('Something went wrong. Please try again.'),
  });

  if (emailSent) {
    return (
      <div className="text-center animate-fade-up">
        <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6">
          <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          If <strong className="text-slate-700 dark:text-slate-300">{getValues('email')}</strong> is registered, you&apos;ll receive a password reset link in a few minutes.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          In development, check the console for the Ethereal preview URL.
        </p>
        <Link to={APP_ROUTES.LOGIN}>
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <Link to={APP_ROUTES.LOGIN} className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot your password?</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          required
          id="forgot-email"
          autoComplete="email"
        />

        <Button type="submit" className="w-full" size="lg" isLoading={mutation.isPending} id="forgot-submit">
          Send Reset Link
        </Button>
      </form>
    </div>
  );
}
