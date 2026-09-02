import { toast } from '@/components/ui/Toast';

export function useToast() {
  return {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast.info(msg),
    warning: (msg: string) => toast.info(`⚠️ ${msg}`),
  };
}
