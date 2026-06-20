import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { matchesSearchQuery } from "@/lib/product-search";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export type ProductPayload = {
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

type ShowcasePayload = {
  type?: "showcase";
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  sortOrder?: number | string;
  placement?: number | string;
  products?: Partial<ProductPayload>[];
};

type BannerPayload = {
  type?: "banner";
  id: string;
  title?: string;
  showcaseId?: string;
  imageUrls?: string[];
  images?: unknown;
  active?: boolean;
  sortOrder?: number | string;
  placement?: number | string;
};

type CatalogTreePayload = {
  type?: string;
  placement?: number | string;
  children?: Array<ShowcasePayload | BannerPayload>;
  showcases?: ShowcasePayload[];
  banners?: BannerPayload[];
};

type BannerRecord = {
  id: string;
  title: string | null;
  showcaseId: string | null;
  active: boolean;
  sortOrder: number;
  images: Prisma.JsonValue | null;
};

const hasProductModel =
  prisma.product && typeof prisma.product.findMany === "function";

const hasShowcaseModel =
  prisma.showcase && typeof prisma.showcase.findMany === "function";

function normalizeProduct(value: Partial<ProductPayload>, index: number): ProductPayload {
  const placement = Number.isFinite(Number(value.placement))
    ? Number(value.placement)
    : Number.isFinite(Number(value.sortOrder))
      ? Number(value.sortOrder)
      : index + 1;

  return {
    id: value.id,
    showcaseId: String(value.showcaseId ?? "").trim(),
    title: String(value.title ?? "").trim(),
    description: String(value.description ?? "").trim(),
    price: String(value.price ?? "").trim(),
    originalPrice: String(value.originalPrice ?? "").trim(),
    discountPrice: String(value.discountPrice ?? "").trim(),
    discountPercent: Number.isFinite(Number(value.discountPercent)) ? Math.max(0, Math.round(Number(value.discountPercent))) : 0,
    imageUrl: String(value.imageUrl ?? "").trim(),
    badge: String(value.badge ?? "").trim(),
    ctaLabel: String(value.ctaLabel ?? "").trim(),
    ctaHref: String(value.ctaHref ?? "").trim(),
    active: value.active !== false,
    stockQuantity: Number.isFinite(Number(value.stockQuantity)) ? Math.max(0, Math.round(Number(value.stockQuantity))) : 0,
    colorStock: normalizeColorStock(value.colorStock),
    sortOrder: placement,
    placement,
  };
}

function normalizeColorStock(value: unknown) {
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

function sortProducts(products: ProductPayload[]) {
  return [...products].sort((a, b) => a.sortOrder - b.sortOrder);
}

function sortByOrder<T extends { sortOrder?: number | string; placement?: number | string }>(items: T[]) {
  return [...items].sort((a, b) => getPlacement(a) - getPlacement(b));
}

function getProductKey(product: Partial<ProductPayload>) {
  return [
    String(product.showcaseId ?? "").trim().toLowerCase(),
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

function dedupeProducts(products: ProductPayload[]) {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = getProductKey(product);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toClientBanner(banner: BannerRecord) {
  const imageUrls = Array.isArray(banner.images)
    ? banner.images.map((item) => String(item)).filter(Boolean)
    : [];

  return {
    type: "banner" as const,
    id: banner.id,
    title: banner.title ?? "",
    showcaseId: banner.showcaseId,
    images: imageUrls.map((url, index) => ({ url, placement: index + 1 })),
    active: banner.active,
    placement: banner.sortOrder,
  };
}

function toClientProduct(product: ProductPayload) {
  return {
    id: product.id,
    showcaseId: product.showcaseId,
    title: product.title,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    discountPrice: product.discountPrice,
    discountPercent: product.discountPercent,
    imageUrl: product.imageUrl,
    badge: product.badge,
    ctaLabel: product.ctaLabel,
    ctaHref: product.ctaHref,
    active: product.active,
    stockQuantity: Number(product.stockQuantity ?? 0),
    colorStock: normalizeColorStock(product.colorStock),
    placement: Number(product.sortOrder ?? product.placement ?? 0),
  };
}

function toClientShowcase(showcase: {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
}) {
  return {
    type: "showcase" as const,
    id: showcase.id,
    title: showcase.title ?? "",
    description: showcase.description ?? "",
    imageUrl: showcase.imageUrl ?? "",
    active: showcase.active,
    placement: showcase.sortOrder,
  };
}

function buildCatalogTree(
  products: ProductPayload[],
  showcases: Array<{
    id: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    active: boolean;
    sortOrder: number;
  }>,
  banners: BannerRecord[],
  includeInactive: boolean
) {
  const visibleProducts = includeInactive
    ? products
    : products.filter((product) => product.active !== false);
  const visibleShowcases = includeInactive
    ? showcases
    : showcases.filter((showcase) => showcase.active !== false);
  const visibleBanners = includeInactive
    ? banners
    : banners.filter((banner) => banner.active !== false);

  const bannerSections = visibleBanners.map(toClientBanner);

  const showcaseSections = visibleShowcases
    .map((showcase) => ({
      ...toClientShowcase(showcase),
      products: visibleProducts.filter(
        (product) => String(product.showcaseId ?? "") === showcase.id
      ).map(toClientProduct),
    }))
    .filter((section) => includeInactive || section.products.length > 0);

  return {
    type: "root" as const,
    placement: 0,
    children: [...bannerSections, ...showcaseSections].sort(
      (a, b) => Number(a.placement ?? 0) - Number(b.placement ?? 0)
    ),
  };
}

function getPlacement(value: { placement?: number | string; sortOrder?: number | string } | undefined, fallback = 0) {
  if (Number.isFinite(Number(value?.placement))) return Number(value?.placement);
  if (Number.isFinite(Number(value?.sortOrder))) return Number(value?.sortOrder);
  return fallback;
}

function getImageUrls(value: BannerPayload) {
  if (Array.isArray(value.imageUrls)) {
    return value.imageUrls.map((item) => String(item)).filter(Boolean);
  }

  if (!Array.isArray(value.images)) return [];

  return value.images
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "url" in item) {
        return String((item as { url?: unknown }).url ?? "");
      }
      return "";
    })
    .filter(Boolean);
}

function splitTreePayload(tree: CatalogTreePayload | null) {
  const children = Array.isArray(tree?.children) ? tree.children : [];
  const showcaseChildren = children.filter((item) => item.type === "showcase") as ShowcasePayload[];
  const bannerChildren = children.filter((item) => item.type === "banner") as BannerPayload[];

  return {
    showcases: Array.isArray(tree?.showcases) ? tree.showcases : showcaseChildren,
    banners: Array.isArray(tree?.banners) ? tree.banners : bannerChildren,
  };
}

function buildShowcaseProductsNode(
  showcase: {
    id: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    active: boolean;
    sortOrder: number;
  } | null,
  showcaseId: string,
  products: ProductPayload[]
) {
  return {
    type: "showcase" as const,
    id: showcase?.id ?? showcaseId,
    title: showcase?.title ?? "",
    description: showcase?.description ?? "",
    imageUrl: showcase?.imageUrl ?? "",
    active: showcase?.active ?? true,
    placement: showcase?.sortOrder ?? 0,
    products: products
      .map(toClientProduct)
      .sort((a, b) => Number(a.placement ?? 0) - Number(b.placement ?? 0)),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeInactive = url.searchParams.get("all") === "1";
  const id = url.searchParams.get("id") ?? null;
  const query = String(url.searchParams.get("q") ?? url.searchParams.get("search") ?? "").trim();
  const showcaseId = String(url.searchParams.get("showcaseId") ?? "").trim();
  const onlyDiscounted = url.searchParams.get("discounted") === "1";
  const priceMinParam = url.searchParams.get("priceMin");
  const priceMaxParam = url.searchParams.get("priceMax");
  const priceMin = priceMinParam ? Number(priceMinParam) : NaN;
  const priceMax = priceMaxParam ? Number(priceMaxParam) : NaN;

  const parsePrice = (value: unknown) => {
    const normalized = String(value || "").replace(/[^\d.]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  if (!hasProductModel) {
    return NextResponse.json({ ok: true, data: { type: "root", placement: 0, children: [] } });
  }

  try {
    if (id) {
      const maybeIdNum = Number(id);
      const where =
        Number.isFinite(maybeIdNum) && !Number.isNaN(maybeIdNum)
          ? { id: maybeIdNum }
          : { id: String(id) };
      const item = await prisma.product.findFirst({ where });
      if (!item) {
        return NextResponse.json({ ok: false, data: { product: null } }, { status: 404 });
      }
      return NextResponse.json({ ok: true, data: { product: toClientProduct(item as ProductPayload) } });
    }

    const productsData = await prisma.product.findMany({
      where: {
        ...(includeInactive ? {} : { active: true }),
        ...(showcaseId ? { showcaseId } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    const products = dedupeProducts(productsData as ProductPayload[]).filter((product) => {
      if (query && !matchesSearchQuery(product, query)) return false;
      if (onlyDiscounted) {
        const percent = Number(product.discountPercent || 0);
        if (!(percent > 0 || String(product.discountPrice || "").trim())) return false;
      }
      const productPrice = Number.isFinite(parsePrice(product.discountPrice))
        ? parsePrice(product.discountPrice)
        : parsePrice(product.price);
      if (Number.isFinite(priceMin) && Number.isFinite(productPrice) && productPrice < priceMin) return false;
      if (Number.isFinite(priceMax) && Number.isFinite(productPrice) && productPrice > priceMax) return false;
      return true;
    });

    if (showcaseId) {
      const showcase = hasShowcaseModel
        ? await prisma.showcase.findUnique({ where: { id: showcaseId } })
        : null;

      return NextResponse.json({
        ok: true,
        data: buildShowcaseProductsNode(showcase, showcaseId, products),
      });
    }

    const showcases = hasShowcaseModel
      ? await prisma.showcase.findMany({
          include: { products: true, banners: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        })
      : [];

    const banners =
      "banner" in prisma && typeof prisma.banner?.findMany === "function"
        ? await prisma.banner.findMany({
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          })
        : [];
    const tree = buildCatalogTree(
      products,
      showcases,
      banners as BannerRecord[],
      includeInactive
    );

    return NextResponse.json({
      ok: true,
      data: tree,
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { ok: false, error: "server error", data: { type: "root", placement: 0, children: [] } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const treePayload =
    body.tree && typeof body.tree === "object"
      ? (body.tree as CatalogTreePayload)
      : body.catalog && typeof body.catalog === "object"
        ? (body.catalog as CatalogTreePayload)
        : body.type === "root" || Array.isArray(body.children)
          ? (body as CatalogTreePayload)
          : null;
  const treeParts = splitTreePayload(treePayload);
  const catalogShowcases = treeParts.showcases;
  const catalogBanners = treeParts.banners;
  const bodyProducts = Array.isArray(body.products) ? body.products : [];
  const products = catalogShowcases.length > 0
    ? catalogShowcases.flatMap((showcase) =>
        Array.isArray(showcase.products)
          ? showcase.products.map((product, productIndex) => ({
              ...product,
              showcaseId: String(product.showcaseId ?? showcase.id ?? "").trim(),
              sortOrder: getPlacement(product, productIndex + 1),
              placement: getPlacement(product, productIndex + 1),
            }))
          : []
      )
    : bodyProducts;
  const showcases = catalogShowcases.length > 0
    ? catalogShowcases
    : Array.isArray(body.showcases)
      ? (body.showcases as ShowcasePayload[])
      : [];
  const banners = catalogBanners.length > 0
    ? catalogBanners
    : Array.isArray(body.banners)
      ? (body.banners as BannerPayload[])
      : [];
  const normalized = dedupeProducts(
    products
      .map((item: Partial<ProductPayload>, index: number) => normalizeProduct(item, index))
      .filter((item: ProductPayload) => item.title && item.description && item.price)
  );

  // All products must be assigned to a showcase for consistency
  const missingShowcase = normalized.some((p) => !String(p.showcaseId ?? "").trim());
  if (missingShowcase) {
    return NextResponse.json({ ok: false, error: "showcaseId is required for every product" }, { status: 400 });
  }

  if (!hasProductModel) {
    return NextResponse.json({ ok: false, error: "product model is unavailable" }, { status: 500 });
  }

  try {
    const showcaseIds = [
      ...new Set([
        ...showcases.map((item) => String(item.id ?? "").trim()).filter(Boolean),
        ...normalized.map((item) => String(item.showcaseId ?? "").trim()).filter(Boolean),
      ]),
    ];

    const showcaseById = new Map(
      showcases
        .map((item) => [String(item.id ?? "").trim(), item] as const)
        .filter(([id]) => Boolean(id))
    );

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if ("banner" in tx && typeof tx.banner?.deleteMany === "function") {
        await tx.banner.deleteMany();
      }

      await tx.product.deleteMany();

      if (hasShowcaseModel) {
        await tx.showcase.deleteMany({
          where: {
            id: { notIn: showcaseIds },
          },
        });
      }

      for (const showcaseId of showcaseIds) {
        if (!hasShowcaseModel) continue;
        const meta = showcaseById.get(showcaseId);
        await tx.showcase.upsert({
          where: { id: showcaseId },
          update: {
            title: meta?.title ?? undefined,
            description: meta?.description ?? undefined,
            imageUrl: meta?.imageUrl ?? undefined,
            active: meta?.active ?? undefined,
            sortOrder: Number.isFinite(Number(getPlacement(meta, NaN))) ? getPlacement(meta) : undefined,
          },
          create: {
            id: showcaseId,
            title: meta?.title ?? null,
            description: meta?.description ?? null,
            imageUrl: meta?.imageUrl ?? null,
            active: meta?.active ?? true,
            sortOrder: getPlacement(meta, 0),
          },
        });
      }

      for (const item of sortProducts(normalized)) {
        await tx.product.create({
          data: {
            title: item.title,
            showcaseId: String(item.showcaseId ?? "").trim(),
            description: item.description,
            price: item.price,
            originalPrice: item.originalPrice || null,
            discountPrice: item.discountPrice || null,
            discountPercent: Number(item.discountPercent) || null,
            imageUrl: item.imageUrl || null,
            badge: item.badge || null,
            ctaLabel: item.ctaLabel || null,
            ctaHref: item.ctaHref || null,
            active: item.active,
            stockQuantity: Number(item.stockQuantity) || 0,
            colorStock: Object.keys(normalizeColorStock(item.colorStock)).length > 0
              ? normalizeColorStock(item.colorStock)
              : Prisma.JsonNull,
            sortOrder: item.sortOrder,
          },
        });
      }

      if ("banner" in tx && typeof tx.banner?.create === "function") {
        for (const item of sortByOrder(banners)) {
          const bannerId = String(item.id ?? "").trim();
          const imageUrls = getImageUrls(item);
          await tx.banner.create({
            data: {
              id: bannerId || undefined,
              title: item.title ?? null,
              showcaseId: item.showcaseId ? String(item.showcaseId) : null,
              images: imageUrls.length > 0 ? imageUrls : Prisma.JsonNull,
              active: item.active ?? true,
              sortOrder: getPlacement(item, 0),
            },
          });
        }
      }
    });

    const data = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    const savedShowcases = hasShowcaseModel
      ? await prisma.showcase.findMany({
          include: { products: true, banners: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        })
      : [];
    const savedBanners =
      "banner" in prisma && typeof prisma.banner?.findMany === "function"
        ? await prisma.banner.findMany({
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          })
        : [];
    const tree = buildCatalogTree(
      data as ProductPayload[],
      savedShowcases,
      savedBanners as BannerRecord[],
      true
    );

    return NextResponse.json({
      ok: true,
      data: tree,
    });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
