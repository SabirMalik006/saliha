import { useCallback, useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  Filter,
  Pencil,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react';
import { Button, ButtonLink } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import { SkeletonAdminRow } from '@/components/feedback/Skeletons';
import { TextInput } from '@/components/forms/Inputs';
import { Pagination } from '@/components/common/Pagination';
import { useAdminList, type AdminListResult } from '@/hooks/useAdminList';
import { useDebounce } from '@/hooks/useDebounce';
import { adminApi } from '@/services/adminApi';
import { normaliseApiError } from '@/services/apiClient';
import { useToast } from '@/context/ToastContext';
import { routes } from '@/routes/paths';
import { formatDateTime, truncate } from '@/utils/format';
import type { Service } from '@/types';

export default function ServicesManagementPage() {
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search: string; status: string }) =>
      adminApi.listServices(params) as Promise<AdminListResult<Service>>,
    [],
  );

  const list = useAdminList<Service>(fetcher);
  const debouncedSearch = useDebounce(list.searchInput, 400);

  // Push the debounced term into the URL so the list refetches once typing settles.
  useEffect(() => {
    if (debouncedSearch !== list.search) list.applySearch();
  }, [debouncedSearch, list]);

  const runAction = useCallback(
    async (action: () => Promise<unknown>, successMessage: string) => {
      try {
        await action();
        toast.success('Done', successMessage);
        list.refetch();
      } catch (error) {
        toast.error('Action failed', normaliseApiError(error).message);
      }
    },
    [list, toast],
  );

  // ConfirmDialog manages its own pending state while awaiting onConfirm.
  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await adminApi.deleteService(pendingDelete.id);
      toast.success('Service deleted', `“${pendingDelete.title}” has been removed.`);
      setPendingDelete(null);
      list.refetch();
    } catch (error) {
      toast.error('Could not delete service', normaliseApiError(error).message);
    }
  }, [list, pendingDelete, toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-navy-800 sm:text-2xl">Services</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Create, edit and publish the services shown on the public website.
          </p>
        </div>
        <ButtonLink
          to={routes.adminServiceNew}
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
        >
          Add Service
        </ButtonLink>
      </div>

      <Card padding="sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <TextInput
              label="Search"
              type="search"
              placeholder="Search by title or slug"
              value={list.searchInput}
              onChange={(event) => list.setSearchInput(event.target.value)}
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1.5 text-sm text-ink-soft">
              <Filter className="h-4 w-4 text-ink-faint" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Filter</span>
            </div>
            <select
              aria-label="Filter services by status"
              value={list.status}
              onChange={(event) => list.setStatus(event.target.value)}
              className="min-h-[44px] rounded-xl border border-line bg-white px-3.5 text-sm text-navy-800 outline-none transition-colors hover:border-ink-faint focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {list.search || list.status !== 'all' ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Search className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
            <span className="text-ink-soft">
              {list.items.length} result{list.items.length === 1 ? '' : 's'}
              {list.search ? ` for “${list.search}”` : ''}
              {list.status !== 'all' ? ` · ${list.status}` : ''}
            </span>
            <button
              type="button"
              onClick={list.clearFilters}
              className="font-semibold text-blue-600 hover:underline hover:underline-offset-4"
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </Card>

      {list.error ? (
        <ErrorState
          title="We could not load the services"
          message={list.error.message}
          onRetry={list.refetch}
        />
      ) : null}

      {!list.error && list.items.length === 0 && !list.isLoading ? (
        <EmptyState
          title="No services found"
          description={
            list.search || list.status !== 'all'
              ? 'Try a different search, or clear the filters to see all services.'
              : 'Add your first service to make it visible on the public website.'
          }
          action={
            <ButtonLink to={routes.adminServiceNew} variant="primary" size="sm">
              Add Service
            </ButtonLink>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.isLoading && list.items.length === 0
            ? Array.from({ length: 5 }, (_, index) => <SkeletonAdminRow key={index} />)
            : list.items.map((service) => (
                <Card key={service.id} padding="md">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-navy-800">{service.title}</h2>
                        <StatusBadge status={service.published ? 'published' : 'draft'} />
                        {service.featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                            <Star className="h-3 w-3" aria-hidden="true" />
                            Featured
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        {truncate(service.shortDescription, 160)}
                      </p>

                      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-faint">
                        <div className="flex gap-1.5">
                          <dt className="font-semibold">Slug:</dt>
                          <dd className="font-mono">/{service.slug}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="font-semibold">Icon:</dt>
                          <dd>{service.icon}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="font-semibold">Order:</dt>
                          <dd className="tabular-nums">{service.displayOrder}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt className="font-semibold">Updated:</dt>
                          <dd>{formatDateTime(service.updatedAt)}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <ButtonLink
                        to={`${routes.adminServices}/${service.id}/edit`}
                        variant="outline"
                        size="sm"
                        leftIcon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                      >
                        Edit
                      </ButtonLink>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void runAction(
                            () => adminApi.setServiceStatus(service.id, { published: !service.published }),
                            service.published
                              ? `“${service.title}” is now hidden from the public website.`
                              : `“${service.title}” is now published.`,
                          )
                        }
                        leftIcon={
                          service.published ? (
                            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        }
                      >
                        {service.published ? 'Unpublish' : 'Publish'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void runAction(
                            () => adminApi.setServiceStatus(service.id, { featured: !service.featured }),
                            service.featured
                              ? `“${service.title}” is no longer featured.`
                              : `“${service.title}” is now featured.`,
                          )
                        }
                        leftIcon={
                          service.featured ? (
                            <StarOff className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Star className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        }
                      >
                        {service.featured ? 'Unfeature' : 'Feature'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setPendingDelete(service)}
                        leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      )}

      {list.totalPages > 1 ? (
        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          onPageChange={list.setPage}
          label="Services"
        />
      ) : null}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete this service?"
        message={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete service"
        variant="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}