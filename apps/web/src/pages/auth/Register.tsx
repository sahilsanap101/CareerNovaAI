import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterInput } from '@pathforge/shared-zod';
import { APP_ROUTES } from '@pathforge/shared-constants';

export default function Register() {
  const { register: registerUser, isRegistering } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    registerUser(data);
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to={APP_ROUTES.LOGIN} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          {...register('fullName')}
          label="Full Name"
          placeholder="Arjun Sharma"
          error={errors.fullName?.message}
          required
          id="register-fullname"
          autoComplete="name"
        />

        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          required
          id="register-email"
          autoComplete="email"
        />

        <PasswordInput
          {...register('password')}
          label="Password"
          placeholder="Minimum 8 characters"
          error={errors.password?.message}
          required
          id="register-password"
          autoComplete="new-password"
        />

        <PasswordInput
          {...register('confirmPassword')}
          label="Confirm Password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          required
          id="register-confirm-password"
          autoComplete="new-password"
        />

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isRegistering}
            id="register-submit"
          >
            Create Account
          </Button>
        </div>
      </form>

      <p className="mt-6 text-xs text-center text-slate-400 dark:text-slate-500">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
