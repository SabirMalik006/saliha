import { AlertTriangle, Loader2, RefreshCw, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <>
      <Loader2
        className={cn('h-5 w-5 animate-spin text-blue-600', className)}
        aria-hidden="true"
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
}

export function InlineLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-ink-soft">
      <Spinner />
      {label}
    </span>
  );
}

export function LoadingState({
  label = 'Loading…',
  className,
  variant = 'block',
}: {
  label?: string;
  className?: string;
  variant?: 'block' | 'cards';
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      )}
    >
      <Spinner className="h-7 w-7" />
      <p className="text-sm font-medium text-ink-soft">{label}</p>

      {variant === 'cards' ? (
        <div className="mt-2 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="skeleton h-44 w-full" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Card-shaped placeholder that mirrors the real layout to avoid shifting. */
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="skeleton h-11 w-11 rounded-xl" />
      <div className="skeleton mt-4 h-4 w-3/4" />
      <div className="skeleton mt-3 h-3 w-full" />
      <div className="skeleton mt-2 h-3 w-5/6" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-white text-center',
        compact ? 'px-5 py-10' : 'px-6 py-16',
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
        {icon ?? <SearchX className="h-7 w-7" aria-hidden="true" />}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-navy-800">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  retryLabel?: string;
}

export function ErrorState({
  title = 'We could not load this content',
  message = 'Something went wrong. Please try again, or contact the clinic directly.',
  onRetry,
  className,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-pink-200 bg-pink-50 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-pink-600 shadow-sm">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-navy-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{message}</p>
      {onRetry ? (
        <Button
          variant="outline"
          className="mt-6"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}