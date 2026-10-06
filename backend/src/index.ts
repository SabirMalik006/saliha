import { createApp } from './app';
import { connectDatabase } from './config/db';
import { assertEnv, env, isCloudinaryConfigured } from './config/env';
import { ensureSeedData } from './services/bootstrap';

async function main(): Promise<void> {
  assertEnv();

  await connectDatabase();
  await ensureSeedData();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`\n[api] Specialist Clinic API listening on http://localhost:${env.port}/api`);
    console.log(`[api] Environment: ${env.nodeEnv}`);
    console.log(
      `[api] Image storage: ${isCloudinaryConfigured() ? 'Cloudinary configured' : 'NOT configured'}`,
    );
    console.log(`[api] Allowed origins: ${env.corsOrigins.join(', ')}\n`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n[api] Port ${env.port} is already in use.`);
      console.error('[api] Another copy of the API is most likely still running.');
      console.error('[api] Close that terminal, or change PORT in backend/.env.\n');
      process.exit(1);
    }
    console.error('[api] Server error:', error);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error('[api] Failed to start:', error);
  process.exit(1);
});
