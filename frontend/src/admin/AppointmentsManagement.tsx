import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, Filter, MessageCircle, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { SelectInput, TextArea, TextInput } from '@/components/forms/Inputs';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import {
  SkeletonListRows,
  SkeletonModal,
  SkeletonRegion,
} from '@/components/feedback/Skeletons';
import { useAdminList, type AdminListResult } from '@/hooks/useAdminList';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { adminApi } from '@/services/adminApi';
import { normaliseApiError } from '@/services/apiClient';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import {
  appointmentStatusLabel,
  formatDate,
  formatDateTime,
  formatRelative,
  formatTimeSlot,
} from '@/utils/format';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { CLINIC_TIME_SLOTS } from '@/constants/clinic';
import type { AppointmentRequest, AppointmentStatus } from '@/types';

const STATUS_OPTIONS: Array<{ value: AppointmentStatus; label: string }> = [
  { value: 'new', label: 'New request' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const BOOKABLE_SLOT_OPTIONS = CLINIC_TIME_SLOTS.filter(
  (slot) => slot.value !== 'any',
).map((slot) => ({ value: slot.value, label: slot.label }));

export default function AppointmentsManagementPage() {
  const toast = useToast();
  const { settings } = useSettings();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<AppointmentStatus>('new');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedTime, setConfirmedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search: string; status: string }) =>
      adminApi.listAppointments(params) as Promise<AdminListResult<AppointmentRequest>>,
    [],
  );

  const list = useAdminList<AppointmentRequest>(fetcher);
  const debouncedSearch = useDebounce(list.searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== list.search) list.applySearch();
  }, [debouncedSearch, list]);

  const detail = useAsync(
    async () => (selectedId ? adminApi.getAppointment(selectedId) : null),
    [selectedId],
  );

  const openDetail = (appointment: AppointmentRequest) => {
    setSelectedId(appointment.id);
    setDraftStatus(appointment.status);
    setConfirmedDate(appointment.confirmedDate ?? appointment.preferredDate);
    setConfirmedTime(appointment.confirmedTime ?? appointment.preferredTime);
    setNotes(appointment.internalNotes ?? '');
  };

  const closeDetail = () => setSelectedId(null);

  const saveDetail = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      await adminApi.updateAppointment(selectedId, {
        status: draftStatus,
        confirmedDate: draftStatus === 'confirmed' && confirmedDate ? confirmedDate : null,
        confirmedTime: draftStatus === 'confirmed' && confirmedTime ? confirmedTime : null,
        internalNotes: notes.trim() ? notes : null,
      });
      toast.success('Appointment updated', 'The appointment status has been saved.');
      closeDetail();
      list.refetch();
    } catch (error) {
      toast.error('Could not update the appointment', normaliseApiError(error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-800 sm:text-2xl">Appointment Requests</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Requests submitted through the website. These are not confirmed until you change the
          status to confirmed.
        </p>
      </div>

      <Card padding="sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label
              htmlFor="appointment-search"
              className="mb-1.5 block text-sm font-semibold text-navy-800"
            >
              Search
            </label>
            <input
              id="appointment-search"
              type="search"
              placeholder="Search by patient name or phone"
              value={list.searchInput}
              onChange={(event) => list.setSearchInput(event.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint hover:border-ink-faint focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1.5 text-sm text-ink-soft">
              <Filter className="h-4 w-4 text-ink-faint" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Filter</span>
            </div>
            <label htmlFor="appointment-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="appointment-status"
              value={list.status}
              onChange={(event) => list.setStatus(event.target.value)}
              className="min-h-[44px] rounded-xl border border-line bg-white px-3.5 text-sm text-navy-800 outline-none transition-colors hover:border-ink-faint focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {list.error ? (
        <ErrorState
          title="We could not load the appointments"
          message={list.error.message}
          onRetry={list.refetch}
        />
      ) : null}

      {!list.error && list.items.length === 0 && !list.isLoading ? (
        <EmptyState
          title="No appointment requests found"
          description={
            list.search || list.status !== 'all'
              ? 'Try a different search, or clear the filters.'
              : 'Requests submitted through the website booking form will appear here.'
          }
        />
      ) : list.isLoading && list.items.length === 0 ? (
        <SkeletonRegion
          label="Loading appointment requests"
          className="overflow-hidden rounded-2xl border border-line bg-white"
        >
          <SkeletonListRows count={5} />
        </SkeletonRegion>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <ul className="divide-y divide-line">
              {list.items.map((appointment) => (
                <li key={appointment.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-navy-800">
                          {appointment.patientName}
                        </h2>
                        <StatusBadge status={appointment.status} />
                        <span className="text-xs font-medium text-ink-faint">
                          {appointment.patientType === 'new' ? 'New patient' : 'Returning patient'}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm text-ink-soft">
                        {appointment.serviceName ?? 'General consultation'}
                      </p>

                      <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
                        <div className="flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
                          <dt className="sr-only">Requested slot</dt>
                          <dd>
                            {formatDate(appointment.preferredDate)} at{' '}
                            {formatTimeSlot(appointment.preferredTime)}
                          </dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
                          <dt className="sr-only">Phone</dt>
                          <dd>
                            <a
                              href={buildPhoneHref(appointment.phone)}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {appointment.phone}
                            </a>
                          </dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="font-semibold">Received:</dt>
                          <dd>{formatRelative(appointment.createdAt)}</dd>
                        </div>
                      </dl>

                      {appointment.status === 'confirmed' && appointment.confirmedDate ? (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Confirmed for {formatDate(appointment.confirmedDate)} at{' '}
                          {formatTimeSlot(appointment.confirmedTime)}
                        </p>
                      ) : null}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start"
                      onClick={() => openDetail(appointment)}
                    >
                      Manage
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {list.totalPages > 1 ? (
            <Pagination
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
              label="Appointment requests"
            />
          ) : null}
        </>
      )}

      <Modal
        isOpen={selectedId !== null}
        onClose={closeDetail}
        title={detail.data ? `Appointment for ${detail.data.patientName}` : 'Appointment request'}
        description={
          detail.data
            ? `${appointmentStatusLabel(detail.data.status)} · received ${formatRelative(detail.data.createdAt)}`
            : undefined
        }
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={closeDetail} disabled={isSaving}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => void saveDetail()}
              isLoading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        {detail.isLoading ? (
          <SkeletonRegion label="Loading appointment details">
            <SkeletonModal />
          </SkeletonRegion>
        ) : detail.error ? (
          <ErrorState
            title="We could not load this appointment"
            message={detail.error.message}
            onRetry={() => void detail.refetch()}
          />
        ) : detail.data ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Patient
                </dt>
                <dd className="mt-0.5 text-sm text-ink">
                  {detail.data.patientName}{' '}
                  <span className="text-ink-faint">
                    ({detail.data.patientType === 'new' ? 'new' : 'returning'})
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Service
                </dt>
                <dd className="mt-0.5 text-sm text-ink">
                  {detail.data.serviceName ?? 'General consultation'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Phone
                </dt>
                <dd className="mt-0.5 text-sm">
                  <a
                    href={buildPhoneHref(detail.data.phone)}
                    className="inline-flex items-center gap-1.5 text-ink hover:text-blue-600"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    {detail.data.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Email
                </dt>
                <dd className="mt-0.5 text-sm text-ink">
                  {detail.data.email ?? <span className="text-ink-faint">Not provided</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Requested
                </dt>
                <dd className="mt-0.5 text-sm text-ink">
                  {formatDate(detail.data.preferredDate)} at{' '}
                  {formatTimeSlot(detail.data.preferredTime)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Submitted
                </dt>
                <dd className="mt-0.5 text-sm text-ink">{formatDateTime(detail.data.createdAt)}</dd>
              </div>
            </dl>

            {detail.data.note ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Patient note
                </p>
                <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-line bg-app p-4 text-sm leading-relaxed text-ink">
                  {detail.data.note}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <a
                href={buildPhoneHref(detail.data.phone)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold text-navy-800 transition-colors hover:border-ink-faint"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call to confirm
              </a>
              <a
                href={buildWhatsAppHref(
                  detail.data.phone.replace(/\D/g, ''),
                  `Hello, this is regarding your appointment request for ${formatDate(detail.data.preferredDate)}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            </div>

            <div className="border-t border-line pt-5">
              <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs leading-relaxed text-blue-900">
                Clinic hours are {settings.clinicHours}. Only confirm slots within that window.
              </p>

              <SelectInput
                label="Status"
                options={STATUS_OPTIONS}
                value={draftStatus}
                onChange={(event) => setDraftStatus(event.target.value as AppointmentStatus)}
              />

              {draftStatus === 'confirmed' ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Confirmed date"
                    type="date"
                    value={confirmedDate}
                    onChange={(event) => setConfirmedDate(event.target.value)}
                  />
                  <SelectInput
                    label="Confirmed time"
                    options={BOOKABLE_SLOT_OPTIONS}
                    placeholder="Choose a slot"
                    value={confirmedTime}
                    onChange={(event) => setConfirmedTime(event.target.value)}
                  />
                </div>
              ) : null}

              <TextArea
                label="Internal notes"
                rows={4}
                maxLength={2000}
                containerClassName="mt-4"
                placeholder="Only visible to clinic staff."
                hint="Notes are not shown to the patient."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}