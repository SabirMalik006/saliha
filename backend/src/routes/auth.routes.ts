import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { env } from '../config/env';
import { AdminUser } from '../models';
import { cookieOptions, requireAuth, signSession } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parseOrThrow } from '../utils/parse';
import { loginSchema } from '../validation/schemas';

export const authRouter = Router();

/** POST /auth/login — verifies credentials and sets an HttpOnly session cookie. */
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { identifier, password } = parseOrThrow(loginSchema, req.body);

    const user = await AdminUser.findOne({
      $or: [{ email: identifier.toLowerCase() }, { name: identifier }],
    }).select('+passwordHash');

    if (!user || !user.passwordHash) {
      throw ApiError.unauthorised('Incorrect email or password.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorised('Incorrect email or password.');
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'editor',
    };

    const token = signSession(authUser);
    res.cookie(env.cookieName, token, cookieOptions());

    user.lastLoginAt = new Date();
    await user.save();

    res.json({ user: authUser });
  }),
);

/** POST /auth/logout — clears the session cookie. */
authRouter.post('/logout', (_req, res) => {
  res.clearCookie(env.cookieName, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true });
});

/** GET /auth/me — returns the signed-in user, or 401. */
authRouter.get(
  '/me',
  requireAuth,
  (req, res) => {
    res.json({ user: req.user });
  },
);
