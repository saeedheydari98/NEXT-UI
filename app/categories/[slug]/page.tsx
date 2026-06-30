"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ProductListingPage } from "@/app/products/product-listing-page";
import { useProductsCatalog } from "@/lib/products-catalog-context";
import {
  decodeCatalogSegment,
  normalizeStringList,
  slugifyCatalogValue,
} from "@/lib/products-client";

export default function CategoryProductsPage() {
  const params = useParams();
  const rawSlug = params?.slug ?? "";
  const slug = decodeCatalogSegment(Array.isArray(rawSlug) ? rawSlug[0] : rawSlug);
  const { products, categories, loading } = useProductsCatalog();

  const category = useMemo(
    () =>
      categories.find((item) =>
        item.id === slug
        || slugifyCatalogValue(item.slug || item.title || item.id) === slugifyCatalogValue(slug)
      ),
    [categories, slug]
  );

  const categoryProducts = useMemo(() => {
    const categoryId = category?.id ?? slug;
    return products.filter((product) => {
      const categoryIds = normalizeStringList(product.categoryIds, [String(product.categoryId ?? "")]);
      return product.active !== false && product.isActive !== false && categoryIds.includes(String(categoryId));
    });
  }, [category?.id, products, slug]);

  return (
    <ProductListingPage
      title={category?.title || "محصولات دسته بندی"}
      emptyText="محصولی برای این دسته بندی پیدا نشد."
      loading={loading}
      products={categoryProducts}
    />
  );
}
