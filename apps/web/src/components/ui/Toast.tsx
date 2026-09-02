import { Toaster, toast as hotToast } from 'react-hot-toast';

export const toast = {
  success: (message: string) =>
    hotToast.success(message, {
      className: '!bg-white dark:!bg-slate-800 !text-slate-800 dark:!text-slate-100 !border !border-slate-200 dark:!border-slate-700 !shadow-lg',
    }),
  error: (message: string) =>
    hotToast.error(message, {
      className: '!bg-white dark:!bg-slate-800 !text-slate-800 dark:!text-slate-100 !border !border-slate-200 dark:!border-slate-700 !shadow-lg',
    }),
  info: (message: string) =>
    hotToast(message, {
      icon: 'ℹ️',
      className: '!bg-white dark:!bg-slate-800 !text-slate-800 dark:!text-slate-100 !border !border-slate-200 dark:!border-slate-700 !shadow-lg',
    }),
};

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      }}
    />
  );
}
