import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button, ButtonLink } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import { Pagination } from '@/components/common/Pagination';
import { SmartImage } from '@/components/common/SmartImage';
import { TextInput } from '@/components/forms/Inputs';
import { useAdminList, type AdminListResult } from '@/hooks/useAdminList';
import { useDebounce } from '@/hooks/useDebounce';
import { adminApi } from '@/services/adminApi';
import { normaliseApiError } from '@/services/apiClient';
import { useToast } from '@/context/ToastContext';
import { routes } from '@/routes/paths';
import { formatDateTime, truncate } from '@/utils/format';
import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryItem } from '@/types';

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  clinic: 'Clinic',
  awareness: 'Awareness',
  events: 'Events',
  promotional: 'Promotional',
};

export default function GalleryManagementPage() {
  const toast = useToast();
  const [category, setCategory] = useState<string>('all');
  const [pendingDelete, setPendingDelete] = useState<GalleryItem | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search: string; status: string }) =>
      adminApi.listGallery({ ...params, category: category === 'all' ? undefined : category }) as Promise<
        AdminListResult<GalleryItem>
      >,
    [category],
  );

  const list = useAdminList<GalleryItem>(fetcher);
  const debouncedSearch = useDebounce(list.searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== list.search) list.applySearch();
  }, [debouncedSearch, list]);

  // Changing the category starts a fresh result set, so drop stale paging.
  const { clearFilters } = list;
  useEffect(() => {
    if (category !== 'all') clearFilters();
  }, [category, clearFilters]);

  const togglePublished = useCallback(
    async (item: GalleryItem) => {
      try {
        await adminApi.updateGalleryItem(item.id, { published: !item.published });
        toast.success(
          'Done',
          item.published
            ? `“${item.title}” is now hidden from the gallery.`
            : `“${item.title}” is now published.`,
        );
        list.refetch();
      } catch (error) {
        toast.error('Action failed', normaliseApiError(error).message);
      }
    },
    [list, toast],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await adminApi.deleteGalleryItem(pendingDelete.id);
      toast.success('Image deleted', `“${pendingDelete.title}” has been removed.`);
      setPendingDelete(null);
      list.refetch();
    } catch (error) {
      toast.error('Could not delete image', normaliseApiError(error).message);
    }
  }, [list, pendingDelete, toast]);

  

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-navy-800 sm:text-2xl">Gallery</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Manage the images shown in the clinic gallery. Drafts are not visible publicly.
          </p>
        </div>
        <ButtonLink
          to={routes.adminGalleryNew}
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
        >
          Add Image
        </ButtonLink>
      </div>

      <Card padding="sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <TextInput
              label="Search"
              type="search"
              placeholder="Search by title or alt text"
              value={list.searchInput}
              onChange={(event) => list.setSearchInput(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex items-center gap-1.5 text-sm text-ink-soft">
              <Filter className="h-4 w-4 text-ink-faint" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Filter</span>
            </div>

            <select
              aria-label="Filter images by status"
              value={list.status}
              onChange={(event) => list.setStatus(event.target.value)}
              className="min-h-[44px] rounded-xl border border-line bg-white px-3.5 text-sm text-navy-800 outline-none transition-colors hover:border-ink-faint focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              aria-label="Filter images by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-[44px] rounded-xl border border-line bg-white px-3.5 text-sm text-navy-800 outline-none transition-colors hover:border-ink-faint focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <option value="all">All categories</option>
              {GALLERY_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {list.search || list.status !== 'all' || category !== 'all' ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Search className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
            <span className="text-ink-soft">
              {list.items.length} result{list.items.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={() => {
                setCategory('all');
                list.clearFilters();
              }}
              className="font-semibold text-blue-600 hover:underline hover:underline-offset-4"
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </Card>

      {list.error ? (
        <ErrorState
          title="We could not load the gallery"
          message={list.error.message}
          onRetry={list.refetch}
        />
      ) : null}

      {!list.error && list.items.length === 0 && !list.isLoading ? (
        <EmptyState
          title="No images found"
          description={
            list.search || list.status !== 'all' || category !== 'all'
              ? 'Try a different search, or clear the filters.'
              : 'Upload your first clinic image to get started.'
          }
          action={
            <ButtonLink to={routes.adminGalleryNew} variant="primary" size="sm">
              Add Image
            </ButtonLink>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.isLoading && list.items.length === 0
              ? Array.from({ length: 6 }, (_, index) => (
                  <Card key={index} padding="none">
                    <div className="skeleton aspect-4/3 w-full rounded-t-2xl" />
                    <div className="space-y-2 p-4">
                      <div className="skeleton h-4 w-2/3" />
                      <div className="skeleton h-3 w-full" />
                    </div>
                  </Card>
                ))
              : list.items.map((item) => (
                  <Card key={item.id} padding="none" className="overflow-hidden">
                    <div className="relative aspect-4/3 w-full bg-app">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.altText}
                        className="h-full w-full object-cover"
                        wrapperClassName="h-full w-full"
                      />
                      {!item.published ? (
                        <span className="absolute left-3 top-3">
                          <StatusBadge status="draft" />
                        </span>
                      ) : null}
                    </div>

                    <div className="p-4">
                      <h2 className="text-sm font-semibold text-navy-800">{item.title}</h2>
                      {item.caption ? (
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                          {truncate(item.caption, 80)}
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs text-ink-faint">
                        {CATEGORY_LABELS[item.category]} · Order {item.displayOrder} ·{' '}
                        {formatDateTime(item.updatedAt)}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <ButtonLink
                          to={`${routes.adminGallery}/${item.id}/edit`}
                          variant="outline"
                          size="sm"
                          leftIcon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                        >
                          Edit
                        </ButtonLink>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void togglePublished(item)}
                          leftIcon={
                            item.published ? (
                              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            )
                          }
                        >
                          {item.published ? 'Unpublish' : 'Publish'}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setPendingDelete(item)}
                          leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
          </div>

          {list.totalPages > 1 ? (
            <Pagination
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
              label="Gallery items"
            />
          ) : null}
        </>
      )}

      <p className="flex items-start gap-2 pb-2 text-xs leading-relaxed text-ink-faint">
        <Upload className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Accepts JPG, PNG, WebP and AVIF up to 5 MB. Every image needs descriptive alt text so it
        can be read by screen-reader users.{' '}
        <Link to={routes.adminGalleryNew} className="font-semibold text-blue-600 hover:underline">
          Add an image
        </Link>
      </p>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete this image?"
        message={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently removed from the gallery. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete image"
        variant="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}