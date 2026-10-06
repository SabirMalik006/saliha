/**
 * Vercel serverless entry for the clinic API.
 *
 * Vercel does not run a listening socket: it hands each request to an exported
 * handler. `backend/src/index.ts` calls `app.listen()`, which only works for a
 * long-running Node process, so this module wires the same Express app into a
 * request handler instead.
 *
 * A warm instance is reused across requests, so the Mongo connection and the
 * Express app are created once and then cached on the module instance.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Express } from 'express';
import { createApp } from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/db';
import { env } from '../backend/src/config/env';
import { ensureSeedData } from '../backend/src/services/bootstrap';

let app: Express | null = null;
let booting: Promise<Express> | null = null;

function boot(): Promise<Express> {
  if (app) return Promise.resolve(app);

  if (!booting) {
    booting = (async () => {
      // `assertEnv()` is deliberately not used here: it calls process.exit(),
      // which would kill the invocation instead of returning a useful response.
      if (!env.mongoUri) {
        throw new Error('MONGODB_URI is not configured for this deployment.');
      }

      await connectDatabase();

      try {
        await ensureSeedData();
      } catch (error) {
        // Seeding is a convenience, not a prerequisite for serving requests.
        console.error('[seed] Bootstrap did not complete:', error);
      }

      app = createApp();
      return app;
    })().catch((error: unknown) => {
      // Allow the next invocation to retry a cold start.
      booting = null;
      throw error;
    });
  }

  return booting;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const instance = await boot();
    instance(req, res);
  } catch (error) {
    console.error('[api] Startup failed:', error);

    if (res.headersSent) {
      res.end();
      return;
    }

    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        message: 'The API is starting up. Please retry in a few seconds.',
      }),
    );
  }
}
