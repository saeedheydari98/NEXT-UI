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
  const { products, brands, loading } = useProductsCatalog();

  const brand = useMemo(
    () => brands.find((item) =>
      slugifyCatalogValue(item.slug || "") === slugifyCatalogValue(slug)
      || slugifyCatalogValue(item.id) === slugifyCatalogValue(slug)
      || slugifyCatalogValue(item.title) === slugifyCatalogValue(slug)
    ),
    [brands, slug]
  );

  const brandTitle = brand?.title || products.find((product) => slugifyCatalogValue(product.brand || "") === slugifyCatalogValue(slug))?.brand || slug;

  const brandProducts = useMemo(
    () =>
      products.filter((product) =>
        product.active !== false
        && product.isActive !== false
        && (
          slugifyCatalogValue(product.brand || "") === slugifyCatalogValue(slug)
          || (brand && (product.brand === brand.id || product.brand === brand.title || slugifyCatalogValue(product.brand || "") === slugifyCatalogValue(brand.slug || "")))
        )
      ),
    [brand, products, slug]
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
