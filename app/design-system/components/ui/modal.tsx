"use client";

import React from "react";
import { createPortal } from "react-dom";
import { CustomButton } from "./button";
import { CustomCard } from "./card";
import { resolveVariantColors, UICommonVariant } from "../../variants/ui.variant";
import { useTheme } from "../../theme/provider";
import { LoadingVariant } from "../loading/loading";
import { borderVariants, radiusVariants, shadowVariants, sizeVariants } from "../../variants/shared.variant";
import { HiMiniXMark } from "react-icons/hi2";

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
  closeIcon?: React.ReactNode;
  closeText?: string;
  loading?: LoadingVariant;
  isLoading?: boolean;
  loadingText?: string;
};

function withAlpha(color: string, alpha: number) {
  const match = color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!match) return color;

  const [red, green, blue] = match.slice(1).map((value) => Number.parseInt(value, 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function CustomModal({
  open,
  onClose,
  title = "پنجره",
  children,
  variant = "primary",
  size = "md",
  rounded = "lg",
  border = "dashed",
  shadow = "lg",
  closeIcon = <HiMiniXMark size={24}/>,
  closeText = "",
  loading = "spinner",
  isLoading = false,
  loadingText,
}: CustomModalProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const overlayColor = withAlpha(resolveVariantColors("primary", theme).backgroundColor, 0.08);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: overlayColor }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <CustomCard
        variant={variant}
        size={size}
        rounded={rounded}
        border={border}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-primary-card/95"
        shadow={shadow}
        hover="none"
        onClick={(event) => event.stopPropagation()}
        isLoading={isLoading}
        loading={loading}
        loadingText={loadingText}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xl font-bold">{title}</div>
            <CustomButton variant="danger" size="sm" onClick={onClose} disabled={isLoading}>
              {closeText || closeIcon}
            </CustomButton>
          </div>
          <div>{children}</div>
        </div>
      </CustomCard>
    </div>
  );

  return mounted ? createPortal(modal, document.body) : modal;
}
