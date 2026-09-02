import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/auth.store';
import { APP_ROUTES } from '@pathforge/shared-constants';
import { Loader } from '@/components/ui/Loader';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 * Saves the intended location so we can redirect back after login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
