"use client";

import React from "react";
import { CustomButton } from "./button";
import { CustomCard } from "./card";
import { UICommonVariant } from "../../variants/ui.variant";
import { LoadingVariant } from "../loading/loading";
import { borderVariants, radiusVariants, shadowVariants, sizeVariants } from "../../variants/shared.variant";

type CustomModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: UICommonVariant;
  size?: keyof typeof sizeVariants;
  rounded?: keyof typeof radiusVariants;
  border?: keyof typeof borderVariants;
  shadow?: keyof typeof shadowVariants;
  closeText?: string;
  loading?: LoadingVariant;
  isLoading?: boolean;
  loadingText?: string;
};

export function CustomModal({
  open,
  onClose,
  title = "Modal",
  children,
  variant = "primary",
  size = "md",
  rounded = "lg",
  border = "base",
  shadow = "lg",
  closeText = "Close",
  loading = "spinner",
  isLoading = false,
  loadingText,
}: CustomModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <CustomCard
        variant={variant}
        size={size}
        rounded={rounded}
        border={border}
        className="w-full max-w-lg"
        shadow={shadow}
        hover="none"
        onClick={(event) => event.stopPropagation()}
        isLoading={isLoading}
        loading={loading}
        loadingText={loadingText}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <CustomButton variant={variant} size="sm" onClick={onClose} disabled={isLoading}>
            {closeText}
          </CustomButton>
        </div>
        <div>{children}</div>
      </CustomCard>
    </div>
  );
}
