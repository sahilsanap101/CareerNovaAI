import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/store/auth.store';
import { APP_ROUTES } from '@pathforge/shared-constants';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * PublicRoute — redirects authenticated users away from login/register pages.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={APP_ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
