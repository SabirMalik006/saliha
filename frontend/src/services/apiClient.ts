import axios, { AxiosError, type AxiosInstance } from 'axios';
import { appConfig } from '@/config/env';
import type { ApiErrorShape } from '@/types';
import { mockAdapter } from '@/mocks/adapter';

/**
 * Readable, user-safe message for each failure class.
 * Never surface stack traces or raw internal messages.
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'The information provided is not valid. Please review the form and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested content could not be found.',
  409: 'This record already exists.',
  413: 'That file is too large. Please upload a smaller file.',
  422: 'Some of the information provided needs attention.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again.',
  502: 'The service is temporarily unavailable. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
};

/** Normalised error used across the app. */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string>;
  readonly isNetworkError: boolean;

  constructor(shape: ApiErrorShape & { isNetworkError?: boolean }) {
    super(shape.message);
    this.name = 'ApiError';
    this.status = shape.status;
    this.code = shape.code;
    this.fieldErrors = shape.fieldErrors;
    this.isNetworkError = shape.isNetworkError ?? false;
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  get isUnauthorised(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get canRetry(): boolean {
    return this.status >= 500 || this.isNetworkError || this.isRateLimited;
  }
}

/** Pull a useful, non-sensitive message out of an unknown server response. */
function extractServerMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;

  const direct = record.message ?? record.error;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const nested = record.errors;
  if (nested && typeof nested === 'object') {
    const firstValue = Object.values(nested as Record<string, unknown>)[0];
    if (typeof firstValue === 'string' && firstValue.trim()) return firstValue.trim();
  }

  return undefined;
}

/** Collect per-field validation messages from common server response shapes. */
function extractFieldErrors(payload: unknown): Record<string, string> | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  const source = (record.errors ?? record.fieldErrors) as
    | Record<string, unknown>
    | undefined
    | undefined;

  if (!source || typeof source !== 'object' || Array.isArray(source)) return undefined;

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string' && value.trim()) {
      result[key] = value.trim();
    } else if (Array.isArray(value)) {
      const first = value.find((entry) => typeof entry === 'string');
      if (typeof first === 'string') result[key] = first;
    }
  }
  return Object.keys(result).length ? result : undefined;
}

export function normaliseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;

    if (!axiosError.response) {
      return new ApiError({
        message:
          'We could not reach the server. Please check your internet connection and try again.',
        status: 0,
        isNetworkError: true,
      });
    }

    const { status, data } = axiosError.response;
    const serverMessage = extractServerMessage(data);

    return new ApiError({
      message: serverMessage ?? STATUS_MESSAGES[status] ?? 'Request failed. Please try again.',
      status,
      code:
        data && typeof data === 'object' && 'code' in (data as Record<string, unknown>)
          ? String((data as Record<string, unknown>).code)
          : undefined,
      fieldErrors: extractFieldErrors(data),
    });
  }

  return new ApiError({
    message: 'Something went wrong. Please try again.',
    status: 0,
  });
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: appConfig.apiBaseUrl || undefined,
  withCredentials: appConfig.withCredentials,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
  },
  // Obvious, single-point switch between the real backend and the dev mock.
  ...(appConfig.useMockApi ? { adapter: mockAdapter } : {}),
});

apiClient.interceptors.request.use((config) => {
  config.headers.set?.('X-Requested-With', 'XMLHttpRequest');
  return config;
});

/** Unwrap `{ data: ... }` envelopes and normalise any failure. */
export async function request<T>(
  config: Parameters<AxiosInstance['request']>[0],
): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw normaliseApiError(error);
  }
}

export const http = {
  get: <T>(url: string, config?: Record<string, unknown>) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    request<T>({ ...config, method: 'POST', url, data }),
  put: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    request<T>({ ...config, method: 'PUT', url, data }),
  patch: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    request<T>({ ...config, method: 'PATCH', url, data }),
  delete: <T>(url: string, config?: Record<string, unknown>) =>
    request<T>({ ...config, method: 'DELETE', url }),
};

export { STATUS_MESSAGES };