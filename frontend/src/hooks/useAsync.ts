import { useCallback, useEffect, useRef, useState } from 'react';
import { normaliseApiError, type ApiError } from '@/services/apiClient';

interface AsyncState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
}

export interface UseAsyncResult<T> extends AsyncState<T> {
  refetch: () => Promise<T | null>;
  setData: (value: T | null) => void;
}

/**
 * Minimal, predictable data-fetching hook.
 *
 * Handles: loading state, error normalisation, cancellation of stale results
 * and manual refetching. No external state library required.
 */
export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: { enabled?: boolean } = {},
): UseAsyncResult<T> {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: enabled,
  });

  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async (): Promise<T | null> => {
    const id = ++requestIdRef.current;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetcherRef.current();
      if (!mountedRef.current || id !== requestIdRef.current) return null;
      setState({ data: result, error: null, isLoading: false });
      return result;
    } catch (error) {
      if (!mountedRef.current || id !== requestIdRef.current) return null;
      setState({ data: null, error: normaliseApiError(error), isLoading: false });
      return null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, isLoading: false });
      return;
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run, ...deps]);

  const setData = useCallback((value: T | null) => {
    setState((prev) => ({ ...prev, data: value }));
  }, []);

  return { ...state, refetch: run, setData };
}