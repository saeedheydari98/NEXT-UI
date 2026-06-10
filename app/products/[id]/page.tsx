"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { IoBagAddOutline, IoBagHandleOutline } from "react-icons/io5";
import { useProductsCatalog } from "@/lib/products-catalog-context";
import type { ProductRecord } from "@/lib/products-client";
import { CustomButton } from "@/app/design-system/components/ui/button";
import { CustomTag } from "@/app/design-system/components/ui/tag";
import { StarRating } from "@/app/design-system/components/ui/star-rating";
import { ProductReviewsSection, type ProductReview } from "./product-reviews-section";
import { ProductDetailSkeleton } from "@/app/products/product-showcase/catalog-skeletons";

const CART_STORAGE_KEY = "product-cart";
const CART_UPDATED_EVENT = "product-cart-updated";

function getFinalPrice(product: ProductRecord) {
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

function getDiscountPercent(product: ProductRecord) {
  const percent = Number(product.discountPercent);
  return Number.isFinite(percent) && percent > 0 ? Math.round(percent) : 0;
}

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: unknown[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export default function ProductPage() {
  const params = useParams();
  const productId = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");
  const { getProductById, loading: catalogLoading } = useProductsCatalog();
  const product = useMemo(() => getProductById(productId), [getProductById, productId]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [isPurchased, setIsPurchased] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(`product-comments:${productId}`) || "[]";
    try {
      const parsed = JSON.parse(stored);
      setReviews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReviews([]);
    }

    setIsPurchased(localStorage.getItem(`purchased:${productId}`) === "1");
  }, [productId]);

  const ratedReviews = useMemo(
    () => reviews.filter((review) => Number(review.rating) > 0),
    [reviews]
  );

  const avgRating = useMemo(() => {
    if (ratedReviews.length === 0) return 0;
    const total = ratedReviews.reduce((sum, review) => sum + Number(review.rating), 0);
    return Math.round((total / ratedReviews.length) * 10) / 10;
  }, [ratedReviews]);

  const submitReview = () => {
    if (!text.trim()) return;

    if (rating && !isPurchased) {
      alert("Only customers who purchased this product can submit a rating. You may still leave a comment.");
      return;
    }

    const newReview: ProductReview = {
      id: String(Date.now()),
      text: text.trim(),
      rating,
      createdAt: new Date().toISOString(),
    };
    const next = [newReview, ...reviews];
    setReviews(next);
    localStorage.setItem(`product-comments:${productId}`, JSON.stringify(next));
    setText("");
    setRating(undefined);
  };

  const markPurchased = () => {
    localStorage.setItem(`purchased:${productId}`, "1");
    setIsPurchased(true);
  };

  const addToCart = (item: ProductRecord) => {
    const key = String(item.id ?? `${item.title}-${item.description}-${item.price}`);
    const currentCart = readCart();
    const existing = currentCart.find(
      (cartItem: { id?: string | number }) => String(cartItem.id ?? "") === key
    );
    const nextCart = existing
      ? currentCart.map((cartItem: { id?: string | number; quantity?: number }) =>
          String(cartItem.id ?? "") === key
            ? { ...cartItem, quantity: Number(cartItem.quantity ?? 0) + 1 }
            : cartItem
        )
      : [...currentCart, { ...item, quantity: 1 }];

    writeCart(nextCart);
    setCartMessage(`${item.title} added to cart.`);
    window.setTimeout(() => setCartMessage(""), 2000);
  };

  const scrollToReviews = () => {
    document.getElementById("product-reviews")?.scrollIntoView({ behavior: "smooth" });
  };

  if (catalogLoading && !product) {
    return (
      <main className="min-h-screen bg-bg-base text-text-primary">
        <ProductDetailSkeleton />
      </main>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-bg-base p-6">
        <div className="text-lg font-bold text-text-primary">Product not found</div>
        <div className="text-sm text-text-secondary">The requested product could not be located.</div>
      </div>
    );
  }

  const discountPercent = getDiscountPercent(product);
  const finalPrice = formatPrice(getFinalPrice(product));
  const originalPrice = formatPrice(product.originalPrice);

  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 py-8 px-4">
        {cartMessage ? (
          <div className="rounded-lg border border-ui-primary/30 bg-bg-surface px-4 py-3 text-sm font-semibold text-ui-primary">
            {cartMessage}
          </div>
        ) : null}

        <section className="flex w-full flex-col gap-8 rounded-2xl border border-ui-primary/25 bg-bg-surface p-6 shadow-sm lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-4 lg:max-w-md lg:shrink-0">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-ui-primary/15 bg-ui-primary/10">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <IoBagHandleOutline className="text-6xl text-ui-primary/50" aria-hidden="true" />
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-3">
              {product.badge ? (
                <div>
                  <CustomTag size="xs" rounded="full" border="base">
                    {product.badge}
                  </CustomTag>
                </div>
              ) : null}

              <div className="text-3xl font-bold leading-tight text-text-primary">{product.title}</div>

              <button
                type="button"
                onClick={scrollToReviews}
                className="flex w-fit flex-wrap items-center gap-3 rounded-lg text-left transition-opacity hover:opacity-80"
              >
                <StarRating value={avgRating} size="md" />
                <span className="text-sm font-semibold text-text-primary">
                  {avgRating > 0 ? avgRating.toFixed(1) : "No ratings"}
                </span>
                <span className="text-sm text-text-secondary">
                  ({reviews.length} review{reviews.length === 1 ? "" : "s"})
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-1 rounded-xl border border-ui-primary/15 bg-bg-base p-4">
              {originalPrice && discountPercent > 0 ? (
                <div className="text-sm text-red-admin-500 line-through">{originalPrice}</div>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-3xl font-bold text-ui-primary">{finalPrice || "No price"}</div>
                {discountPercent > 0 ? (
                  <CustomTag size="xs" rounded="full" border="base">
                    {discountPercent}% off
                  </CustomTag>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-sm font-bold text-text-primary">About this product</div>
              <div className="text-sm leading-7 text-text-secondary whitespace-pre-wrap">
                {product.description}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <CustomButton
                type="button"
                variant="success"
                border="base"
                icon={<IoBagAddOutline />}
                onClick={() => addToCart(product)}
              >
                Add to cart
              </CustomButton>
              <CustomButton type="button" variant="primary" onClick={scrollToReviews}>
                See reviews
              </CustomButton>
            </div>
          </div>
        </section>

        <ProductReviewsSection
          reviews={reviews}
          text={text}
          rating={rating}
          isPurchased={isPurchased}
          onTextChange={setText}
          onRatingChange={setRating}
          onSubmit={submitReview}
          onMarkPurchased={markPurchased}
        />
      </div>
    </main>
  );
}
