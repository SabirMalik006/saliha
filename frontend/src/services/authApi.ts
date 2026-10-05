import { http } from './apiClient';
import type { AuthSession } from '@/types';

/**
 * Authentication service.
 *
 * Session handling is delegated to the backend: credentials are posted to
 * `/auth/login` and the server is expected to set a secure, HttpOnly,
 * SameSite cookie. Tokens are deliberately NOT stored in localStorage.
 * Route guards in the UI are a UX convenience only — the backend must
 * authorise every admin operation.
 */
export const authApi = {
  async login(identifier: string, password: string): Promise<AuthSession> {
    const session = await http.post<AuthSession>('/auth/login', {
      identifier,
      password,
    });
    return { user: session.user };
  },

  async logout(): Promise<void> {
    await http.post<unknown>('/auth/logout', undefined);
  },

  async me(): Promise<AuthSession> {
    return http.get<AuthSession>('/auth/me');
  },
};