import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container, Section } from '@/components/common/Layout';
import { PortraitSlot } from '@/components/common/SmartImage';
import { ConsultationBanner, PageCtaStrip } from '@/components/contact/ConsultationBanner';
import { MapLink } from '@/components/contact/ContactActions';
import { Seo } from '@/components/seo/Seo';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { useSettings } from '@/context/SettingsContext';
import { routes } from '@/routes/paths';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import {
  CLINIC_SERVICE_SUMMARY_SENTENCE,
  WHATSAPP_APPOINTMENT_MESSAGE,
} from '@/constants/clinic';

/**
 * Explanations for each qualification.
 *
 * `settings.doctorQualifications` decides which entries actually render, so BSc
 * appears only after the clinic confirms it (spec CONF-03) — the wording below
 * is ready but stays hidden until it is added to the settings.
 */
const CREDENTIAL_NOTES = [
  {
    label: 'MBBS',
    note: 'Bachelor of Medicine and Bachelor of Surgery',
  },
  {
    label: 'FCPS',
    note: 'Fellow of the College of Physicians and Surgeons',
  },
  {
    label: 'BSc',
    note: 'Bachelor of Science',
  },
];

/**
 * Areas of care. These describe what the clinic offers, not a career history.
 */
const AREAS_OF_CARE = [
  {
    icon: HeartHandshake,
    title: 'Pregnancy & Antenatal Care',
    description:
      'Routine consultations through pregnancy, with monitoring and guidance at each stage.',
  },
  {
    icon: ShieldCheck,
    title: 'Gynecology',
    description:
      'Consultation for menstrual concerns and common gynecological health problems.',
  },
  {
    icon: CalendarDays,
    title: 'Family Planning',
    description: 'Counseling on family planning and suitable contraceptive options.',
  },
  {
    icon: MapPin,
    title: 'Infertility Evaluation',
    description:
      'Assessment and treatment guidance for couples facing difficulty conceiving.',
  },
];

const PHILOSOPHY_POINTS = [
  {
    title: 'Safe Care',
    description:
      'Care decisions are guided by clinical findings and your individual situation, explained clearly before anything is decided.',
  },
  {
    title: 'Expert Guidance',
    description:
      'Consultant-level practice across obstetrics and gynecology, with advice given in plain language you can act on.',
  },
  {
    title: 'Better Tomorrow',
    description:
      'The aim is a clear plan and steady reassurance, so you know what happens next after each visit.',
  },
];

export default function AboutPage() {
  const { settings } = useSettings();

  return (
    <>
      <Seo
        title="About Dr. Saleha Ibtisam | Specialist Clinic Rawalpindi"
        description="About Dr. Saleha Ibtisam, Consultant Gynecologist & Obstetrician with MBBS and FCPS qualifications, practising at Specialist Clinic, Morgah, Rawalpindi."
        path={routes.about}
      />

      {/* Profile hero */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-blue-50 to-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-pink-100/50 blur-2xl" />
        </div>

        <Container className="relative py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', to: routes.home },
              { label: 'About' },
            ]}
          />

          <div className="mt-8 grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <PortraitSlot
                imageUrl="/images/doctor/dr-saleha.png"
                imageAlt={`Portrait of ${settings.doctorName}`}
                className="mx-auto max-w-sm lg:max-w-none"
              />
            </div>

            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-600">
                About Dr. Saleha Ibtisam
              </p>
              <h1 className="mt-3 text-[2rem] leading-[1.14] text-navy-800 sm:text-[2.5rem]">
                Consultant Gynecologist &amp; Obstetrician
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-[1.0625rem]">
                {settings.doctorDesignation} with {settings.doctorQualifications.join(' and ')}{' '}
                qualifications, {CLINIC_SERVICE_SUMMARY_SENTENCE.replace('provides ', '')}.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
                    Qualifications
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {settings.doctorQualifications.map((qualification) => (
                      <li key={qualification}>
                        <span className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-navy-50 px-3 text-sm font-bold text-navy-800 ring-1 ring-inset ring-navy-100">
                          <BadgeCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                          {qualification}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
                    Practice Location
                  </p>
                  <p className="mt-3 flex gap-2 text-sm font-semibold leading-relaxed text-navy-800">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                    <span>
                      {settings.addressLine}
                      <br />
                      {settings.addressLandmark}
                      <br />
                      {settings.addressCity}
                    </span>
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                    <Clock className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                    {settings.clinicHours}
                  </p>
                </div>
              </div>

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
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-6 text-base font-semibold text-green-700 transition-colors hover:bg-green-100 sm:w-auto"
                >
                  <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
                  WhatsApp {settings.whatsappDisplay}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Biography */}
      <Section tone="white" padding="lg" labelledBy="biography-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <h2 id="biography-title" className="text-[1.625rem] text-navy-800 sm:text-[2rem]">
                Biography
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-soft">
                <p>
                  {settings.doctorName} is a Consultant Gynecologist &amp; Obstetrician practising at
                  Specialist Clinic in Morgah, Rawalpindi. The clinic provides focused care across
                  pregnancy, gynecology, fertility, family planning and menopause.
                </p>
                <p>
                  Consultations cover routine antenatal care, menstrual and gynecological concerns,
                  infertility evaluation, family planning counselling, menopause care, delivery
                  planning including normal delivery and C-section when clinically required, and
                  consultation for gynecological conditions that may need surgical management.
                </p>
                <p>
                  Because many concerns in this area are sensitive or worrying, each consultation is
                  taken at an unhurried pace. Treatment options are explained in plain language,
                  including the reasons behind a recommendation, so you can decide with a clear
                  understanding of what is involved.
                </p>
                <p>
                  The clinic operates in the evening from {settings.clinicHours}, making it easier to
                  attend around work and family commitments. Patients are welcome to bring previous
                  reports or referral letters to the first consultation.
                </p>
              </div>

              <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-navy-800">
                Information on this page describes the clinic’s services in general terms. It is
                not a personal medical opinion, and a consultation is required before any diagnosis
                or treatment plan can be discussed.
              </p>
            </div>

            {/* Credentials */}
            <aside className="lg:col-span-5">
              <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-navy-800">Credentials</h2>

                <ol className="mt-5 space-y-0">
                  {CREDENTIAL_NOTES.filter((item) =>
                    settings.doctorQualifications.includes(item.label),
                  ).map((item, index, list) => (
                    <li key={item.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        {index < list.length - 1 ? (
                          <span aria-hidden="true" className="mt-1 w-px flex-1 bg-line" />
                        ) : null}
                      </div>
                      <div className={index < list.length - 1 ? 'pb-6' : 'pb-1'}>
                        <p className="text-[0.9375rem] font-semibold text-navy-800">{item.label}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{item.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 border-t border-line pt-5">
                  <h3 className="text-sm font-semibold text-navy-800">Designation</h3>
                  <p className="mt-1.5 text-sm text-ink-soft">{settings.doctorDesignation}</p>
                </div>

                <div className="mt-5">
                  <MapLink />
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Areas of care */}
      <Section tone="app" padding="lg" labelledBy="areas-title">
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-600">
              Areas of Care
            </p>
            <h2 id="areas-title" className="mt-3 text-[1.75rem] text-navy-800 sm:text-[2.125rem]">
              How the Clinic Can Help
            </h2>
          </div>

          <ul className="mt-9 grid gap-5 sm:grid-cols-2">
            {AREAS_OF_CARE.map((area) => (
              <li
                key={area.title}
                className="flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <area.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[0.9375rem] font-semibold text-navy-800">{area.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {area.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <PageCtaStrip />
          </div>
        </Container>
      </Section>

      {/* Care philosophy */}
      <Section tone="white" padding="lg" labelledBy="philosophy-title">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <ServiceIcon name="general" size="lg" className="mx-auto" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-pink-600">
              Care Philosophy
            </p>
            <h2
              id="philosophy-title"
              className="mt-3 text-[1.75rem] leading-tight text-navy-800 sm:text-[2.125rem]"
            >
              {settings.carePhilosophy}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Three principles guide how consultations are structured and how information is shared
              with patients.
            </p>
          </div>

          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {PHILOSOPHY_POINTS.map((point, index) => (
              <li
                key={point.title}
                className="relative overflow-hidden rounded-2xl border border-line bg-app p-6"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-4 text-6xl font-bold text-blue-100"
                >
                  {index + 1}
                </span>
                <h3 className="relative text-lg font-semibold text-navy-800">{point.title}</h3>
                <p className="relative mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {point.description}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Conversion */}
      <Section tone="white" padding="md">
        <Container>
          <ConsultationBanner
            title="Arrange a Consultation"
            description={`Request an appointment with ${settings.doctorName} at Specialist Clinic, Morgah, Rawalpindi.`}
            footnote={`Clinic time: ${settings.clinicHours}`}
          />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <a
              href={buildPhoneHref(settings.phone)}
              className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-navy-800 hover:text-blue-600"
            >
              <Phone className="h-4 w-4 text-pink-500" aria-hidden="true" />
              Call {settings.phoneDisplay}
            </a>
            <a
              href={buildPhoneHref(settings.alternatePhone)}
              className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-navy-800 hover:text-blue-600"
            >
              <Phone className="h-4 w-4 text-blue-400" aria-hidden="true" />
              Alternate {settings.alternatePhoneDisplay}
            </a>
            <Link
              to={routes.contact}
              className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-blue-600 hover:underline hover:underline-offset-4"
            >
              Contact page
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}