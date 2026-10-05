import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Smartphone,
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { buildMapHref, buildMapSearchHref, buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { trackCtaClick } from '@/utils/analytics';
import {
  CLINIC_COORDINATES_DISPLAY,
  CLINIC_LOCATION,
  WHATSAPP_APPOINTMENT_MESSAGE,
} from '@/constants/clinic';
import { cn } from '@/utils/cn';

/**
 * Every phone / WhatsApp link on the site is built here so the numbers can
 * never drift apart between pages.
 *
 * All outbound contact links also report a `cta_click` event (spec FUN-10).
 * Tracking is a no-op until a GA4 measurement ID is configured.
 */

export interface PhoneLinkProps {
  number: string;
  display: string;
  className?: string;
  showIcon?: boolean;
  iconClassName?: string;
  /** Where on the site this link appears, e.g. `hero` or `footer`. */
  location?: string;
}

export function PhoneLink({
  number,
  display,
  className,
  showIcon = true,
  iconClassName,
  location = 'inline',
}: PhoneLinkProps) {
  return (
    <a
      href={buildPhoneHref(number)}
      onClick={() => trackCtaClick('phone', { location, label: display })}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-2 font-semibold text-navy-800 transition-colors hover:text-blue-600',
        className,
      )}
    >
      {showIcon ? (
        <Phone className={cn('h-4 w-4 shrink-0 text-pink-500', iconClassName)} aria-hidden="true" />
      ) : null}
      <span>{display}</span>
    </a>
  );
}

export function WhatsAppLink({
  number,
  display,
  message = WHATSAPP_APPOINTMENT_MESSAGE,
  className,
  showIcon = true,
  label,
  location = 'inline',
}: {
  number: string;
  display: string;
  message?: string;
  className?: string;
  showIcon?: boolean;
  label?: string;
  location?: string;
}) {
  return (
    <a
      href={buildWhatsAppHref(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCtaClick('whatsapp', { location, label: label ?? display })}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-2 font-semibold text-navy-800 transition-colors hover:text-green-600',
        className,
      )}
    >
      {showIcon ? (
        <MessageCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
      ) : null}
      <span>{label ?? `WhatsApp ${display}`}</span>
    </a>
  );
}

/** Phone, WhatsApp and alternate contact as one consistent block. */
export function ContactQuickLinks({
  layout = 'stack',
  tone = 'dark',
  className,
  location = 'contact-quick-links',
}: {
  layout?: 'stack' | 'row';
  tone?: 'dark' | 'light';
  className?: string;
  location?: string;
}) {
  const { settings } = useSettings();
  const isLight = tone === 'light';

  const items = [
    {
      key: 'phone',
      Icon: Phone,
      label: settings.phoneDisplay,
      href: buildPhoneHref(settings.phone),
      cta: 'phone' as const,
    },
    {
      key: 'whatsapp',
      Icon: MessageCircle,
      label: `WhatsApp ${settings.whatsappDisplay}`,
      href: buildWhatsAppHref(settings.whatsappNumber),
      target: '_blank',
      rel: 'noopener noreferrer',
      cta: 'whatsapp' as const,
    },
    {
      key: 'alternate',
      Icon: Smartphone,
      label: settings.alternatePhoneDisplay,
      href: buildPhoneHref(settings.alternatePhone),
      cta: 'phone' as const,
    },
  ];

  return (
    <ul
      className={cn(
        'flex gap-x-6 gap-y-1',
        layout === 'row' ? 'flex-wrap items-center' : 'flex-col',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.key}>
          <a
            href={item.href}
            target={item.target}
            rel={item.rel}
            onClick={() =>
              trackCtaClick(item.cta, { location, label: item.label })
            }
            className={cn(
              'inline-flex min-h-[40px] items-center gap-2 text-sm transition-colors',
              isLight ? 'text-white hover:text-blue-200' : 'text-ink-soft hover:text-navy-800',
            )}
          >
            <item.Icon className="h-4 w-4" aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ==========================================================================
   Location
   ========================================================================== */

/**
 * Address card plus a working Google Maps directions link.
 *
 * The clinic supplied its coordinates (33.54987, 73.07968), so a real map link
 * is always rendered. `settings.mapUrl` only overrides it when the clinic adds a
 * short shared link.
 */
export function MapLink({
  className,
  label = 'Get directions',
  location = 'map',
}: {
  className?: string;
  label?: string;
  location?: string;
}) {
  const { settings } = useSettings();

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-800">Clinic location</p>
          <address className="mt-1 text-sm not-italic leading-relaxed text-ink-soft">
            {settings.addressLine}
            <br />
            {settings.addressLandmark}
            <br />
            {settings.addressCity}
          </address>
          <a
            href={buildMapHref(settings.mapUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCtaClick('map', { location, label })}
            className="group mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-blue-600 underline decoration-blue-300 underline-offset-4 transition-colors hover:text-blue-700"
          >
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
            <span className="sr-only">(opens Google Maps in a new tab)</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Embedded Google map built from the confirmed coordinates.
 *
 * Deliberately not lazy-loaded as an iframe: the clinic location is the key
 * conversion detail on the contact page, and loading it on demand would leave a
 * visible empty box.
 */
export function MapEmbed({ className }: { className?: string }) {
  const { latitude, longitude } = CLINIC_LOCATION;
  const src = `https://www.google.com/maps?q=${latitude},${longitude}&hl=en&z=16&output=embed`;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-line bg-blue-50 shadow-sm',
        className,
      )}
    >
      <iframe
        title={`Map showing ${CLINIC_COORDINATES_DISPLAY} — Specialist Clinic, Morgah, Rawalpindi`}
        src={src}
        className="h-[320px] w-full border-0 sm:h-[380px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-4 py-3">
        <p className="text-xs leading-relaxed text-ink-faint">
          Coordinates: <span className="font-semibold text-navy-800">{CLINIC_COORDINATES_DISPLAY}</span>
        </p>
        <a
          href={buildMapSearchHref()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCtaClick('map', { location: 'map-embed', label: 'Open in Google Maps' })}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-blue-600 underline decoration-blue-300 underline-offset-4 hover:text-blue-700"
        >
          Open in Google Maps
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}

/* ==========================================================================
   Clinic information strip
   ========================================================================== */

/**
 * Clinic information block: address on the left, contact details on the right.
 *
 * The previous version gave all five facts equal weight in a 5-column grid,
 * which made the one line that actually needs reading — the address — the
 * hardest to read. Address and directions get the large panel here; timings
 * and the three numbers sit in a tidy list beside it.
 */
export function ClinicInfoStrip({
  layout = 'grid',
  className,
  location = 'clinic-info-strip',
}: {
  layout?: 'grid' | 'cards';
  className?: string;
  location?: string;
}) {
  const { settings } = useSettings();

  const contacts = [
    {
      icon: Clock,
      title: 'Clinic Time',
      value: settings.clinicHours,
    },
    {
      icon: Phone,
      title: 'Phone',
      value: settings.phoneDisplay,
      href: buildPhoneHref(settings.phone),
      cta: 'phone' as const,
      tone: 'blue' as const,
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: settings.whatsappDisplay,
      href: buildWhatsAppHref(settings.whatsappNumber),
      external: true,
      cta: 'whatsapp' as const,
      tone: 'green' as const,
    },
    {
      icon: Smartphone,
      title: 'Alternate Contact',
      value: settings.alternatePhoneDisplay,
      href: buildPhoneHref(settings.alternatePhone),
      cta: 'phone' as const,
      tone: 'navy' as const,
    },
  ];

  const toneClasses = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-navy-800 group-hover:text-white',
    green: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
    navy: 'bg-navy-50 text-navy-600 group-hover:bg-navy-800 group-hover:text-white',
  } as const;

  return (
    <div
      className={cn(
        'grid gap-5 lg:grid-cols-12 lg:gap-6',
        layout === 'cards' && 'lg:grid-cols-1',
        className,
      )}
    >
      {/* ---------------------------------------------- Address panel */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-blue-50 via-white to-white p-6 shadow-sm lg:col-span-7 sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/60 blur-2xl" />
        </div>

        <div className="relative">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-800 text-white shadow-sm">
            <MapPin className="h-5.5 w-5.5" aria-hidden="true" />
          </span>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
            Address
          </p>

          <address className="mt-2 max-w-xl text-[1.0625rem] font-semibold not-italic leading-relaxed text-navy-800 text-balance">
            {settings.addressLine}
          </address>

          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
            {settings.addressLandmark}
            <br />
            {settings.addressCity}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={buildMapHref(settings.mapUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCtaClick('map', { location, label: 'Get directions' })}
              className="group inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-navy-800 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-900"
            >
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              Get Directions
              <span className="sr-only">(opens Google Maps in a new tab)</span>
            </a>

            <a
              href={buildMapSearchHref()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCtaClick('map', { location, label: 'Open in Google Maps' })}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-semibold text-navy-800 transition-colors hover:bg-blue-50"
            >
              Open in Google Maps
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>

          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-faint">
            <span>Coordinates:</span>
            <span className="font-semibold text-navy-700">{CLINIC_COORDINATES_DISPLAY}</span>
          </p>
        </div>
      </div>

      {/* ---------------------------------------- Contact details list */}
      <ul
        className={cn(
          'grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:content-start',
          layout === 'cards' && 'lg:col-span-1',
        )}
      >
        {contacts.map((item) => {
          const Icon = item.icon;
          const tone = 'tone' in item && item.tone ? item.tone : 'blue';
          const body = (
            <>
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
                  toneClasses[tone],
                )}
              >
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-faint">
                  {item.title}
                </span>
                <span className="mt-1 block text-[1.0625rem] font-semibold tabular-nums text-navy-800 transition-colors group-hover:text-blue-600">
                  {item.value}
                </span>
              </span>

              {'href' in item && item.href ? (
                <ArrowUpRight
                  className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600"
                  aria-hidden="true"
                />
              ) : null}
            </>
          );

          return (
            <li key={item.title}>
              {'href' in item && item.href ? (
                <a
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  onClick={() =>
                    'cta' in item && item.cta
                      ? trackCtaClick(item.cta, { location, label: item.value })
                      : undefined
                  }
                  className="group flex h-full items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  {body}
                </a>
              ) : (
                <div className="group flex h-full items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Compact address line used in banners and conversion sections. */
export function AddressLine({ className }: { className?: string }) {
  const { settings } = useSettings();
  return (
    <address className={cn('not-italic leading-relaxed', className)}>
      {settings.addressLine}, {settings.addressLandmark}
    </address>
  );
}

export function NotificationEmail({
  className,
  location = 'notification-email',
}: {
  className?: string;
  location?: string;
}) {
  const { settings } = useSettings();
  if (!settings.notificationEmail) return null;
  return (
    <a
      href={`mailto:${settings.notificationEmail}`}
      onClick={() => trackCtaClick('email', { location, label: 'notification email' })}
      className={cn('inline-flex min-h-[44px] items-center gap-2 hover:underline', className)}
    >
      <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
      {settings.notificationEmail}
    </a>
  );
}

export { Send };