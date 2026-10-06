import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, isCloudinaryConfigured } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error';
import { adminRouter } from './routes/admin';
import { authRouter } from './routes/auth.routes';
import { formsRouter } from './routes/forms.routes';
import { publicRouter } from './routes/public.routes';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (!env.isProduction) app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      environment: env.nodeEnv,
      imageStorage: isCloudinaryConfigured() ? 'configured' : 'missing',
    });
  });

  // Public content + form submissions.
  app.use('/api', publicRouter);
  app.use('/api', formsRouter);

  // Authentication (public login/logout, protected /me).
  app.use('/api/auth', authRouter);

  // Everything under /api/admin requires a session.
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
