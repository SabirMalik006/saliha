import { useMemo, useState } from 'react';
import { Images } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container, Section } from '@/components/common/Layout';
import { ConsultationBanner } from '@/components/contact/ConsultationBanner';
import { GalleryGrid, GalleryLightbox, CATEGORY_LABELS } from '@/components/gallery/GalleryGrid';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import { SkeletonGalleryGrid, SkeletonRegion } from '@/components/feedback/Skeletons';
import { Seo } from '@/components/seo/Seo';
import { useGallery } from '@/hooks/useGallery';
import { routes } from '@/routes/paths';
import type { GalleryCategory } from '@/types';
import { cn } from '@/utils/cn';

type FilterValue = GalleryCategory | 'all';

export default function GalleryPage() {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const gallery = useGallery(filter);

  /** Filters are derived from the published data, so only real values appear. */
  const filters = useMemo(() => {
    const counts = gallery.availableCategories;
    const entries: Array<{ value: FilterValue; label: string; count: number }> = [
      { value: 'all', label: 'All', count: gallery.items.length },
    ];

    for (const [category, count] of counts) {
      entries.push({
        value: category,
        label: CATEGORY_LABELS[category] ?? category,
        count,
      });
    }
    return entries;
  }, [gallery.availableCategories, gallery.items.length]);

  return (
    <>
      <Seo
        title="Gallery | Specialist Clinic Morgah, Rawalpindi"
        description="Images from Specialist Clinic, Morgah, Rawalpindi — clinic spaces, women's health awareness sessions and clinic announcements."
        path={routes.gallery}
      />

      <section className="border-b border-line bg-gradient-to-b from-blue-50 to-white">
        <Container className="py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', to: routes.home },
              { label: 'Gallery' },
            ]}
          />

          <div className="mt-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-600">Gallery</p>
            <h1 className="mt-3 text-[2rem] leading-[1.14] text-navy-800 sm:text-[2.5rem]">
              Inside Specialist Clinic
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-[1.0625rem]">
              Browse images published by the clinic. Select any image to open a larger view — use
              the arrow keys to move between images and press Escape to close.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="white" padding="lg">
        <Container>
          {gallery.isLoading ? (
            <SkeletonRegion label="Loading gallery images">
              <SkeletonGalleryGrid count={6} />
            </SkeletonRegion>
          ) : gallery.error ? (
            <ErrorState
              title="We could not load the gallery"
              message="The gallery images could not be loaded right now. Please try again."
              onRetry={() => void gallery.refetch()}
            />
          ) : (
            <>
              {/* Category filters */}
              <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold text-navy-800">Filter by category</h2>

                <div
                  role="group"
                  aria-label="Gallery categories"
                  className="flex flex-wrap gap-2"
                >
                  {filters.map((entry) => {
                    const isActive = entry.value === filter;
                    return (
                      <button
                        key={entry.value}
                        type="button"
                        onClick={() => setFilter(entry.value)}
                        aria-pressed={isActive}
                        className={cn(
                          'inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors',
                          isActive
                            ? 'border-navy-800 bg-navy-800 text-white'
                            : 'border-line bg-white text-ink-soft hover:border-blue-300 hover:bg-blue-50 hover:text-navy-800',
                        )}
                      >
                        {entry.label}
                        <span
                          className={cn(
                            'rounded-full px-1.5 text-xs tabular-nums',
                            isActive ? 'bg-white/20 text-white' : 'bg-app text-ink-faint',
                          )}
                        >
                          {entry.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-5 text-sm text-ink-soft" role="status" aria-live="polite">
                Showing {gallery.items.length} image{gallery.items.length === 1 ? '' : 's'}
                {filter !== 'all' ? ` in ${CATEGORY_LABELS[filter] ?? filter}` : ''}.
              </p>

              <div className="mt-6">
                {gallery.items.length === 0 ? (
                  <EmptyState
                    icon={<Images className="h-7 w-7" aria-hidden="true" />}
                    title={
                      filter === 'all'
                        ? 'No gallery images yet'
                        : `No images in ${CATEGORY_LABELS[filter] ?? filter}`
                    }
                    description={
                      filter === 'all'
                        ? 'Clinic photographs will appear here once the clinic approves and publishes them.'
                        : 'Try a different category, or view all images.'
                    }
                    action={
                      filter !== 'all' ? (
                        <button
                          type="button"
                          onClick={() => setFilter('all')}
                          className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-navy-800 transition-colors hover:bg-app"
                        >
                          Show all images
                        </button>
                      ) : undefined
                    }
                  />
                ) : (
                  <GalleryGrid items={gallery.items} onOpen={setActiveIndex} />
                )}
              </div>
            </>
          )}
        </Container>
      </Section>

      <Section tone="subtle" padding="md">
        <Container>
          <ConsultationBanner />
        </Container>
      </Section>

      <GalleryLightbox
        items={gallery.items}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}