import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

const CONTROL_BASE =
  'w-full rounded-xl border bg-white px-4 text-[0.9375rem] text-navy-800 transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-soft';

const CONTROL_OK = 'border-line hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
const CONTROL_ERROR =
  'border-pink-400 bg-pink-50/40 hover:border-pink-500 focus:border-pink-500 focus:ring-4 focus:ring-pink-100';

export function controlClasses(hasError: boolean, extra?: string): string {
  return cn(CONTROL_BASE, hasError ? CONTROL_ERROR : CONTROL_OK, extra);
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-pink-600">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: (props: {
    id: string;
    'aria-invalid': boolean | undefined;
    'aria-describedby': string | undefined;
  }) => ReactNode;
  /** Rendered on the right of the label row, e.g. a character counter. */
  labelAdornment?: ReactNode;
}

/**
 * Shared label / control / error / hint structure.
 *
 * Errors are wired with `aria-describedby` and `aria-invalid` so screen
 * readers announce them, and the error text is not signalled by colour alone.
 */
export function Field({
  id,
  label,
  required = false,
  error,
  hint,
  className,
  children,
  labelAdornment,
}: FieldShellProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-navy-800">
          {label}
          {required ? (
            <>
              <span aria-hidden="true" className="ml-0.5 text-pink-500">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          ) : (
            <span className="ml-1.5 text-xs font-normal text-ink-faint">(optional)</span>
          )}
        </label>
        {labelAdornment}
      </div>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })}

      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          {hint}
        </p>
      ) : null}

      <FieldError id={errorId} message={error} />
    </div>
  );
}

/**
 * Honeypot field: visually and programmatically hidden from users, but
 * reachable by naive bots. Never validated with "required".
 */
/**
 * Hidden field that only automated spam bots fill in. Typed loosely so any
 * React Hook Form field map can be passed in without casting at the call site.
 */
export function HoneypotField({
  register,
  name = 'company',
}: {
  register: (name: never) => unknown;
  name?: string;
}) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor={`${name}-trap`}>Company</label>
      <input
        id={`${name}-trap`}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...(register(name as never) as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    </div>
  );
}

/** Non-field-specific error, e.g. a server or network failure. */
export function FormAlert({
  tone = 'error',
  title,
  message,
  className,
}: {
  tone?: 'error' | 'info' | 'success';
  title: string;
  message?: string;
  className?: string;
}) {
  const tones = {
    error: 'border-pink-200 bg-pink-50 text-pink-800',
    info: 'border-blue-200 bg-blue-50 text-navy-800',
    success: 'border-green-200 bg-green-50 text-green-800',
  } as const;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-xl border px-4 py-3.5', tones[tone], className)}
    >
      <p className="text-sm font-semibold">{title}</p>
      {message ? <p className="mt-1 text-sm leading-relaxed">{message}</p> : null}
    </div>
  );
}