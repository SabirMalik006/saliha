import { Clock, Mail, MapPin, MessageCircle, Phone, Send, Smartphone } from 'lucide-react';
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

  const items = [
    {
      icon: MapPin,
      title: 'Address',
      lines: [settings.addressLine, settings.addressLandmark, settings.addressCity],
    },
    {
      icon: Clock,
      title: 'Clinic Time',
      lines: [settings.clinicHours],
    },
    {
      icon: Phone,
      title: 'Phone',
      lines: [settings.phoneDisplay],
      href: buildPhoneHref(settings.phone),
      cta: 'phone' as const,
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      lines: [settings.whatsappDisplay],
      href: buildWhatsAppHref(settings.whatsappNumber),
      external: true,
      cta: 'whatsapp' as const,
    },
    {
      icon: Smartphone,
      title: 'Alternate Contact',
      lines: [settings.alternatePhoneDisplay],
      href: buildPhoneHref(settings.alternatePhone),
      cta: 'phone' as const,
    },
  ];

  return (
    <ul
      className={cn(
        layout === 'grid'
          ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-5'
          : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-navy-800 group-hover:text-white">
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
                {item.title}
              </span>
              <span className="mt-1 block text-sm font-semibold text-navy-800">
                {item.href ? (
                  item.lines[0]
                ) : (
                  item.lines.map((line, index) => (
                    <span key={line} className="block">
                      {line}
                      {index < item.lines.length - 1 ? <br /> : null}
                    </span>
                  ))
                )}
                {item.href && item.lines.length > 1 ? (
                  <>
                    <br />
                    {item.lines.slice(1)}
                  </>
                ) : null}
              </span>
            </span>
          </>
        );

        return (
          <li key={item.title}>
            {item.href ? (
              <a
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                onClick={() =>
                  'cta' in item && item.cta
                    ? trackCtaClick(item.cta, {
                        location,
                        label: item.lines[0],
                      })
                    : undefined
                }
                className="group flex h-full min-h-[44px] items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                {content}
              </a>
            ) : (
              <div className="group flex h-full items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
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