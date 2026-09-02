import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginInput } from '@pathforge/shared-zod';
import { APP_ROUTES } from '@pathforge/shared-constants';

export default function Login() {
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to={APP_ROUTES.REGISTER} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          required
          id="login-email"
          autoComplete="email"
        />

        <PasswordInput
          {...register('password')}
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          required
          id="login-password"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              id="login-remember-me"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
          </label>

          <Link
            to={APP_ROUTES.FORGOT_PASSWORD}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoggingIn}
            id="login-submit"
          >
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
}
