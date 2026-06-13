"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useProductsCatalog } from "@/lib/products-catalog-context";
import { CustomModal } from "../design-system/components/ui/modal";
import { BannerCarousel } from "./product-showcase/banner-carousel";
import { ShowcaseSection } from "./product-showcase/showcase-section";
import type { Banner, Product, Showcase } from "./product-showcase/types";

const BANNERS_STORAGE_KEY = "admin-product-banners";
const PRODUCTS_STORAGE_KEY = "admin-products";
const SHOWCASES_STORAGE_KEY = "admin-product-showcases";
// No default showcase id: only use explicit showcase ids provided by data
const CART_STORAGE_KEY = "product-cart";
const CART_UPDATED_EVENT = "product-cart-updated";

type CartItem = Product & {
  quantity: number;
};

function getFinalPrice(product: Product) {
  return product.discountPrice || product.price;
}

function formatPrice(value?: string) {
  const normalized = String(value || "").replace(/[^\d.]/g, "");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || !normalized) {
    return value || "";
  }

  return `$${parsed.toLocaleString("en-US")}`;
}

function getDiscountPercent(product: Product) {
  const percent = Number(product.discountPercent);
  return Number.isFinite(percent) && percent > 0 ? Math.round(percent) : 0;
}

function readLocalBanners(): Banner[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(BANNERS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLocalProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLocalShowcases(): Showcase[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SHOWCASES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCart(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

function normalizeShowcase(item: Partial<Showcase>, index: number): Showcase {
  return {
    id: String(item.id ?? `showcase-${index + 1}`),
    title: String(item.title ?? `Showcase ${index + 1}`),
    active: item.active !== false,
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1,
  };
}

function normalizeBanner(item: Partial<Banner> & { bannerUrl?: string }, index: number): Banner {
  const legacyImage = typeof item.bannerUrl === "string" && item.bannerUrl ? [item.bannerUrl] : [];
  const imageUrls = Array.isArray(item.imageUrls) ? item.imageUrls.map((value) => String(value)).filter(Boolean) : legacyImage;

  return {
    id: String(item.id ?? `banner-${index + 1}`),
    title: String(item.title ?? `Banner ${index + 1}`),
    imageUrls,
    active: item.active !== false,
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1,
  };
}

function ensureShowcases(products: Product[], savedShowcases: Showcase[]) {
  const normalized = savedShowcases.map(normalizeShowcase);
  const byId = new Map(normalized.map((showcase) => [showcase.id, showcase]));

  // Add showcases referenced by products if missing (ignore empty/undefined ids)
  for (const product of products) {
    const showcaseId = product.showcaseId ?? "";
    if (!showcaseId) continue;
    if (!byId.has(showcaseId)) {
      byId.set(showcaseId, {
        id: showcaseId,
        title: "Untitled showcase",
        active: true,
        sortOrder: byId.size + 1,
      });
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function ProductShowcase() {
  const { products: catalogProducts, showcases: catalogShowcases, loading } = useProductsCatalog();
  const [banners, setBanners] = useState<Banner[]>(() => readLocalBanners().map(normalizeBanner));
  const [localProducts, setLocalProducts] = useState<Product[]>(() => readLocalProducts());
  const [localShowcases, setLocalShowcases] = useState<Showcase[]>(() => readLocalShowcases());
  const [cartMessage, setCartMessage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    setBanners(readLocalBanners().map(normalizeBanner));
    setLocalProducts(readLocalProducts());
    setLocalShowcases(readLocalShowcases());
  }, []);

  const sortedProducts = useMemo(
    () => catalogProducts.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [catalogProducts]
  );

  const sortedShowcases = useMemo(
    () =>
      ensureShowcases(sortedProducts, catalogShowcases as Showcase[]).filter(
        (showcase) => showcase.active
      ),
    [sortedProducts, catalogShowcases]
  );

  const displaySections = useMemo(() => {
    const bannerSections = banners
      .filter((banner) => banner.active && banner.imageUrls.length > 0)
      .map((banner) => ({ type: "banner" as const, item: banner, sortOrder: banner.sortOrder }));

    const showcaseSections = sortedShowcases
      .map((showcase) => ({
        type: "showcase" as const,
        item: showcase,
        products: sortedProducts.filter((product) => (product.showcaseId ?? "") === showcase.id),
        sortOrder: showcase.sortOrder,
      }))
      .filter((section) => section.products.length > 0);

    return [...bannerSections, ...showcaseSections].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [banners, sortedProducts, sortedShowcases]);

  const loadingSections = useMemo(() => {
    const sourceProducts = sortedProducts.length > 0 ? sortedProducts : localProducts;
    const sourceShowcases =
      sortedShowcases.length > 0 ? (sortedShowcases as Showcase[]) : localShowcases;
    const activeProducts = sourceProducts
      .filter((item) => item.active !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const localSortedShowcases = ensureShowcases(
      activeProducts,
      sourceShowcases as Showcase[]
    ).filter((showcase) => showcase.active !== false);

    const bannerSections = banners
      .filter((banner) => banner.active && banner.imageUrls.length > 0)
      .map((banner) => ({ type: "banner" as const, item: banner, sortOrder: banner.sortOrder }));

    const showcaseSections = localSortedShowcases
      .map((showcase) => ({
        type: "showcase" as const,
        item: showcase,
        products: activeProducts.filter((product) => (product.showcaseId ?? "") === showcase.id),
        sortOrder: showcase.sortOrder,
      }))
      .filter((section) => section.products.length > 0);

    return [...bannerSections, ...showcaseSections].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [banners, localProducts, localShowcases, sortedProducts, sortedShowcases]);

  const startProductRailDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) {
      return;
    }

    dragRef.current = {
      active: true,
      startX: event.pageX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
  };

  const moveProductRailDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    event.preventDefault();
    const dragDistance = event.pageX - dragRef.current.startX;
    event.currentTarget.scrollLeft = dragRef.current.scrollLeft - dragDistance;
  };

  const stopProductRailDrag = () => {
    dragRef.current.active = false;
  };

  const openImagePreview = (imageUrl?: string) => {
    if (!imageUrl) return;
    setPreviewImage(imageUrl);
  };

  const addToCart = (product: Product) => {
    const key = String(product.id ?? `${product.title}-${product.description}-${product.price}`);
    const currentCart = readCart();
    const existing = currentCart.find((item) => String(item.id ?? `${item.title}-${item.description}-${item.price}`) === key);
    const nextCart = existing
      ? currentCart.map((item) =>
          String(item.id ?? `${item.title}-${item.description}-${item.price}`) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...currentCart, { ...product, quantity: 1 }];

    writeCart(nextCart);
    setCartMessage(`${product.title} added to cart.`);
    window.setTimeout(() => setCartMessage(""), 1800);
  };

  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <section className="mx-auto flex w-full flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2 border-b border-ui-primary/30 pb-4">
          <div className="text-3xl font-bold">Products</div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-8">
            {loadingSections.map((section) =>
              section.type === "banner" ? (
                <BannerCarousel
                  key={`loading-banner-${section.item.id}`}
                  banner={section.item}
                  onPreview={() => undefined}
                  isLoading
                />
              ) : (
                <ShowcaseSection
                  key={`loading-showcase-${section.item.id}`}
                  showcase={section.item}
                  products={section.products}
                  onAddToCart={() => undefined}
                  onPreview={() => undefined}
                  onDragStart={() => undefined}
                  onDragMove={() => undefined}
                  onDragStop={() => undefined}
                  formatPrice={(value) => value || ""}
                  getFinalPrice={(product) => product.discountPrice || product.price}
                  getDiscountPercent={(product) => Number(product.discountPercent) || 0}
                  isLoading
                />
              )
            )}
          </div>
        ) : null}

        {!loading && sortedProducts.length === 0 ? (
          <div className="rounded-lg border border-ui-primary/30 bg-bg-surface p-6 text-sm text-text-secondary">
            No active products are available.
          </div>
        ) : null}

        {cartMessage ? (
          <div className="rounded-md border border-ui-primary/30 bg-bg-surface px-4 py-2 text-sm font-semibold text-ui-primary">
            {cartMessage}
          </div>
        ) : null}

        {!loading ? (
        <div className="flex flex-col gap-8">
          {displaySections.map((section) =>
            section.type === "banner" ? (
              <BannerCarousel
                key={`banner-${section.item.id}`}
                banner={section.item}
                onPreview={openImagePreview}
              />
            ) : (
              <ShowcaseSection
                key={`showcase-${section.item.id}`}
                showcase={section.item}
                products={section.products}
                onAddToCart={addToCart}
                onPreview={openImagePreview}
                onDragStart={startProductRailDrag}
                onDragMove={moveProductRailDrag}
                onDragStop={stopProductRailDrag}
                formatPrice={formatPrice}
                getFinalPrice={getFinalPrice}
                getDiscountPercent={getDiscountPercent}
              />
            )
          )}
        </div>
        ) : null}

        <CustomModal
          open={Boolean(previewImage)}
          onClose={() => setPreviewImage("")}
          title="Product image"
          closeText="Close"
          rounded="lg"
          border="base"
          shadow="lg"
        >
          <div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-md bg-bg-base">
            {previewImage && (
              <img
                src={previewImage}
                alt="Product image preview"
                className="max-h-[75vh] w-full object-contain"
              />
            )}
          </div>
        </CustomModal>
      </section>
    </main>
  );
}
