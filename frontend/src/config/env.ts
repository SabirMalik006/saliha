/**
 * Environment-based configuration.
 * Never hardcode API endpoints inside components — read them from here.
 */

const env = import.meta.env;

const rawBaseUrl = env.VITE_API_BASE_URL?.trim() ?? '';
const siteUrl = env.VITE_SITE_URL?.trim() ?? '';

/** `true` by default so a fresh clone renders with clearly-labelled mock data. */
function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export const appConfig = {
  /**
   * Normalised API base URL. Empty string means "same origin", which lets the
   * Vite dev proxy or a reverse proxy handle `/api`.
   */
  apiBaseUrl: rawBaseUrl.replace(/\/+$/, ''),

  /** Send cookies with API requests (required for HttpOnly cookie sessions). */
  withCredentials: parseBool(env.VITE_API_WITH_CREDENTIALS, true),

  /**
   * Development-only mock adapter. When enabled, API calls are fulfilled by
   * `src/mocks` so the UI renders end-to-end without a backend.
   * MUST be set to `false` in production.
   */
  useMockApi: parseBool(env.VITE_USE_MOCK_API, true),

  /** Canonical site URL. Empty until the production domain is confirmed. */
  siteUrl,

  /**
   * GA4 measurement ID (e.g. `G-XXXXXXXXXX`).
   *
   * Analytics stays completely dormant while this is empty: no third-party
   * script is injected and no events are queued. This is the placeholder
   * required by the spec until the clinic supplies a real property ID.
   */
  gaMeasurementId: env.VITE_GA_MEASUREMENT_ID?.trim() ?? '',

  isProduction: env.PROD,
} as const;

/** GA4 is only active once the client has supplied a measurement ID. */
export const isAnalyticsEnabled = (): boolean => /^G-[A-Z0-9]+$/i.test(appConfig.gaMeasurementId);

/** Absolute URL helper — returns a relative path when no domain is configured. */
export function absoluteUrl(path: string = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (!appConfig.siteUrl) return clean;
  return `${appConfig.siteUrl.replace(/\/+$/, '')}${clean}`;
}