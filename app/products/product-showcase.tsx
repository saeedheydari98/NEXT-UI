"use client";

import { useEffect, useMemo, useState } from "react";
import { IoBagHandleOutline, IoOpenOutline } from "react-icons/io5";
import { CustomButton } from "../design-system/components/ui/button";
import { CustomTag } from "../design-system/components/ui/tag";

type Product = {
  id?: number | string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
  active: boolean;
  sortOrder: number;
};

const PRODUCTS_STORAGE_KEY = "admin-products";

function readLocalProducts(): Product[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeProducts(...lists: Product[][]) {
  const seen = new Set<string>();
  const merged: Product[] = [];

  for (const item of lists.flat()) {
    const key = String(item.id ?? `${item.title}-${item.description}-${item.price}`);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged;
}

export function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        const apiProducts = Array.isArray(data?.data) ? data.data : [];
        const localProducts = readLocalProducts().filter((item) => item.active);
        setProducts(mergeProducts(apiProducts, localProducts));
      } catch {
        setProducts(readLocalProducts().filter((item) => item.active));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const sortedProducts = useMemo(
    () => products.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [products]
  );

  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2 border-b border-ui-primary/30 pb-4">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="max-w-2xl text-sm text-text-secondary">
            A dynamic product showcase managed from the admin panel.
          </p>
        </div>

        {loading && <div className="text-sm text-text-secondary">Loading products...</div>}

        {!loading && sortedProducts.length === 0 && (
          <div className="rounded-lg border border-ui-primary/30 bg-bg-surface p-6 text-sm text-text-secondary">
            No active products are available.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProducts.map((product, index) => (
            <article
              key={product.id ?? `${product.title}-${index}`}
              className="overflow-hidden rounded-lg border border-ui-primary/30 bg-bg-surface shadow-sm"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-ui-primary/10">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <IoBagHandleOutline className="text-6xl text-ui-primary" aria-hidden="true" />
                )}
                {product.badge && (
                  <div className="absolute left-3 top-3">
                    <CustomTag size="sm" rounded="full" border="base">
                      {product.badge}
                    </CustomTag>
                  </div>
                )}
              </div>

              <div className="flex min-h-56 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">{product.title}</h2>
                  <span className="shrink-0 font-semibold text-ui-primary">{product.price}</span>
                </div>
                <p className="flex-1 text-sm leading-6 text-text-secondary">{product.description}</p>
                <a href={product.ctaHref || "#"} className="inline-flex">
                  <CustomButton
                    type="button"
                    variant="primary"
                    border="base"
                    rounded="md"
                    size="sm"
                    iconAfter={<IoOpenOutline />}
                  >
                    {product.ctaLabel || "View product"}
                  </CustomButton>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
