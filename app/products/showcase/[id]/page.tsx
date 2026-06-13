"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import ProductLink from "@/app/design-system/components/ui/ProductLink";
import { useProductsCatalog } from "@/lib/products-catalog-context";
import { FiExternalLink } from "react-icons/fi";
import Loading from "@/app/design-system/components/loading/loading";

const LOADING_PRODUCTS = [
  {
    id: "loading-product-1",
    title: "Product title placeholder",
    price: "1299",
    description: "Short product description for loading layout",
  },
  {
    id: "loading-product-2",
    title: "Another product item",
    price: "899",
    description: "Second product description for sizing",
  },
  {
    id: "loading-product-3",
    title: "Premium catalog item",
    price: "2499",
    description: "Third product description for sizing",
  },
];

export default function ShowcasePage() {
  const params = useParams();
  const showcaseId = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");
  const { getShowcaseById, loading } = useProductsCatalog();
  const showcase = useMemo(() => getShowcaseById(showcaseId), [getShowcaseById, showcaseId]);
  const products = showcase?.products ?? [];

  if (loading && !showcase) {
    return (
      <main className="min-h-screen bg-bg-base text-text-primary">
        <div className="p-4 w-full">
          <div className="flex items-center justify-between">
            <Loading loading="skeleton-item" isLoading>
              <div className="text-2xl font-bold">Showcase title placeholder</div>
            </Loading>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {LOADING_PRODUCTS.map((product) => (
                <div key={product.id} className="rounded-md border border-[#e5e5e5] p-3 bg-bg-base">
                  <div className="flex gap-3">
                    <Loading loading="skeleton-item" isLoading>
                      <div className="w-24 h-24 overflow-hidden rounded bg-[#eeeeee]" />
                    </Loading>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col h-full">
                        <Loading loading="skeleton-item" isLoading>
                          <div className="text-sm font-bold">{product.title}</div>
                        </Loading>
                        <Loading loading="skeleton-item" isLoading>
                          <div className="text-ui-primary text-sm font-bold">{product.price}$</div>
                        </Loading>
                        <Loading loading="skeleton-item" isLoading>
                          <div className="text-xs text-text-secondary line-clamp-2">
                            {product.description}
                          </div>
                        </Loading>
                      </div>
                      <div className=" flex gap-2">
                        <Loading loading="skeleton-item" isLoading className="w-full">
                          <ProductLink iconAfter={<FiExternalLink />} productId={product.id}>
                            View
                          </ProductLink>
                        </Loading>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="p-4 w-full">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-col h-full">
                      <div className="text-sm font-bold">{product.title}</div>
                      <div className="text-ui-primary text-sm font-bold">{product.price}$</div>
                      <div className="text-xs text-text-secondary line-clamp-2">{product.description}</div>
                    </div>
                    <div className=" flex gap-2">
                      <ProductLink iconAfter={<FiExternalLink />} productId={product.id ?? String(product.id)}>View</ProductLink>
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
