import { useCallback, useEffect, useState } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { SelectInput, TextArea } from '@/components/forms/Inputs';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import {
  SkeletonModal,
  SkeletonMobileList,
  SkeletonRegion,
  SkeletonTableRows,
} from '@/components/feedback/Skeletons';
import { useAdminList, type AdminListResult } from '@/hooks/useAdminList';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { adminApi } from '@/services/adminApi';
import { normaliseApiError } from '@/services/apiClient';
import { useToast } from '@/context/ToastContext';
import { formatRelative, inquiryStatusLabel, truncate } from '@/utils/format';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { WHATSAPP_APPOINTMENT_MESSAGE } from '@/constants/clinic';
import type { ContactInquiry, InquiryStatus } from '@/types';

const STATUS_OPTIONS: Array<{ value: InquiryStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

export default function InquiriesManagementPage() {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [draftStatus, setDraftStatus] = useState<InquiryStatus>('new');
  const [isSaving, setIsSaving] = useState(false);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search: string; status: string }) =>
      adminApi.listInquiries(params) as Promise<AdminListResult<ContactInquiry>>,
    [],
  );

  const list = useAdminList<ContactInquiry>(fetcher);
  const debouncedSearch = useDebounce(list.searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== list.search) list.applySearch();
  }, [debouncedSearch, list]);

  // Full record is fetched on demand so the modal always shows the latest notes.
  const detail = useAsync(
    async () => (selectedId ? adminApi.getInquiry(selectedId) : null),
    [selectedId],
  );

  const openDetail = (inquiry: ContactInquiry) => {
    setSelectedId(inquiry.id);
    setDraftStatus(inquiry.status);
    setNotes(inquiry.internalNotes ?? '');
  };

  const closeDetail = () => setSelectedId(null);

  const saveDetail = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      await adminApi.updateInquiry(selectedId, {
        status: draftStatus,
        internalNotes: notes.trim() ? notes : null,
      });
      toast.success('Inquiry updated', 'The status and notes have been saved.');
      closeDetail();
      list.refetch();
    } catch (error) {
      toast.error('Could not update the inquiry', normaliseApiError(error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-800 sm:text-2xl">Contact Inquiries</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Messages sent through the website contact form.
        </p>
      </div>

      <Card padding="sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label
              htmlFor="inquiry-search"
              className="mb-1.5 block text-sm font-semibold text-navy-800"
            >
              Search
            </label>
            <input
              id="inquiry-search"
              type="search"
              placeholder="Search by name or phone"
              value={list.searchInput}
              onChange={(event) => list.setSearchInput(event.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint hover:border-ink-faint focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
            />
          </div>

          <div className="flex items-end gap-2">
            <label htmlFor="inquiry-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="inquiry-status"
              value={list.status}
              onChange={(event) => list.setStatus(event.target.value)}
              className="min-h-[44px] rounded-xl border border-line bg-white px-3.5 text-sm text-navy-800 outline-none transition-colors hover:border-ink-faint focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      {list.error ? (
        <ErrorState
          title="We could not load the inquiries"
          message={list.error.message}
          onRetry={list.refetch}
        />
      ) : null}

      {!list.error && list.items.length === 0 && !list.isLoading ? (
        <EmptyState
          title="No inquiries found"
          description={
            list.search || list.status !== 'all'
              ? 'Try a different search, or clear the filters.'
              : 'Messages sent from the website contact form will appear here.'
          }
        />
      ) : list.isLoading && list.items.length === 0 ? (
        <SkeletonRegion
          label="Loading inquiries"
          className="overflow-hidden rounded-2xl border border-line bg-white"
        >
          <div className="hidden lg:block">
            <table className="w-full">
              <caption className="sr-only">Loading contact inquiries</caption>
              <thead className="border-b border-line bg-app">
                <tr>
                  {['From', 'Subject', 'Message', 'Received', 'Status'].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <SkeletonTableRows count={6} columns={5} />
              </tbody>
            </table>
          </div>
          <div className="lg:hidden">
            <SkeletonMobileList count={4} />
          </div>
        </SkeletonRegion>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {/* Desktop table */}
            <table className="hidden w-full text-left lg:table">
              <caption className="sr-only">Contact inquiries</caption>
              <thead className="border-b border-line bg-app">
                <tr>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    From
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Subject
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Message
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Received
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.items.map((inquiry) => (
                  <tr key={inquiry.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-navy-800">{inquiry.fullName}</p>
                      <a
                        href={buildPhoneHref(inquiry.phone)}
                        className="mt-0.5 block text-sm text-ink-soft hover:text-blue-600"
                      >
                        {inquiry.phone}
                      </a>
                      {inquiry.email ? (
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="block text-sm text-ink-soft hover:text-blue-600"
                        >
                          {inquiry.email}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-soft">
                      {inquiry.subject.replace(/-/g, ' ')}
                    </td>
                    <td className="max-w-sm px-5 py-4 text-sm text-ink-soft">
                      {truncate(inquiry.message, 120)}
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-soft">
                      {formatRelative(inquiry.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <StatusBadge status={inquiry.status} />
                        <button
                          type="button"
                          onClick={() => openDetail(inquiry)}
                          className="text-sm font-semibold text-blue-600 hover:underline hover:underline-offset-4"
                        >
                          Open
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line lg:hidden">
              {list.items.map((inquiry) => (
                <li key={inquiry.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-navy-800">{inquiry.fullName}</p>
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {inquiry.subject.replace(/-/g, ' ')} · {formatRelative(inquiry.createdAt)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{inquiry.message}</p>
                  <button
                    type="button"
                    onClick={() => openDetail(inquiry)}
                    className="mt-3 text-sm font-semibold text-blue-600 hover:underline hover:underline-offset-4"
                  >
                    Open inquiry
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {list.totalPages > 1 ? (
            <Pagination
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
              label="Inquiries"
            />
          ) : null}
        </>
      )}

      <Modal
        isOpen={selectedId !== null}
        onClose={closeDetail}
        title={detail.data ? `Inquiry from ${detail.data.fullName}` : 'Inquiry'}
        description={
          detail.data
            ? `${inquiryStatusLabel(detail.data.status)} · received ${formatRelative(detail.data.createdAt)}`
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
          <SkeletonRegion label="Loading inquiry details">
            <SkeletonModal />
          </SkeletonRegion>
        ) : detail.error ? (
          <ErrorState
            title="We could not load this inquiry"
            message={detail.error.message}
            onRetry={() => void detail.refetch()}
          />
        ) : detail.data ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Name
                </dt>
                <dd className="mt-0.5 text-sm text-ink">{detail.data.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Subject
                </dt>
                <dd className="mt-0.5 text-sm text-ink">
                  {detail.data.subject.replace(/-/g, ' ')}
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
                <dd className="mt-0.5 text-sm">
                  {detail.data.email ? (
                    <a
                      href={`mailto:${detail.data.email}`}
                      className="inline-flex items-center gap-1.5 text-ink hover:text-blue-600"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      {detail.data.email}
                    </a>
                  ) : (
                    <span className="text-ink-faint">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                Message
              </p>
              <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-line bg-app p-4 text-sm leading-relaxed text-ink">
                {detail.data.message}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={buildPhoneHref(detail.data.phone)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold text-navy-800 transition-colors hover:border-ink-faint"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call
              </a>
              <a
                href={buildWhatsAppHref(
                  detail.data.phone.replace(/\D/g, ''),
                  WHATSAPP_APPOINTMENT_MESSAGE,
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
              <SelectInput
                label="Status"
                options={STATUS_OPTIONS}
                value={draftStatus}
                onChange={(event) => setDraftStatus(event.target.value as InquiryStatus)}
              />

              <TextArea
                label="Internal notes"
                rows={4}
                maxLength={2000}
                containerClassName="mt-4"
                placeholder="Only visible to clinic staff."
                hint="Notes are not shown to the sender."
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