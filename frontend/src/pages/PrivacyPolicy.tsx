import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container, Section } from '@/components/common/Layout';
import { Seo } from '@/components/seo/Seo';
import { useSettings } from '@/context/SettingsContext';
import { routes } from '@/routes/paths';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { WHATSAPP_APPOINTMENT_MESSAGE } from '@/constants/clinic';

export default function PrivacyPolicyPage() {
  const { settings } = useSettings();

  return (
    <>
      <Seo
        title="Privacy Policy | Specialist Clinic Rawalpindi"
        description="How Specialist Clinic collects, uses and stores the contact and appointment information you submit through this website."
        path={routes.privacyPolicy}
      />

      <section className="border-b border-line bg-gradient-to-b from-blue-50 to-white">
        <Container className="py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', to: routes.home },
              { label: 'Privacy Policy' },
            ]}
          />
          <h1 className="mt-8 max-w-3xl text-[2rem] leading-[1.14] text-navy-800 sm:text-[2.5rem]">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-[1.0625rem]">
            This page explains what information this website collects and how Specialist Clinic uses
            it. It is written for the contact and appointment forms on this site.
          </p>
        </Container>
      </section>

      <Section tone="white" padding="lg">
        <Container size="narrow">
          <div className="space-y-10">
            <section>
              <h2 className="text-xl text-navy-800">What we collect</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                When you use the contact form or request an appointment, we collect the details you
                choose to enter:
              </p>
              <ul className="mt-4 space-y-2.5 text-base leading-relaxed text-ink-soft">
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  Your full name.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  Your phone or WhatsApp number.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  Your email address, if you choose to provide one.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  Your message, or the short note on an appointment request.
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  For appointment requests: your preferred date and time, chosen service, and
                  whether you are a new or returning patient.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-navy-800">Why we collect it</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                We use this information only for two purposes:
              </p>
              <ol className="mt-4 space-y-3 text-base leading-relaxed text-ink-soft">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                    1
                  </span>
                  <span>To respond to your inquiry or contact you about the service you asked about.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                    2
                  </span>
                  <span>
                    To coordinate appointments — for example, confirming a date and time, or contacting
                    you if something needs to change.
                  </span>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl text-navy-800">What we ask you not to send</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                Please do not submit medical reports, test results, prescriptions or detailed
                medical history through these forms. The website is not a secure channel for
                clinical records. Bring those documents directly to your consultation.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-navy-800">How long we keep it</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                Contact and appointment submissions are kept only as long as needed to respond and
                to coordinate appointments, and are not published on this website. You can ask us
                to delete your submitted contact details at any time by calling the clinic.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-navy-800">Who can see it</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                Only clinic staff who need the information to respond or coordinate appointments.
                Patient information is never displayed on public pages of this website, and it is
                not part of any public page address.
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                This website does not ask you to create a patient account, and there is no public
                patient portal.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-navy-800">Website security</h2>
              <p className="mt-3 flex items-start gap-3 text-base leading-relaxed text-ink-soft">
                <Lock className="mt-1 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                <span>
                  The website uses HTTPS in production and the administrative area is restricted to
                  authorised clinic staff. Administrative pages are not indexed by search engines.
                </span>
              </p>
              <p className="mt-3 flex items-start gap-3 text-base leading-relaxed text-ink-soft">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                <span>
                  No website can guarantee absolute security. Please avoid sending information that
                  is not needed for arranging an appointment.
                </span>
              </p>
            </section>

            <section>
              <h2 className="text-xl text-navy-800">Contact</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                If you have any question about how your information is used, contact the clinic:
              </p>
              <ul className="mt-4 space-y-2.5 text-base">
                <li>
                  <a
                    href={buildPhoneHref(settings.phone)}
                    className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-navy-800 hover:text-blue-600"
                  >
                    Phone: {settings.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-navy-800 hover:text-green-600"
                  >
                    WhatsApp: {settings.whatsappDisplay}
                  </a>
                </li>
                {settings.notificationEmail ? (
                  <li>
                    <a
                      href={`mailto:${settings.notificationEmail}`}
                      className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-navy-800 hover:text-blue-600"
                    >
                      <Mail className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      {settings.notificationEmail}
                    </a>
                  </li>
                ) : null}
              </ul>
            </section>
          </div>

          <div className="mt-12 rounded-2xl border border-line bg-app p-6">
            <h2 className="text-base font-semibold text-navy-800">Scope of this policy</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              This policy covers information submitted through this website only. It does not cover
              medical records created during a consultation, which are handled separately by the
              clinic.
            </p>
            <Link
              to={routes.contact}
              className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline hover:underline-offset-4"
            >
              Go to the Contact page
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}