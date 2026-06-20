"use client";

import { fetchJsonDeduped, invalidateFetchCache } from "@/lib/fetch-json";

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
  stockQuantity?: number | string;
  colorStock?: unknown;
  sortOrder: number;
  placement?: number | string;
};

export type ShowcaseRecord = {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  sortOrder?: number;
  placement?: number | string;
  products?: ProductRecord[];
};

export type BannerRecord = {
  id: string;
  title?: string;
  showcaseId?: string | null;
  imageUrls?: string[];
  images?: unknown;
  active?: boolean;
  sortOrder?: number;
  placement?: number | string;
};

export type CatalogTreeSection =
  | {
      type: "banner";
      sortOrder: number;
      item: BannerRecord;
    }
  | {
      type: "showcase";
      sortOrder: number;
      item: ShowcaseRecord;
      products: ProductRecord[];
    };

export type CatalogTree = {
  sections: CatalogTreeSection[];
};

export type CatalogObject = {
  placement?: number;
  showcases: Array<ShowcaseRecord & { products: ProductRecord[] }>;
  banners: BannerRecord[];
};

type CatalogApiTree = {
  type?: "root";
  placement?: number | string;
  children?: Array<
    | (BannerRecord & { type: "banner" })
    | (ShowcaseRecord & { type: "showcase"; products?: ProductRecord[] })
  >;
};

export type ProductsCache = {
  products: ProductRecord[];
  showcases: ShowcaseRecord[];
  banners: BannerRecord[];
  tree: CatalogTree;
  catalog: CatalogObject;
};

export type GetProductsOptions = {
  /** Include inactive products (admin). */
  all?: boolean;
  /** Bypass session cache and refetch. */
  force?: boolean;
};

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

function emptyProductsCache(): ProductsCache {
  return {
    products: [],
    showcases: [],
    banners: [],
    tree: { sections: [] },
    catalog: { placement: 0, showcases: [], banners: [] },
  };
}

function getPlacement(item: { placement?: number | string; sortOrder?: number | string } | undefined, fallback = 0) {
  if (Number.isFinite(Number(item?.placement))) return Number(item?.placement);
  if (Number.isFinite(Number(item?.sortOrder))) return Number(item?.sortOrder);
  return fallback;
}

function getBannerImageUrls(banner: BannerRecord) {
  if (Array.isArray(banner.imageUrls)) {
    return banner.imageUrls.map((item) => String(item)).filter(Boolean);
  }

  if (!Array.isArray(banner.images)) return [];

  return banner.images
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "url" in item) {
        return String((item as { url?: unknown }).url ?? "");
      }
      return "";
    })
    .filter(Boolean);
}

export function normalizeColorStock(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([color, count]) => [
        color.trim(),
        Math.max(0, Math.round(Number(count))),
      ] as const)
      .filter(([color, count]) => color && Number.isFinite(count))
  );
}

function normalizeProductRecord(product: ProductRecord, fallbackOrder: number): ProductRecord {
  const placement = getPlacement(product, fallbackOrder);

  return {
    ...product,
    active: product.active !== false,
    stockQuantity: Number.isFinite(Number(product.stockQuantity)) ? Math.max(0, Math.round(Number(product.stockQuantity))) : 0,
    colorStock: normalizeColorStock(product.colorStock),
    sortOrder: placement,
    placement,
  };
}

function normalizeShowcaseRecord(showcase: ShowcaseRecord, fallbackOrder: number): ShowcaseRecord {
  const placement = getPlacement(showcase, fallbackOrder);

  return {
    ...showcase,
    active: showcase.active !== false,
    sortOrder: placement,
    placement,
  };
}

function normalizeBannerRecord(banner: BannerRecord, fallbackOrder: number): BannerRecord {
  const placement = getPlacement(banner, fallbackOrder);
  const imageUrls = getBannerImageUrls(banner);

  return {
    ...banner,
    imageUrls,
    active: banner.active !== false,
    sortOrder: placement,
    placement,
  };
}

function readTreePayload(payload: unknown): CatalogObject | null {
  if (!payload || typeof payload !== "object") return null;

  const tree = payload as CatalogApiTree;
  if (!Array.isArray(tree.children)) return null;

  const showcases = tree.children
    .filter((item) => item.type === "showcase")
    .map((showcase, showcaseIndex) => ({
      ...normalizeShowcaseRecord(showcase as ShowcaseRecord, showcaseIndex + 1),
      products: Array.isArray((showcase as ShowcaseRecord).products)
        ? ((showcase as ShowcaseRecord).products ?? []).map((product, productIndex) =>
            normalizeProductRecord(
              {
                ...product,
                showcaseId: String(product.showcaseId ?? showcase.id),
              },
              productIndex + 1
            )
          )
        : [],
    }));

  const banners = tree.children
    .filter((item) => item.type === "banner")
    .map((banner, bannerIndex) => normalizeBannerRecord(banner as BannerRecord, bannerIndex + 1));

  return {
    placement: getPlacement(tree, 0),
    showcases,
    banners,
  };
}

function parseApiPayload(payload: unknown): ProductsCache {
  if (Array.isArray(payload)) {
    return {
      ...emptyProductsCache(),
      products: dedupeProducts((payload as ProductRecord[]).map(normalizeProductRecord)),
    };
  }

  if (!payload || typeof payload !== "object") {
    return emptyProductsCache();
  }

  const record = payload as {
    products?: ProductRecord[];
    showcases?: ShowcaseRecord[];
    banners?: BannerRecord[];
    tree?: CatalogTree;
    catalog?: Partial<CatalogObject>;
  };
  const treeCatalog = readTreePayload(payload);

  const catalogShowcases = treeCatalog
    ? treeCatalog.showcases
    : Array.isArray(record.catalog?.showcases)
      ? record.catalog.showcases.map((showcase, showcaseIndex) => ({
        ...normalizeShowcaseRecord(showcase, showcaseIndex + 1),
        products: Array.isArray(showcase.products)
          ? showcase.products.map((product, productIndex) =>
              normalizeProductRecord(
                {
                  ...product,
                  showcaseId: String(product.showcaseId ?? showcase.id),
                },
                productIndex + 1
              )
            )
          : [],
      }))
      : [];
  const catalogBanners = treeCatalog
    ? treeCatalog.banners
    : Array.isArray(record.catalog?.banners)
      ? record.catalog.banners.map(normalizeBannerRecord)
      : [];
  const fallbackProducts = Array.isArray(record.products)
    ? record.products.map(normalizeProductRecord)
    : [];
  const products = catalogShowcases.length > 0
    ? catalogShowcases.flatMap((showcase) => showcase.products)
    : fallbackProducts;
  const showcases = catalogShowcases.length > 0
    ? catalogShowcases.map(({ products: _products, ...showcase }) => showcase)
    : Array.isArray(record.showcases)
      ? record.showcases.map(normalizeShowcaseRecord)
      : [];
  const banners = catalogBanners.length > 0
    ? catalogBanners
    : Array.isArray(record.banners)
      ? record.banners.map(normalizeBannerRecord)
      : [];

  return {
    products: dedupeProducts(products),
    showcases,
    banners,
    tree:
      record.tree && Array.isArray(record.tree.sections)
        ? record.tree
        : { sections: [] },
    catalog: {
      placement: Number(treeCatalog?.placement ?? record.catalog?.placement ?? 0),
      showcases: catalogShowcases,
      banners: catalogBanners,
    },
  };
}

function resolveTree(apiData: ProductsCache): CatalogTree {
  const tree =
    apiData.tree.sections.length > 0
      ? apiData.tree
      : {
          sections: [
            ...apiData.banners.map((banner, index) => ({
              type: "banner" as const,
              sortOrder: getPlacement(banner, index + 1),
              item: banner,
            })),
            ...apiData.showcases.map((showcase, index) => ({
              type: "showcase" as const,
              sortOrder: getPlacement(showcase, index + 1),
              item: showcase,
              products: apiData.products.filter(
                (product) => String(product.showcaseId ?? "") === String(showcase.id)
              ),
            })),
          ].sort((a, b) => a.sortOrder - b.sortOrder),
        };

  return tree;
}

function withResolvedTree(apiData: ProductsCache): ProductsCache {
  return { ...apiData, tree: resolveTree(apiData) };
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
    return withResolvedTree(parseApiPayload(json?.data));
  } catch {
    return emptyProductsCache();
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
