"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import ProductLink from "@/app/design-system/components/ui/ProductLink";
import { useProductsCatalog } from "@/lib/products-catalog-context";
import { ShowcaseGridSkeleton } from "@/app/products/product-showcase/catalog-skeletons";

export default function ShowcasePage() {
  const params = useParams();
  const showcaseId = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");
  const { getShowcaseById, loading } = useProductsCatalog();
  const showcase = useMemo(() => getShowcaseById(showcaseId), [getShowcaseById, showcaseId]);
  const products = showcase?.products ?? [];

  if (loading && !showcase) {
    return (
      <main className="min-h-screen bg-bg-base text-text-primary">
        <ShowcaseGridSkeleton />
      </main>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold">{showcase?.title || `Showcase: ${showcaseId}`}</div>
      </div>

      {showcase?.description ? (
        <div className="mt-2 text-sm text-text-secondary">{showcase.description}</div>
      ) : null}

      <div className="mt-4">
        {products.length === 0 ? (
          <div className="text-sm text-text-secondary">No products found for this showcase.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-md border border-ui-primary/20 p-3 bg-bg-base">
                <div className="flex gap-3">
                  <div className="w-24 h-24 overflow-hidden rounded bg-ui-primary/10">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-2 text-sm">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{product.title}</div>
                    <div className="text-xs text-text-secondary line-clamp-2">{product.description}</div>
                    <div className="mt-2 flex gap-2">
                      <ProductLink productId={product.id ?? String(product.id)}>View</ProductLink>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
