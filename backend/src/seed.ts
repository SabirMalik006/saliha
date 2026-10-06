import { assertEnv } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { ensureSeedData } from './services/bootstrap';

/**
 * Seeds the database:  npm run seed
 * Reset the admin password too:  npm run seed -- --reset-password
 */
async function run(): Promise<void> {
  assertEnv();
  await connectDatabase();

  const resetPassword = process.argv.includes('--reset-password');
  await ensureSeedData({ resetPassword });

  await disconnectDatabase();
  console.log('[seed] Done.');
}

run().catch((error) => {
  console.error('[seed] Failed:', error);
  process.exit(1);
});
