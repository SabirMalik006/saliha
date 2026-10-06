import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function str(name: string, fallback = ''): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

function num(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const nodeEnv = str('NODE_ENV', 'development');
const isProduction = nodeEnv === 'production';

const corsOrigins = str(
  'CORS_ORIGINS',
  'http://localhost:5173,http://localhost:4173',
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv,
  isProduction,
  port: num('PORT', 5000),

  mongoUri: str('MONGODB_URI'),

  corsOrigins,

  jwtSecret: str('JWT_SECRET', 'dev-only-insecure-secret'),
  jwtExpiresIn: str('JWT_EXPIRES_IN', '7d'),
  cookieName: str('COOKIE_NAME', 'sc_session'),
  cookieSameSite: str('COOKIE_SAME_SITE', 'lax').toLowerCase() as
    | 'lax'
    | 'strict'
    | 'none',

  cloudinary: {
    cloudName: str('CLOUDINARY_CLOUD_NAME'),
    apiKey: str('CLOUDINARY_API_KEY'),
    apiSecret: str('CLOUDINARY_API_SECRET'),
    folder: str('CLOUDINARY_FOLDER', 'specialist-clinic'),
  },

  maxUploadMb: num('MAX_UPLOAD_MB', 5),

  admin: {
    name: str('ADMIN_NAME', 'Clinic Admin'),
    email: str('ADMIN_EMAIL', 'admin@specialistclinic.com'),
    password: str('ADMIN_PASSWORD', 'ChangeMe123!'),
  },
} as const;

/** Fails fast on configuration that would silently break the API. */
export function assertEnv(): void {
  const problems: string[] = [];

  if (!env.mongoUri) {
    problems.push('MONGODB_URI is not set. Paste your MongoDB connection string in backend/.env');
  }

  if (env.isProduction && env.jwtSecret === 'dev-only-insecure-secret') {
    problems.push('JWT_SECRET must be set to a long random string in production.');
  }

  if (problems.length) {
    console.error('\n[config] The API cannot start:\n');
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error('\nCopy backend/.env.example to backend/.env and fill in the values.\n');
    process.exit(1);
  }
}

export const isCloudinaryConfigured = (): boolean =>
  Boolean(
    env.cloudinary.cloudName &&
      env.cloudinary.apiKey &&
      env.cloudinary.apiSecret,
  );
