import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, MessageCircle, Phone, Search, Stethoscope } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container, Section } from '@/components/common/Layout';
import { ServiceGrid } from '@/components/services/ServiceCard';
import { ConsultationBanner } from '@/components/contact/ConsultationBanner';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import {
  SkeletonRegion,
  SkeletonServiceGrid,
} from '@/components/feedback/Skeletons';
import { Seo } from '@/components/seo/Seo';
import { useSettings } from '@/context/SettingsContext';
import { usePublishedServices } from '@/hooks/useServices';
import { routes } from '@/routes/paths';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { WHATSAPP_APPOINTMENT_MESSAGE } from '@/constants/clinic';
import { cn } from '@/utils/cn';

export default function ServicesPage() {
  const { settings } = useSettings();
  const { services, isLoading, error, refetch } = usePublishedServices();
  const [search, setSearch] = useState('');

  /**
   * Search runs against the real service data returned by the API, so the
   * filter can never show results that do not exist.
   */
  const visibleServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return services;
    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(term) ||
        service.shortDescription.toLowerCase().includes(term),
    );
  }, [services, search]);

  return (
    <>
      <Seo
        title="Gynecology & Obstetric Services | Specialist Clinic Rawalpindi"
        description="Antenatal care, menstrual and women's health problems, infertility evaluation, family planning, normal and C-section deliveries, menopause care and gynecological surgery consultations in Morgah, Rawalpindi."
        path={routes.services}
      />

      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-blue-50 to-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-4 h-64 w-64 rounded-full bg-pink-100/50 blur-2xl" />
        </div>

        <Container className="relative py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', to: routes.home },
              { label: 'Services' },
            ]}
          />

          <div className="mt-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-600">
              Our Services
            </p>
            <h1 className="mt-3 text-[2rem] leading-[1.14] text-navy-800 sm:text-[2.5rem]">
              Women's Health Services
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-[1.0625rem]">
              Consultations covering pregnancy, gynecology, fertility, family planning, menopause
              and delivery care with Dr. Saleha Ibtisam. Evening appointments are available from{' '}
              {settings.clinicHours}.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-6 text-base font-semibold text-navy-800 shadow-sm transition-colors hover:bg-app sm:w-auto"
              >
                <MessageCircle className="h-4.5 w-4.5 text-green-500" aria-hidden="true" />
                WhatsApp {settings.whatsappDisplay}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Section tone="white" padding="lg" labelledBy="services-list-title">
        <Container>
          <h2 id="services-list-title" className="sr-only">
            Available services
          </h2>

          {/* Search — operates on live service data */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {isLoading ? (
              <div className="h-5 w-52" aria-hidden="true">
                <div className="skeleton h-4 w-full" />
              </div>
            ) : (
              <p className="text-sm text-ink-soft" role="status" aria-live="polite">
                Showing {visibleServices.length} of {services.length} service
                {services.length === 1 ? '' : 's'}
              </p>
            )}

            <div className="relative w-full sm:max-w-xs">
              <label htmlFor="service-search" className="sr-only">
                Search services
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <input
                id="service-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services"
                className={cn(
                  'min-h-[46px] w-full rounded-xl border border-line bg-white pl-10 pr-4 text-[0.9375rem] text-navy-800 placeholder:text-ink-faint transition-colors hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100',
                )}
              />
            </div>
          </div>

          <div className="mt-8">
            {isLoading ? (
              <SkeletonRegion label="Loading services">
                <SkeletonServiceGrid count={6} columns={3} />
              </SkeletonRegion>
            ) : error ? (
              <ErrorState
                message="The services list could not be loaded. Please try again, or contact the clinic directly."
                onRetry={() => void refetch()}
              />
            ) : services.length === 0 ? (
              <EmptyState
                icon={<Stethoscope className="h-7 w-7" aria-hidden="true" />}
                title="No services published yet"
                description="Service listings are added from the admin dashboard. In the meantime, please contact the clinic directly."
                action={
                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href={buildPhoneHref(settings.phone)}
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-semibold text-navy-800 transition-colors hover:bg-app"
                    >
                      <Phone className="h-4 w-4 text-pink-500" aria-hidden="true" />
                      Call {settings.phoneDisplay}
                    </a>
                    <ButtonLink to={routes.contact} variant="primary" size="md">
                      Contact page
                    </ButtonLink>
                  </div>
                }
              />
            ) : visibleServices.length === 0 ? (
              <EmptyState
                icon={<Search className="h-7 w-7" aria-hidden="true" />}
                title="No matching services"
                description={`We could not find a service matching “${search.trim()}”. Try a different term, or contact the clinic for guidance.`}
                action={
                  <ButtonLink to={routes.bookAppointment} variant="primary" size="md">
                    Request an appointment
                  </ButtonLink>
                }
              />
            ) : (
              <ServiceGrid services={visibleServices} columns={3} />
            )}
          </div>
        </Container>
      </Section>

      <Section tone="subtle" padding="md">
        <Container>
          <div className="flex flex-col items-start gap-5 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-navy-800 sm:text-xl">
                Not sure which service applies?
              </h2>
              <p className="mt-1.5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
                Choose “General Obstetrics &amp; Gynecology” when you are unsure, or send us a
                message and the clinic team will guide you.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
              <ButtonLink
                to={routes.serviceDetail('general-obstetrics-gynecology')}
                variant="outline"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                General Consultation
              </ButtonLink>
              <ButtonLink to={routes.contact} variant="primary" size="md">
                Send a Message
              </ButtonLink>
            </div>
          </div>

          <div className="mt-6">
            <ConsultationBanner
              title="Book Your Appointment"
              description={`Request a consultation with ${settings.doctorName} at Specialist Clinic, Morgah, Rawalpindi.`}
              footnote={`Clinic time: ${settings.clinicHours}`}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}