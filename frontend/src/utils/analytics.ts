/**
 * Lightweight analytics placeholder (spec FUN-09 / FUN-10).
 *
 * Design goals:
 *  - Zero third-party script until the clinic supplies a real GA4 ID.
 *  - Never throw: analytics must not be able to break a user interaction.
 *  - Queue events in `window.dataLayer` so they flush once GA4 loads, which
 *    keeps click tracking reliable even on a slow connection.
 *  - Contain no personal data (no names, phone numbers or email addresses).
 */

import { appConfig, isAnalyticsEnabled } from '@/config/env';

type AnalyticsValue = string | number | boolean | undefined;

type AnalyticsParams = Record<string, AnalyticsValue>;

interface DataLayerWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

function getWindow(): DataLayerWindow | null {
  return typeof window === 'undefined' ? null : (window as DataLayerWindow);
}

/** Inject the GA4 loader exactly once. No-op while no measurement ID is set. */
let scriptInjected = false;

function ensureGa4Script(): void {
  if (scriptInjected) return;

  const win = getWindow();
  if (!win || !isAnalyticsEnabled()) return;

  scriptInjected = true;

  // gtag shim must exist before the network script arrives.
  if (!win.gtag) {
    win.dataLayer = win.dataLayer ?? [];
    win.gtag = function gtag(...args: unknown[]) {
      win.dataLayer?.push(args);
    };
  }
  win.gtag('js', new Date());
  win.gtag('config', appConfig.gaMeasurementId, { send_page_view: true });

  if (document.querySelector(`script[src*="${appConfig.gaMeasurementId}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    appConfig.gaMeasurementId,
  )}`;
  script.dataset.analytics = 'ga4';
  document.head.appendChild(script);
}

/**
 * Record a named event. Safe to call unconditionally — it becomes a no-op
 * until analytics is configured.
 */
export function trackEvent(name: string, params: AnalyticsParams = {}): void {
  try {
    const win = getWindow();
    if (!win) return;

    win.dataLayer = win.dataLayer ?? [];
    win.gtag?.('event', name, params);

    if (import.meta.env.DEV && !isAnalyticsEnabled()) {
      // Visible in the console during development so tracking can be verified
      // before a measurement ID exists.
      console.info(`[analytics:disabled] ${name}`, params);
    }
  } catch {
    // Analytics failures must never surface to the patient.
  }
}

/** Events defined by the spec: phone, WhatsApp and appointment CTA clicks. */
export type CtaKind = 'phone' | 'whatsapp' | 'appointment' | 'email' | 'map';

export function trackCtaClick(
  kind: CtaKind,
  details: { location?: string; label?: string } = {},
): void {
  trackEvent('cta_click', {
    cta_type: kind,
    cta_location: details.location,
    cta_label: details.label,
  });
}

/**
 * Page-view tracking for the React Router history.
 * Call once on mount and again whenever the route changes.
 */
export function trackPageView(path: string): void {
  ensureGa4Script();
  trackEvent('page_view', {
    page_path: path,
    page_location: appConfig.siteUrl ? `${appConfig.siteUrl}${path}` : path,
  });
}