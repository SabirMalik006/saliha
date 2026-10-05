import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { SmartImage } from '@/components/common/SmartImage';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { formatDate } from '@/utils/format';
import type { GalleryItem } from '@/types';
import { cn } from '@/utils/cn';

export interface GalleryLightboxProps {
  items: GalleryItem[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  clinic: 'Clinic',
  awareness: 'Awareness',
  events: 'Events',
  promotional: 'Promotional',
};

/**
 * Accessible lightbox.
 *  - Escape closes, arrow keys navigate, Tab is trapped in the dialog
 *  - focus moves in on open and returns to the trigger on close
 *  - touch-friendly 44px controls
 */
export function GalleryLightbox({
  items,
  activeIndex,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const isOpen = activeIndex !== null;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useLockBodyScroll(isOpen);

  const item = isOpen ? items[activeIndex] : undefined;

  const goPrevious = useCallback(() => {
    if (activeIndex === null || items.length === 0) return;
    onNavigate((activeIndex - 1 + items.length) % items.length);
  }, [activeIndex, items.length, onNavigate]);

  const goNext = useCallback(() => {
    if (activeIndex === null || items.length === 0) return;
    onNavigate((activeIndex + 1) % items.length);
  }, [activeIndex, items.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 20);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrevious();
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose, goPrevious, goNext]);

  if (!isOpen || !item) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-navy-950/92 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      ref={panelRef}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm text-blue-200" aria-live="polite">
          {activeIndex + 1} of {items.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 sm:gap-4 sm:px-6">
        {items.length > 1 ? (
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Previous image"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10 sm:h-14 sm:w-14"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        ) : null}

        <figure className="flex max-h-full min-h-0 flex-1 flex-col items-center justify-center">
          <div className="max-h-[70vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white/5">
            <SmartImage
              src={item.imageUrl}
              alt={item.altText}
              aspectRatio="4 / 3"
              rounded="none"
              wrapperClassName="max-h-[70vh] w-full [&>img]:object-contain"
              loading="eager"
            />
          </div>
          <figcaption className="mt-4 max-w-2xl px-2 text-center">
            <p className="text-base font-semibold text-white">{item.title}</p>
            {item.caption ? (
              <p className="mt-1.5 text-sm leading-relaxed text-blue-200">{item.caption}</p>
            ) : null}
            <p className="mt-2 text-xs text-blue-300">
              {CATEGORY_LABELS[item.category] ?? item.category} · Added{' '}
              {formatDate(item.createdAt)}
            </p>
          </figcaption>
        </figure>

        {items.length > 1 ? (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10 sm:h-14 sm:w-14"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/* ==========================================================================
   Grid
   ========================================================================== */

export interface GalleryGridProps {
  items: GalleryItem[];
  onOpen: (index: number) => void;
  /** Highlight the category chip on hover/focus. */
  className?: string;
  /** Home page preview uses fewer, larger tiles. */
  preview?: boolean;
  /** Optional secondary action rendered above the grid. */
  onViewAll?: () => void;
}

export function GalleryGrid({
  items,
  onOpen,
  className,
  preview = false,
  onViewAll,
}: GalleryGridProps) {
  return (
    <div className={className}>
      {onViewAll ? (
        <div className="mb-5">
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-blue-600 transition-colors hover:text-pink-600 hover:underline hover:underline-offset-4"
          >
            View all gallery images
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <ul
        className={cn(
          'grid gap-4 sm:gap-5',
          preview ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        )}
      >
{items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpen(index)}
              aria-label={`Open image: ${item.title}`}
              className={cn(
                'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg focus-visible:-translate-y-1',
                preview ? '' : 'h-full',
              )}
            >
              <SmartImage
                src={item.imageUrl}
                alt={item.altText}
                aspectRatio="4 / 3"
                rounded="none"
                wrapperClassName="w-full"
              />

              <span className="flex flex-1 flex-col p-3.5 sm:p-4">
                <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-blue-700">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
                <span className="mt-2 text-[0.9375rem] font-semibold text-navy-800 transition-colors group-hover:text-blue-600">
                  {item.title}
                </span>
                {item.caption ? (
                  <span className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {item.caption}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { CATEGORY_LABELS };