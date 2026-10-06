import type { CookieOptions, NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import type { AuthUser, UserRole } from '../types/auth';

interface SessionPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
}

export function signSession(user: AuthUser): string {
  const payload: SessionPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction || env.cookieSameSite === 'none',
    sameSite: env.cookieSameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

/** Reads the session token from the HttpOnly cookie, falling back to a Bearer header. */
function readToken(req: Request): string | null {
  const fromCookie = req.cookies?.[env.cookieName];
  if (typeof fromCookie === 'string' && fromCookie) return fromCookie;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();

  return null;
}

/** Rejects the request unless a valid session cookie is present. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readToken(req);
  if (!token) return next(ApiError.unauthorised());

  try {
    const payload = jwt.verify(token, env.jwtSecret) as SessionPayload;
    req.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(ApiError.unauthorised('Your session has expired. Please sign in again.'));
  }
}

/** Restricts a route to specific roles (used for future editor accounts). */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorised());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}
