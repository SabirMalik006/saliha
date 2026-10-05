import { AlertTriangle, Loader2, RefreshCw, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

/**
 * Spinner.
 *
 * Only for genuine "we do not know the shape" waits — auth checks and
 * in-button submit feedback. Page content should use a skeleton from
 * `./Skeletons` instead, so the layout does not jump when data arrives.
 */
export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <>
      <Loader2
        className={cn('h-5 w-5 animate-spin text-blue-600 motion-reduce:animate-none', className)}
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