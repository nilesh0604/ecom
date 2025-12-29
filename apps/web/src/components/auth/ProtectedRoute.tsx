import { useAppSelector } from '@/store/hooks';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Redirect path when not authenticated. Defaults to /auth/login */
  redirectTo?: string;
  /** If true, only allow unauthenticated users (for login/register pages) */
  guestOnly?: boolean;
  /** Redirect path for guest-only routes when authenticated. Defaults to / */
  authenticatedRedirect?: string;
}

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to login while preserving their
 * intended destination for redirect after login.
 *
 * Features:
 * - Preserves intended destination in location state
 * - Supports guest-only mode for login/register pages
 * - Works with nested routes
 *
 * Usage:
 * ```tsx
 * // Protected route (requires auth)
 * <ProtectedRoute>
 *   <OrdersPage />
 * </ProtectedRoute>
 *
 * // Guest-only route (redirects if logged in)
 * <ProtectedRoute guestOnly>
 *   <LoginPage />
 * </ProtectedRoute>
 * ```
 */
const ProtectedRoute = ({
  children,
  redirectTo = '/auth/login',
  guestOnly = false,
  authenticatedRedirect = '/',
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Show nothing while checking auth status
  // In a real app, you might show a loading spinner here
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Guest-only mode: redirect authenticated users away from login/register
  if (guestOnly && isAuthenticated) {
    return <Navigate to={authenticatedRedirect} replace />;
  }

  // Protected mode: redirect unauthenticated users to login
  if (!guestOnly && !isAuthenticated) {
    // Preserve the intended destination
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // User has appropriate access
  return <>{children}</>;
};

export default ProtectedRoute;
