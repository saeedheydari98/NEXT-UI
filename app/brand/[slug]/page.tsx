"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ProductListingPage } from "@/app/products/product-listing-page";
import { useProductsCatalog } from "@/lib/products-catalog-context";
import { decodeCatalogSegment, slugifyCatalogValue } from "@/lib/products-client";

export default function BrandProductsPage() {
  const params = useParams();
  const rawSlug = params?.slug ?? "";
  const slug = decodeCatalogSegment(Array.isArray(rawSlug) ? rawSlug[0] : rawSlug);
  const { products, loading } = useProductsCatalog();

  const brandTitle = useMemo(
    () => products.find((product) => slugifyCatalogValue(product.brand || "") === slugifyCatalogValue(slug))?.brand || slug,
    [products, slug]
  );

  const brandProducts = useMemo(
    () =>
      products.filter((product) =>
        product.active !== false
        && product.isActive !== false
        && slugifyCatalogValue(product.brand || "") === slugifyCatalogValue(slug)
      ),
    [products, slug]
  );

  return (
    <ProductListingPage
      title={brandTitle}
      emptyText="محصولی برای این برند پیدا نشد."
      loading={loading}
      products={brandProducts}
    />
  );
}
