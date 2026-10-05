import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container, Section } from '@/components/common/Layout';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { ServiceCard } from '@/components/services/ServiceCard';
import { SmartImage } from '@/components/common/SmartImage';
import { ConsultationBanner } from '@/components/contact/ConsultationBanner';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import { SkeletonRegion, SkeletonServiceDetail } from '@/components/feedback/Skeletons';
import { Seo } from '@/components/seo/Seo';
import { useSettings } from '@/context/SettingsContext';
import { usePublishedServices, useServiceBySlug } from '@/hooks/useServices';
import { routes } from '@/routes/paths';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { WHATSAPP_APPOINTMENT_MESSAGE } from '@/constants/clinic';

const RELATED_COUNT = 3;

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const service = useServiceBySlug(slug);
  const { services } = usePublishedServices();

  if (service.isLoading) {
    return (
      <Container>
        <SkeletonRegion label="Loading service details">
          <SkeletonServiceDetail />
        </SkeletonRegion>
      </Container>
    );
  }

  if (service.error) {
    const isNotFound = service.error.isNotFound;

    return (
      <>
        <Seo
          title={isNotFound ? 'Service Not Found | Specialist Clinic' : 'Service Unavailable'}
          description="The requested service could not be loaded."
          path={slug ? routes.serviceDetail(slug) : routes.services}
          noIndex
        />
        <Container className="py-16 sm:py-20">
          {isNotFound ? (
            <EmptyState
              icon={<AlertTriangle className="h-7 w-7" aria-hidden="true" />}
              title="We could not find that service"
              description="This service may have moved, or it may not be published yet. Browse the full services list to find what you need."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink to={routes.services} variant="primary" size="md">
                    View All Services
                  </ButtonLink>
                  <ButtonLink to={routes.contact} variant="outline" size="md">
                    Contact the clinic
                  </ButtonLink>
                </div>
              }
            />
          ) : (
            <ErrorState
              title="We could not load this service"
              message={service.error.message}
              onRetry={() => void service.refetch()}
            />
          )}

          <div className="mt-8 flex justify-center">
            <Link
              to={routes.services}
              className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline hover:underline-offset-4"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to all services
            </Link>
          </div>
        </Container>
      </>
    );
  }

  const current = service.data;
  if (!current) return null;

  const related = services
    .filter((item) => item.slug !== current.slug)
    .slice(0, RELATED_COUNT);

  const paragraphs = current.fullDescription
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      <Seo
        title={current.seoTitle || `${current.title} | Specialist Clinic Rawalpindi`}
        description={
          current.metaDescription ||
          current.shortDescription ||
          `${current.title} consultation with Dr. Saleha Ibtisam at Specialist Clinic, Morgah, Rawalpindi.`
        }
        path={routes.serviceDetail(current.slug)}
        type="article"
      />

      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-blue-50 to-white">
        <Container className="py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', to: routes.home },
              { label: 'Services', to: routes.services },
              { label: current.title },
            ]}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <ServiceIcon name={current.icon} size="lg" />
              <h1 className="mt-5 text-[2rem] leading-[1.14] text-navy-800 sm:text-[2.5rem]">
                {current.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-[1.0625rem]">
                {current.shortDescription}
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
                  href={buildPhoneHref(settings.phone)}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-6 text-base font-semibold text-navy-800 shadow-sm transition-colors hover:bg-app sm:w-auto"
                >
                  <Phone className="h-4.5 w-4.5 text-pink-500" aria-hidden="true" />
                  Call {settings.phoneDisplay}
                </a>
                <a
                  href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-6 text-base font-semibold text-green-700 transition-colors hover:bg-green-100 sm:w-auto"
                >
                  <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                <SmartImage
                  src={current.imageUrl}
                  alt={
                    current.imageAlt ??
                    `Illustration representing ${current.title.toLowerCase()} consultations`
                  }
                  aspectRatio="4 / 3"
                  rounded="none"
                  wrapperClassName="w-full"
                  loading="eager"
                />
                <div className="space-y-3 p-5">
                  <p className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <Clock className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                    Clinic time:{' '}
                    <span className="font-semibold text-navy-800">{settings.clinicHours}</span>
                  </p>
                  <p className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <CalendarDays
                      className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                      aria-hidden="true"
                    />
                    Evening appointments are available. The clinic team confirms each booking by
                    phone or WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Full description */}
      <Section tone="white" padding="lg">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <article className="lg:col-span-8">
              <h2 className="text-[1.5rem] text-navy-800 sm:text-[1.75rem]">
                About this service
              </h2>

              <div className="mt-5 space-y-4 text-base leading-[1.75] text-ink-soft">
                {paragraphs.map((paragraph, index) => (
                  <p key={`${current.id}-paragraph-${index}`}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <h3 className="text-[0.9375rem] font-semibold text-navy-800">
                  Important note about outcomes
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  No treatment can promise a cure, a pregnancy, a particular type of delivery or a
                  specific surgical result. Your consultation will be based on your own history,
                  examination findings and discussion at the time.
                </p>
              </div>
            </article>

            <aside className="lg:col-span-4">
              <div className="rounded-2xl border border-line bg-app p-6">
                <h2 className="text-base font-semibold text-navy-800">
                  Request an appointment
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Submitting the form sends a request. A member of the clinic team will contact you
                  to confirm availability.
                </p>

                <ButtonLink
                  to={routes.bookAppointment}
                  variant="accent"
                  size="lg"
                  fullWidth
                  className="mt-5"
                  leftIcon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
                >
                  Book Appointment
                </ButtonLink>

                <div className="mt-3 grid gap-2.5">
                  <a
                    href={buildPhoneHref(settings.phone)}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-navy-800 transition-colors hover:bg-app"
                  >
                    <Phone className="h-4 w-4 text-pink-500" aria-hidden="true" />
                    {settings.phoneDisplay}
                  </a>
                  <a
                    href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    WhatsApp {settings.whatsappDisplay}
                  </a>
                </div>

                <Link
                  to={routes.contact}
                  className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline hover:underline-offset-4"
                >
                  Full contact details
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Related services */}
      {related.length > 0 ? (
        <Section tone="subtle" padding="lg" labelledBy="related-title">
          <Container>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <h2 id="related-title" className="text-[1.625rem] text-navy-800 sm:text-[1.875rem]">
                  Related Services
                </h2>
                <p className="mt-2.5 text-base leading-relaxed text-ink-soft">
                  Other consultations available at Specialist Clinic.
                </p>
              </div>
              <ButtonLink
                to={routes.services}
                variant="outline"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                View All Services
              </ButtonLink>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ServiceCard key={item.id} service={item} variant="compact" />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section tone="white" padding="md">
        <Container>
          <ConsultationBanner
            title={`Book ${current.title}`}
            description={`Request a consultation with ${settings.doctorName} for ${current.title.toLowerCase()} at Specialist Clinic, Morgah, Rawalpindi.`}
            footnote={`Clinic time: ${settings.clinicHours}`}
          />
        </Container>
      </Section>
    </>
  );
}