import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/services/authApi';
import { normaliseApiError, type ApiError } from '@/services/apiClient';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  /** True until the initial session check resolves. */
  isInitialising: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Roles allowed to manage content; the backend is the real authority. */
  canManageContent: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialising, setIsInitialising] = useState(true);

  // Restore the session on first load. With an HttpOnly cookie this simply
  // asks the server who we are; there is no token in browser storage.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const session = await authApi.me();
        if (!cancelled) setUser(session.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsInitialising(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const session = await authApi.login(identifier, password);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Even if the server call fails, clear local state so the UI is usable.
      if (!normaliseApiError(error).isNetworkError) {
        /* non-fatal */
      }
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitialising,
      isAuthenticated: Boolean(user),
      login,
      logout,
      canManageContent: user?.role === 'admin' || user?.role === 'editor',
    }),
    [user, isInitialising, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}

export type { ApiError };