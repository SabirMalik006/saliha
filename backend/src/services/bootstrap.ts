import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { AdminUser, SiteSettings } from '../models';

interface SeedOptions {
  /** Re-hash and overwrite the admin password even if the account exists. */
  resetPassword?: boolean;
}

/**
 * Creates the settings document and the first admin account when missing.
 * Safe to call on every boot — it never overwrites existing data unless asked.
 */
export async function ensureSeedData(options: SeedOptions = {}): Promise<void> {
  const settings = await SiteSettings.findOne({ singleton: 'site' });
  if (!settings) {
    await SiteSettings.create({ singleton: 'site' });
    console.log('[seed] Created default site settings.');
  }

  const email = env.admin.email.toLowerCase();
  const existingAdmin = await AdminUser.findOne({ email });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(env.admin.password, 12);
    await AdminUser.create({
      name: env.admin.name,
      email,
      passwordHash,
      role: 'admin',
    });
    console.log(`[seed] Created admin account: ${email}`);
    console.log('[seed] Sign in with the ADMIN_PASSWORD from backend/.env, then change it.');
    return;
  }

  if (options.resetPassword) {
    existingAdmin.passwordHash = await bcrypt.hash(env.admin.password, 12);
    await existingAdmin.save();
    console.log(`[seed] Password reset for admin account: ${email}`);
  }
}
