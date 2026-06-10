"use client";

import Loading from "@/app/design-system/components/loading/loading";

type CatalogSkeletonProps = {
  isLoading?: boolean;
};

function ProductRailCardSkeleton({ isLoading = true }: CatalogSkeletonProps) {
  return (
    <Loading loading="skeleton-card" isLoading={isLoading}>
      <article className="flex min-h-48 min-w-90 max-w-90 shrink-0 flex-col overflow-hidden rounded-lg border border-ui-primary/25 bg-bg-surface shadow-sm">
        <div className="flex min-h-36 flex-1 gap-3 p-3">
          <Loading loading="skeleton-item" isLoading={isLoading}>
            <div className="min-h-28 w-1/3 shrink-0 rounded-md" />
          </Loading>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Loading loading="skeleton-item" isLoading={isLoading}>
              <div className="text-sm font-bold">Product title line</div>
            </Loading>
            <Loading loading="skeleton-item" isLoading={isLoading}>
              <div className="text-xs leading-5">Short description line for layout</div>
            </Loading>
            <Loading loading="skeleton-item" isLoading={isLoading}>
              <div className="text-xs leading-5">Second description line here</div>
            </Loading>
            <Loading loading="skeleton-item" isLoading={isLoading}>
              <div className="text-sm font-semibold">$1,299.00</div>
            </Loading>
          </div>
        </div>
        <div className="flex min-h-12 gap-2 border-t border-ui-primary/15 p-3">
          <Loading loading="skeleton-item" isLoading={isLoading} className="flex-1">
            <div className="h-9 w-full rounded-md" />
          </Loading>
          <Loading loading="skeleton-item" isLoading={isLoading}>
            <div className="h-9 w-20 rounded-md" />
          </Loading>
        </div>
      </article>
    </Loading>
  );
}

export function ShowcaseSectionSkeleton({ isLoading = true }: CatalogSkeletonProps) {
  return (
    <Loading loading="skeleton-card" isLoading={isLoading}>
      <section className="flex flex-col gap-3 rounded-xl border border-ui-primary/30 bg-bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <Loading loading="skeleton-item" isLoading={isLoading}>
            <div className="text-xl font-bold">Showcase title</div>
          </Loading>
          <div className="flex items-center gap-2">
            <Loading loading="skeleton-item" isLoading={isLoading}>
              <div className="text-xs font-semibold">4 items</div>
            </Loading>
            <Loading loading="skeleton-item" isLoading={isLoading}>
              <div className="h-8 w-20 rounded-full" />
            </Loading>
          </div>
        </div>
        <div className="flex gap-3 overflow-hidden pb-2">
          <ProductRailCardSkeleton isLoading={isLoading} />
          <ProductRailCardSkeleton isLoading={isLoading} />
          <ProductRailCardSkeleton isLoading={isLoading} />
        </div>
      </section>
    </Loading>
  );
}

export function ProductCatalogSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <ShowcaseSectionSkeleton />
      <ShowcaseSectionSkeleton />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 py-8 px-4">
      <Loading loading="skeleton-card" isLoading>
        <section className="flex w-full flex-col gap-8 rounded-2xl border border-ui-primary/25 bg-bg-surface p-6 shadow-sm lg:flex-row lg:items-start">
          <Loading loading="skeleton-item" isLoading>
            <div className="aspect-square w-full max-w-md rounded-2xl lg:max-w-md" />
          </Loading>
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <Loading loading="skeleton-item" isLoading>
              <div className="h-6 w-24 rounded-full" />
            </Loading>
            <Loading loading="skeleton-item" isLoading>
              <div className="text-3xl font-bold">Product title placeholder text</div>
            </Loading>
            <div className="flex items-center gap-3">
              <Loading loading="skeleton-item" isLoading>
                <div className="h-5 w-28 rounded-md" />
              </Loading>
              <Loading loading="skeleton-item" isLoading>
                <div className="text-sm">128 reviews</div>
              </Loading>
            </div>
            <Loading loading="skeleton-card" isLoading>
              <div className="rounded-xl border border-ui-primary/15 bg-bg-base p-4">
                <Loading loading="skeleton-item" isLoading>
                  <div className="text-3xl font-bold">$2,499.00</div>
                </Loading>
              </div>
            </Loading>
            <div className="flex flex-col gap-2">
              <Loading loading="skeleton-item" isLoading>
                <div className="text-sm font-bold">About this product</div>
              </Loading>
              <Loading loading="skeleton-item" isLoading>
                <div className="text-sm leading-7">Description line one for layout sizing</div>
              </Loading>
              <Loading loading="skeleton-item" isLoading>
                <div className="text-sm leading-7">Description line two continues here</div>
              </Loading>
              <Loading loading="skeleton-item" isLoading>
                <div className="text-sm leading-7">Description line three for spacing</div>
              </Loading>
            </div>
            <div className="flex flex-wrap gap-3">
              <Loading loading="skeleton-item" isLoading>
                <div className="h-10 w-32 rounded-md" />
              </Loading>
              <Loading loading="skeleton-item" isLoading>
                <div className="h-10 w-28 rounded-md" />
              </Loading>
            </div>
          </div>
        </section>
      </Loading>

      <Loading loading="skeleton-card" isLoading>
        <section className="flex w-full flex-col gap-8 rounded-2xl border border-ui-primary/25 bg-bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-ui-primary/15 pb-6">
            <Loading loading="skeleton-item" isLoading>
              <div className="text-2xl font-bold">Customer reviews</div>
            </Loading>
            <Loading loading="skeleton-item" isLoading>
              <div className="text-sm">Read what shoppers think about this product.</div>
            </Loading>
          </div>
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
            <div className="flex w-full flex-col gap-5 lg:max-w-xs">
              <Loading loading="skeleton-card" isLoading>
                <div className="rounded-xl border border-ui-primary/20 bg-bg-base p-5">
                  <Loading loading="skeleton-item" isLoading>
                    <div className="text-4xl font-bold">4.8</div>
                  </Loading>
                  <Loading loading="skeleton-item" isLoading>
                    <div className="h-7 w-36 rounded-md" />
                  </Loading>
                </div>
              </Loading>
            </div>
            <div className="flex flex-1 flex-col gap-4">
              <Loading loading="skeleton-card" isLoading>
                <div className="rounded-xl border border-ui-primary/20 bg-bg-base p-5">
                  <Loading loading="skeleton-item" isLoading>
                    <div className="text-lg font-bold">Write a review</div>
                  </Loading>
                  <Loading loading="skeleton-item" isLoading>
                    <div className="min-h-28 w-full rounded-lg" />
                  </Loading>
                </div>
              </Loading>
            </div>
          </div>
        </section>
      </Loading>
    </div>
  );
}

export function ShowcaseGridSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <Loading loading="skeleton-item" isLoading>
        <div className="text-2xl font-bold">Showcase title placeholder</div>
      </Loading>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <ProductRailCardSkeleton />
        <ProductRailCardSkeleton />
        <ProductRailCardSkeleton />
      </div>
    </div>
  );
}
