import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface AdminListResult<T> {
  items: T[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

interface AdminListParams {
  page: number;
  limit: number;
  search: string;
  status: string;
}

/**
 * Paginated admin list with URL-backed search and status filters.
 * Refetches whenever page / search / status change.
 */
export function useAdminList<T>(
  fetcher: (params: AdminListParams) => Promise<AdminListResult<T>>,
  options: { limit?: number } = {},
) {
  const limit = options.limit ?? 25;

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');

  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const status = searchParams.get('status') ?? 'all';
  const search = searchParams.get('search') ?? '';

  const [result, setResult] = useState<AdminListResult<T>>({
    items: [],
    page: 1,
    totalPages: 1,
    isLoading: true,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setResult((prev) => ({ ...prev, isLoading: true, error: null }));

    fetcher({ page, limit, search, status })
      .then((next) => {
        if (!active) return;
        setResult({
          items: next.items ?? [],
          page: next.page ?? page,
          totalPages: next.totalPages ?? 1,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setResult((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Something went wrong'),
        }));
      });

    return () => {
      active = false;
    };
  }, [fetcher, page, limit, search, status, reloadToken]);

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void, resetPage = true) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      if (resetPage) next.delete('page');
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setPage = useCallback(
    (next: number) => {
      updateParams((params) => {
        if (next <= 1) params.delete('page');
        else params.set('page', String(next));
      }, false);
    },
    [updateParams],
  );

  const setStatus = useCallback(
    (next: string) => {
      updateParams((params) => {
        if (next === 'all') params.delete('status');
        else params.set('status', next);
      });
    },
    [updateParams],
  );

  const applySearch = useCallback(() => {
    updateParams((params) => {
      const term = searchInput.trim();
      if (term) params.set('search', term);
      else params.delete('search');
    });
  }, [searchInput, updateParams]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return {
    ...result,
    page,
    status,
    search,
    searchInput,
    setSearchInput,
    applySearch,
    clearFilters,
    setPage,
    setStatus,
    refetch: useCallback(() => setReloadToken((token) => token + 1), []),
  };
}