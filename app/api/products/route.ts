import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
  sortOrder: number;
};

type ShowcasePayload = {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
};

const hasProductModel =
  prisma.product && typeof prisma.product.findMany === "function";

const hasShowcaseModel =
  prisma.showcase && typeof prisma.showcase.findMany === "function";

function normalizeProduct(value: Partial<ProductPayload>, index: number): ProductPayload {
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
    active: Boolean(value.active),
    sortOrder: Number.isFinite(Number(value.sortOrder)) ? Number(value.sortOrder) : index + 1,
  };
}

function sortProducts(products: ProductPayload[]) {
  return [...products].sort((a, b) => a.sortOrder - b.sortOrder);
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeInactive = url.searchParams.get("all") === "1";
  const id = url.searchParams.get("id") ?? null;

  if (!hasProductModel) {
    return NextResponse.json({ ok: true, data: { products: [], showcases: [], tree: [] } });
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
      return NextResponse.json({ ok: true, data: { product: item } });
    }

    const productsData = await prisma.product.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    const products = dedupeProducts(productsData as ProductPayload[]);

    const showcases = hasShowcaseModel
      ? await prisma.showcase.findMany({
          include: { products: true, banners: true },
          orderBy: [{ createdAt: "asc" }],
        })
      : [];

    return NextResponse.json({ ok: true, data: { products, showcases } });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ ok: true, data: { products: [], showcases: [] } });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const products = Array.isArray(body.products) ? body.products : [];
  const showcases = Array.isArray(body.showcases) ? (body.showcases as ShowcasePayload[]) : [];
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
    return NextResponse.json({ ok: true, data: sortProducts(normalized) });
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
      for (const showcaseId of showcaseIds) {
        if (!hasShowcaseModel) continue;
        const meta = showcaseById.get(showcaseId);
        await tx.showcase.upsert({
          where: { id: showcaseId },
          update: {
            title: meta?.title ?? undefined,
            description: meta?.description ?? undefined,
            imageUrl: meta?.imageUrl ?? undefined,
          },
          create: {
            id: showcaseId,
            title: meta?.title ?? null,
            description: meta?.description ?? null,
            imageUrl: meta?.imageUrl ?? null,
          },
        });
      }

      await tx.product.deleteMany();

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
            sortOrder: item.sortOrder,
          },
        });
      }
    });

    const data = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ ok: true, data: sortProducts(normalized) });
  }
}
