import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  Images,
  Mail,
  RefreshCw,
  Stethoscope,
} from 'lucide-react';
import { Button, ButtonLink } from '@/components/common/Button';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { EmptyState, ErrorState, SkeletonCard } from '@/components/feedback/States';
import { useAsync } from '@/hooks/useAsync';
import { adminApi } from '@/services/adminApi';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/routes/paths';
import { formatDate, formatDateTime, formatRelative, formatTimeSlot, truncate } from '@/utils/format';
import type { DashboardSummary } from '@/types';

interface SummaryCard {
  label: string;
  value: number;
  hint: string;
  to: string;
  Icon: typeof Mail;
  tone: 'blue' | 'pink' | 'navy' | 'green';
}

const TONE_STYLES = {
  blue: 'bg-blue-50 text-blue-600',
  pink: 'bg-pink-50 text-pink-600',
  navy: 'bg-navy-50 text-navy-600',
  green: 'bg-green-50 text-green-600',
} as const;

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const dashboard = useAsync<DashboardSummary>(() => adminApi.dashboard(), []);

  const cards: SummaryCard[] = dashboard.data
    ? [
        {
          label: 'New Contact Inquiries',
          value: dashboard.data.newInquiries,
          hint: `${dashboard.data.totalInquiries} total received`,
          to: routes.adminInquiries,
          Icon: Mail,
          tone: 'blue',
        },
        {
          label: 'Appointment Requests',
          value: dashboard.data.newAppointments,
          hint: `${dashboard.data.totalAppointments} total received`,
          to: routes.adminAppointments,
          Icon: CalendarClock,
          tone: 'pink',
        },
        {
          label: 'Published Services',
          value: dashboard.data.publishedServices,
          hint: `${dashboard.data.totalServices} total services`,
          to: routes.adminServices,
          Icon: Stethoscope,
          tone: 'navy',
        },
        {
          label: 'Published Gallery Items',
          value: dashboard.data.publishedGalleryItems,
          hint: `${dashboard.data.totalGalleryItems} total images`,
          to: routes.adminGallery,
          Icon: Images,
          tone: 'green',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-navy-800 sm:text-2xl">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Here is the current activity for Specialist Clinic.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void dashboard.refetch()}
          isLoading={dashboard.isLoading}
          leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
        >
          Refresh
        </Button>
      </div>

      {dashboard.error ? (
        <ErrorState
          title="We could not load the dashboard"
          message={dashboard.error.message}
          onRetry={() => void dashboard.refetch()}
        />
      ) : null}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.isLoading && !dashboard.data
          ? Array.from({ length: 4 }, (_, index) => <SkeletonCard key={index} />)
          : cards.map((card) => (
              <Link key={card.label} to={card.to} className="group block h-full">
                <Card
                  padding="md"
                  className="h-full transition-[box-shadow,border-color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONE_STYLES[card.tone]}`}
                    >
                      <card.Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-4 text-3xl font-bold tabular-nums text-navy-800">
                    {card.value}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-navy-800">{card.label}</p>
                  <p className="mt-1 text-xs text-ink-soft">{card.hint}</p>
                </Card>
              </Link>
            ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <ButtonLink
          to={routes.adminServices}
          variant="outline"
          size="sm"
          leftIcon={<Stethoscope className="h-4 w-4" aria-hidden="true" />}
        >
          Manage Services
        </ButtonLink>
        <ButtonLink
          to={routes.adminGallery}
          variant="outline"
          size="sm"
          leftIcon={<Images className="h-4 w-4" aria-hidden="true" />}
        >
          Manage Gallery
        </ButtonLink>
        <ButtonLink
          to={routes.adminInquiries}
          variant="outline"
          size="sm"
          leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
        >
          View Inquiries
        </ButtonLink>
        <ButtonLink
          to={routes.adminAppointments}
          variant="outline"
          size="sm"
          leftIcon={<CalendarClock className="h-4 w-4" aria-hidden="true" />}
        >
          View Appointments
        </ButtonLink>
      </div>

      {/* Recent activity */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card padding="none">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-navy-800">Recent Inquiries</h2>
            <Link
              to={routes.adminInquiries}
              className="text-sm font-semibold text-blue-600 hover:underline hover:underline-offset-4"
            >
              View all
            </Link>
          </div>

          {dashboard.data && dashboard.data.recentInquiries.length === 0 ? (
            <EmptyState
              compact
              title="No inquiries yet"
              description="Messages sent from the website contact form will appear here."
            />
          ) : dashboard.data ? (
            <ul className="divide-y divide-line">
              {dashboard.data.recentInquiries.map((inquiry) => (
                <li key={inquiry.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-navy-800">{inquiry.fullName}</p>
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {inquiry.phone} · {truncate(inquiry.message, 80)}
                  </p>
                  <p className="mt-1.5 text-xs text-ink-faint">
                    {formatRelative(inquiry.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="skeleton h-14 w-full" />
              ))}
            </div>
          )}
        </Card>

        <Card padding="none">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-navy-800">
              Recent Appointment Requests
            </h2>
            <Link
              to={routes.adminAppointments}
              className="text-sm font-semibold text-blue-600 hover:underline hover:underline-offset-4"
            >
              View all
            </Link>
          </div>

          {dashboard.data && dashboard.data.recentAppointments.length === 0 ? (
            <EmptyState
              compact
              title="No appointment requests yet"
              description="Requests submitted through the website appear here for confirmation."
            />
          ) : dashboard.data ? (
            <ul className="divide-y divide-line">
              {dashboard.data.recentAppointments.map((appointment) => (
                <li key={appointment.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-navy-800">{appointment.patientName}</p>
                    <StatusBadge status={appointment.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatDate(appointment.preferredDate)} ·{' '}
                    {formatTimeSlot(appointment.preferredTime)} ·{' '}
                    {appointment.serviceName ?? 'Other'}
                  </p>
                  <p className="mt-1.5 text-xs text-ink-faint">
                    {appointment.patientType === 'new' ? 'New' : 'Returning'} patient ·{' '}
                    {formatDateTime(appointment.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="skeleton h-14 w-full" />
              ))}
            </div>
          )}
        </Card>
      </div>

      <p className="pb-2 text-xs leading-relaxed text-ink-faint">
        Counts reflect the data returned by the API. On a fresh installation all figures will be
        zero. <Badge tone="neutral" size="sm">Admin area</Badge>
      </p>
    </div>
  );
}