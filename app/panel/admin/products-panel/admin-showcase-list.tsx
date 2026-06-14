"use client";

import { IoCreateOutline, IoImageOutline, IoTrashOutline } from "react-icons/io5";
import type { MouseEvent } from "react";
import { CustomButton } from "../../../design-system/components/ui/button";
import Loading from "@/app/design-system/components/loading/loading";
import type { ProductForm, ShowcaseForm } from "./types";

type AdminShowcaseListProps = {
  products: ProductForm[];
  showcases: ShowcaseForm[];
  onEditShowcase: (showcase: ShowcaseForm) => void;
  onDeleteShowcase: (showcase: ShowcaseForm) => void;
  onEditProduct: (product: ProductForm) => void;
  onPreview: (imageUrl?: string) => void;
  onDragStart: (event: MouseEvent<HTMLDivElement>) => void;
  onDragMove: (event: MouseEvent<HTMLDivElement>) => void;
  onDragStop: () => void;
  formatPrice: (value?: string) => string;
  isLoading?: boolean;
};

export function AdminShowcaseList({
  products,
  showcases,
  onEditShowcase,
  onDeleteShowcase,
  onEditProduct,
  onPreview,
  onDragStart,
  onDragMove,
  onDragStop,
  formatPrice,
  isLoading = false,
}: AdminShowcaseListProps) {
  return (
    <div className="flex flex-col gap-5">
      {showcases.map((showcase) => {
        const showcaseProducts = products.filter((product) => product.showcaseId === showcase.id);

        return (
          <div
            key={showcase.id}
            className={`flex w-full flex-col gap-3 rounded-xl border bg-[var(--surface-admin-card)] p-4 ${
              isLoading ? "border-[#e5e5e5]" : "border-ui-primary/30"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Loading loading="skeleton-item" isLoading={isLoading}>
                  <div className="text-sm font-bold text-text-primary">{showcase.title || "Untitled showcase"}</div>
                </Loading>
              </div>
              <div className="flex items-center gap-2">
                <Loading loading="skeleton-item" isLoading={isLoading}>
                  <span className="text-xs font-semibold text-text-secondary">{showcaseProducts.length} items</span>
                </Loading>
                <Loading loading="skeleton-item" isLoading={isLoading}>
                  <CustomButton
                    variant="neutral"
                    rounded="full"
                    size="sm"
                    border="base"
                    icon={<IoCreateOutline />}
                    onClick={() => onEditShowcase(showcase)}
                  >
                    Edit
                  </CustomButton>
                </Loading>
              </div>
            </div>

            <div
              className="flex cursor-grab gap-2 overflow-x-auto overscroll-x-contain pb-2 active:cursor-grabbing"
              onMouseDown={onDragStart}
              onMouseMove={onDragMove}
              onMouseUp={onDragStop}
              onMouseLeave={onDragStop}
            >
              {showcaseProducts.length === 0 && (
                <div
                  className={`flex min-h-28 min-w-44 flex-col justify-center gap-1 rounded-lg border border-dashed bg-[var(--surface-admin-soft)] p-3 ${
                    isLoading ? "border-[#e5e5e5]" : "border-ui-primary/30"
                  }`}
                >
                  <Loading loading="skeleton-item" isLoading={isLoading}>
                    <div className="text-xs font-bold text-text-primary">Empty showcase</div>
                  </Loading>
                  <Loading loading="skeleton-item" isLoading={isLoading}>
                    <span className="text-[11px] text-text-secondary">Add a product to this showcase.</span>
                  </Loading>
                </div>
              )}

              {showcaseProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex min-h-44 min-w-36 max-w-36 shrink-0 flex-col gap-2 rounded-md border bg-[var(--surface-admin-soft)] p-2 shadow-sm ${
                    isLoading ? "border-[#e5e5e5]" : "border-ui-primary/20"
                  }`}
                >
                  <button
                    type="button"
                    className="flex h-20 items-center justify-center overflow-hidden rounded bg-[var(--surface-admin-media)]"
                    onClick={() => onPreview(product.imageUrl)}
                    disabled={isLoading || !product.imageUrl}
                    aria-label="Open product image"
                  >
                    <Loading loading="skeleton-item" isLoading={isLoading} className="h-full w-full">
                      <div className="flex h-full w-full items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title || `Product ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <IoImageOutline className="text-2xl text-neutral-400" aria-hidden="true" />
                        )}
                      </div>
                    </Loading>
                  </button>
                  <Loading loading="skeleton-item" isLoading={isLoading}>
                    <div className="line-clamp-2 min-h-8 text-xs font-bold text-text-primary">
                      {product.title || `Product ${index + 1}`}
                    </div>
                  </Loading>
                  <Loading loading="skeleton-item" isLoading={isLoading}>
                    <div className="text-xs font-bold text-ui-primary">
                      {formatPrice(product.discountPrice || product.price) || "No price"}
                    </div>
                  </Loading>
                  <Loading loading="skeleton-item" isLoading={isLoading}>
                    <CustomButton
                      fullWidth
                      border="base"
                      rounded="sm"
                      size="sm"
                      variant={product.active ? "primary" : "neutral"}
                      icon={<IoCreateOutline />}
                      onClick={() => onEditProduct(product)}
                    >
                      Open
                    </CustomButton>
                  </Loading>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
