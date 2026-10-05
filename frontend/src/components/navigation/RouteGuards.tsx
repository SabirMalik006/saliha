import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/feedback/States';
import { appConfig } from '@/config/env';

interface RequireAuthProps {
  children?: ReactNode;
  /** Roles allowed through. Backend authorisation is still the real gate. */
  allowedRoles?: Array<'admin' | 'editor'>;
}

/**
 * Frontend route protection.
 *
 * This prevents accidental navigation only — it is NOT a security boundary.
 * Every admin API request must be independently authorised by the backend.
 */
export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { isAuthenticated, isInitialising, user } = useAuth();
  const location = useLocation();

  if (isInitialising) {
    return (
      <div
        role="status"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app"
      >
        <Spinner className="h-8 w-8" />
        <p className="text-sm font-medium text-ink-soft">Checking your session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={appConfig.isProduction ? '/404' : '/admin/login'} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold text-navy-800">Access restricted</h1>
        <p className="max-w-md text-sm text-ink-soft">
          Your account does not have permission to view this screen. If you believe this is a
          mistake, contact the clinic administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/** Keeps signed-in users away from the login screen. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialising } = useAuth();

  if (isInitialising) {
    return (
      <div
        role="status"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app"
      >
        <Spinner className="h-8 w-8" />
        <p className="text-sm font-medium text-ink-soft">Checking your session…</p>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}