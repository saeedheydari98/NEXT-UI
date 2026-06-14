"use client";

import { IoCreateOutline, IoImageOutline } from "react-icons/io5";
import { CustomButton } from "../../../design-system/components/ui/button";
import Loading from "@/app/design-system/components/loading/loading";
import type { BannerForm } from "./types";

type AdminBannerListProps = {
  banner: BannerForm;
  onEdit: (banner: BannerForm) => void;
  onPreview: (imageUrl?: string) => void;
  isLoading?: boolean;
};

export function AdminBannerList({ banner, onEdit, onPreview, isLoading = false }: AdminBannerListProps) {
  const previewImage = banner.imageUrls[0];

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border bg-[var(--surface-admin-card)] p-4 ${
        isLoading ? "border-[#e5e5e5]" : "border-ui-primary/30"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <Loading loading="skeleton-item" isLoading={isLoading}>
          <div className="text-sm font-bold text-text-primary">{banner.title || "Untitled banner"}</div>
        </Loading>
        <div className="flex justify-center items-center gap-2">
          <Loading loading="skeleton-item" isLoading={isLoading}>
            <span className="text-xs font-semibold text-text-secondary">{banner.imageUrls.length} images</span>
          </Loading>
          <Loading loading="skeleton-item" isLoading={isLoading}>
            <CustomButton
              variant="neutral"
              rounded="full"
              size="sm"
              border="base"
              icon={<IoCreateOutline />}
              onClick={() => onEdit(banner)}
            >
              Edit
            </CustomButton>
          </Loading>
        </div>
      </div>

      <div
        className={`flex min-h-36 items-center justify-center overflow-hidden rounded-lg border bg-[var(--surface-admin-media)] ${
          isLoading ? "border-[#e5e5e5]" : "border-ui-primary/20"
        }`}
      >
        <button
          type="button"
          className="h-36 w-full"
          onClick={() => onPreview(previewImage)}
          disabled={isLoading || !previewImage}
          aria-label="Open banner image"
        >
          <Loading loading="skeleton-item" isLoading={isLoading} className="h-full w-full">
            <div className="flex h-full w-full items-center justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={banner.title || "Banner"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <IoImageOutline className="text-2xl text-neutral-400" aria-hidden="true" />
              )}
            </div>
          </Loading>
        </button>
      </div>
    </div>
  );
}
