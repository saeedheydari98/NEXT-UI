"use client";

import { fetchJsonDeduped, invalidateFetchCache } from "@/lib/fetch-json";

const PRODUCTS_STORAGE_KEY = "admin-products";
const SHOWCASES_STORAGE_KEY = "admin-product-showcases";

const CATALOG_URL_ACTIVE = "/api/products";
const CATALOG_URL_ALL = "/api/products?all=1";

export type ProductRecord = {
  id?: number | string;
  showcaseId?: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  discountPrice?: string;
  discountPercent?: number | string;
  imageUrl?: string;
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
  active: boolean;
  sortOrder: number;
};

export type ShowcaseRecord = {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  sortOrder?: number;
  products?: ProductRecord[];
};

export type ProductsCache = {
  products: ProductRecord[];
  showcases: ShowcaseRecord[];
};

export type GetProductsOptions = {
  /** Include inactive products (admin). */
  all?: boolean;
  /** Bypass session cache and refetch. */
  force?: boolean;
};

function readLocalProducts(includeInactive: boolean): ProductRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || "[]");
    const list = Array.isArray(parsed) ? parsed : [];
    return includeInactive ? list : list.filter((item) => item.active !== false);
  } catch {
    return [];
  }
}

function readLocalShowcases(): ShowcaseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SHOWCASES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getProductKey(product: Partial<ProductRecord>) {
  return [
    product.title,
    product.description,
    product.price,
    product.originalPrice,
    product.discountPrice,
    product.imageUrl,
  ]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .join("|");
}

function dedupeProducts(products: ProductRecord[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    const key = getProductKey(product);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeLocalShowcaseIds(apiProducts: ProductRecord[], localProducts: ProductRecord[]) {
  const localByKey = new Map(
    localProducts.map((product) => [getProductKey(product), product.showcaseId ?? ""])
  );

  return apiProducts.map((product) => ({
    ...product,
    showcaseId: localByKey.get(getProductKey(product)) ?? product.showcaseId ?? "",
  }));
}

function buildShowcasesFromProducts(products: ProductRecord[], savedShowcases: ShowcaseRecord[]) {
  const byId = new Map(savedShowcases.map((showcase) => [String(showcase.id), showcase]));

  for (const product of products) {
    const showcaseId = String(product.showcaseId ?? "").trim();
    if (!showcaseId || byId.has(showcaseId)) continue;
    byId.set(showcaseId, {
      id: showcaseId,
      title: "Untitled showcase",
      active: true,
      sortOrder: byId.size + 1,
    });
  }

  return Array.from(byId.values());
}

function parseApiPayload(payload: unknown): ProductsCache {
  if (Array.isArray(payload)) {
    return { products: dedupeProducts(payload as ProductRecord[]), showcases: [] };
  }

  if (!payload || typeof payload !== "object") {
    return { products: [], showcases: [] };
  }

  const record = payload as { products?: ProductRecord[]; showcases?: ShowcaseRecord[] };
  return {
    products: Array.isArray(record.products) ? dedupeProducts(record.products) : [],
    showcases: Array.isArray(record.showcases) ? record.showcases : [],
  };
}

function withLocalFallback(apiData: ProductsCache, includeInactive: boolean): ProductsCache {
  const localProducts = dedupeProducts(readLocalProducts(includeInactive));
  const localShowcases = readLocalShowcases();

  const products =
    apiData.products.length > 0
      ? mergeLocalShowcaseIds(apiData.products, localProducts)
      : localProducts;

  const showcases =
    apiData.showcases.length > 0
      ? apiData.showcases
      : buildShowcasesFromProducts(products, localShowcases);

  return { products, showcases };
}

function resolveOptions(options?: boolean | GetProductsOptions): GetProductsOptions {
  if (typeof options === "boolean") return { force: options };
  return options ?? {};
}

/** Single catalog fetch per URL — deduped in-flight, cached for the session. */
export async function getProducts(options?: boolean | GetProductsOptions): Promise<ProductsCache> {
  const { all = false, force = false } = resolveOptions(options);
  const url = all ? CATALOG_URL_ALL : CATALOG_URL_ACTIVE;

  try {
    const json = await fetchJsonDeduped<{ data?: unknown }>(url, { force });
    return withLocalFallback(parseApiPayload(json?.data), all);
  } catch {
    return withLocalFallback({ products: [], showcases: [] }, all);
  }
}

export function findProductById(
  products: ProductRecord[],
  id: string | number
): ProductRecord | null {
  return products.find((product) => String(product.id) === String(id)) ?? null;
}

export function findShowcaseById(
  products: ProductRecord[],
  showcases: ShowcaseRecord[],
  id: string | number
): ShowcaseRecord | null {
  const showcase = showcases.find((item) => String(item.id) === String(id));
  if (!showcase) return null;

  const showcaseProducts = products.filter(
    (product) => String(product.showcaseId ?? "") === String(id) && product.active !== false
  );

  return {
    ...showcase,
    products: showcaseProducts,
  };
}

export function clearProductsCache() {
  invalidateFetchCache("/api/products");
}

export default { getProducts, findProductById, findShowcaseById, clearProductsCache };
