import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Moon, Sun, Monitor, LogOut, Lock, Trash2, Bell } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Modal } from '@/components/ui/Modal';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/useToast';
import { userApi } from '@/api/user.api';
import { authApi } from '@/api/auth.api';
import { changePasswordSchema, type ChangePasswordInput } from '@pathforge/shared-zod';
import { APP_ROUTES } from '@pathforge/shared-constants';
import { useNavigate } from 'react-router-dom';
import { Theme } from '@pathforge/shared-enums';

const themeOptions: { value: Theme; label: string; icon: typeof Moon }[] = [
  { value: Theme.LIGHT, label: 'Light', icon: Sun },
  { value: Theme.DARK, label: 'Dark', icon: Moon },
  { value: Theme.SYSTEM, label: 'System', icon: Monitor },
];

export default function Settings() {
  const { theme, setTheme } = useThemeStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Change Password
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => userApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully.');
      reset();
    },
    onError: () => toast.error('Failed to change password. Check your current password.'),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      logout();
      void navigate(APP_ROUTES.HOME);
    },
    onError: () => toast.error('Failed to delete account. Please try again.'),
  });

  const handleLogout = async () => {
    try { await authApi.logout(); } finally {
      logout();
      void navigate(APP_ROUTES.LOGIN);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Breadcrumb />
      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary-500" aria-hidden="true" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Choose how CareerNova looks to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === t.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  id={`settings-theme-${t.value}`}
                >
                  <t.icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary-500" aria-hidden="true" />
              <CardTitle>Change Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => changePasswordMutation.mutate(d))} noValidate className="space-y-4">
              <PasswordInput {...register('currentPassword')} label="Current Password" error={errors.currentPassword?.message} required id="settings-current-password" />
              <PasswordInput {...register('newPassword')} label="New Password" error={errors.newPassword?.message} required id="settings-new-password" />
              <PasswordInput {...register('confirmPassword')} label="Confirm New Password" error={errors.confirmPassword?.message} required id="settings-confirm-password" />
              <Button type="submit" size="sm" isLoading={changePasswordMutation.isPending} id="settings-change-password">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notifications placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary-500" aria-hidden="true" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Notification preferences coming in Phase 2.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-400 dark:text-slate-500 text-center">
              Email and in-app notification settings will be available soon.
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Sign out</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sign out of your account on this device.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<LogOut className="h-4 w-4" />}
                  onClick={() => void handleLogout()}
                  id="settings-logout"
                >
                  Sign Out
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete Account</p>
                  <p className="text-xs text-red-600/70 dark:text-red-500/70">Permanently delete your account and all data.</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setDeleteModalOpen(true)}
                  id="settings-delete-account"
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              isLoading={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
              id="settings-confirm-delete"
            >
              Yes, Delete My Account
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Are you sure you want to permanently delete your account? This action{' '}
          <strong className="text-slate-900 dark:text-slate-100">cannot be undone</strong> and will delete all your profile data, sessions, and audit logs.
        </p>
      </Modal>
    </div>
  );
}
