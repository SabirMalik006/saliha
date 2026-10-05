import { CalendarDays, MessageCircle, Phone } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { routes } from '@/routes/paths';
import { useSettings } from '@/context/SettingsContext';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { WHATSAPP_APPOINTMENT_MESSAGE } from '@/constants/clinic';
import { cn } from '@/utils/cn';

export interface ConsultationBannerProps {
  title?: string;
  description?: string;
  className?: string;
  /** Optional secondary line, e.g. clinic hours. */
  footnote?: string;
}

/**
 * Reusable appointment conversion section.
 * Used on Home, About, Services and every service detail page.
 */
export function ConsultationBanner({
  title = 'Need an Appointment?',
  description = 'Contact Specialist Clinic to request a consultation with Dr. Saleha Ibtisam.',
  className,
  footnote,
}: ConsultationBannerProps) {
  const { settings } = useSettings();

  return (
    <section
      aria-labelledby="consultation-banner-title"
      className={cn(
        'relative overflow-hidden rounded-3xl bg-navy-800 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12',
        className,
      )}
    >
      {/* Restrained decorative motifs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-600/25" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-pink-500/20" />
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <h2
          id="consultation-banner-title"
          className="text-[1.625rem] leading-tight text-white sm:text-[2rem]"
        >
          {title}
        </h2>
        <p className="mt-3.5 text-base leading-relaxed text-blue-100 sm:text-[1.0625rem]">
          {description}
        </p>
        {footnote ? (
          <p className="mt-2 text-sm font-medium text-pink-200">{footnote}</p>
        ) : null}

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            to={routes.bookAppointment}
            variant="accent"
            size="lg"
            className="w-full sm:w-auto"
            leftIcon={<CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />}
          >
            Book Appointment
          </ButtonLink>

          <a
            href={buildPhoneHref(settings.phone)}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 text-base font-semibold text-white transition-colors hover:bg-white/20 sm:w-auto"
          >
            <Phone className="h-4.5 w-4.5 text-pink-300" aria-hidden="true" />
            Call {settings.phoneDisplay}
          </a>

          <a
            href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-green-300/40 bg-green-500/15 px-6 text-base font-semibold text-white transition-colors hover:bg-green-500/30 sm:w-auto"
          >
            <MessageCircle className="h-4.5 w-4.5 text-green-300" aria-hidden="true" />
            WhatsApp {settings.whatsappDisplay}
          </a>
        </div>

        <p className="mt-5 text-sm text-blue-200">
          An appointment request is not a confirmed booking. The clinic team will contact you to
          confirm the date and time.
        </p>
      </div>
    </section>
  );
}

/** Slim CTA strip for the foot of content-heavy pages. */
export function PageCtaStrip({ className }: { className?: string }) {
  const { settings } = useSettings();

  return (
    <section
      aria-label="Appointment options"
      className={cn(
        'rounded-2xl border border-line bg-gradient-to-r from-blue-50 via-white to-pink-50 p-6 sm:p-8',
        className,
      )}
    >
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-navy-800 sm:text-xl">
            Prefer to talk first?
          </h2>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">
            Call the clinic on {settings.phoneDisplay} or send a WhatsApp message. Clinic time is{' '}
            <span className="font-semibold text-navy-800">{settings.clinicHours}</span>.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
          <a
            href={buildPhoneHref(settings.phone)}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-semibold text-navy-800 transition-colors hover:bg-app"
          >
            <Phone className="h-4 w-4 text-pink-500" aria-hidden="true" />
            Call Clinic
          </a>
          <a
            href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
          <ButtonLink
            to={routes.bookAppointment}
            variant="primary"
            className="min-h-[46px] px-5 text-sm"
            leftIcon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
          >
            Book Appointment
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}