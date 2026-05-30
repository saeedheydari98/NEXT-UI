"use client";

import React from "react";
import { useTheme } from "../../theme/provider";
import { resolveVariantColors, UICommonVariant } from "../../variants/ui.variant";
import { borderVariants, cx, motionVariants, radiusVariants, shadowVariants, sizeVariants } from "../../variants/shared.variant";
import Loading, { LoadingVariant } from "../loading/loading";

type CustomSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  variant?: UICommonVariant;
  size?: keyof typeof sizeVariants;
  rounded?: keyof typeof radiusVariants;
  border?: keyof typeof borderVariants;
  shadow?: keyof typeof shadowVariants;
  fullWidth?: boolean;
  loading?: LoadingVariant;
  isLoading?: boolean;
  loadingText?: string;
};

export function CustomSelect({
  variant = "primary",
  size = "md",
  rounded = "md",
  border = "base",
  shadow = "none",
  fullWidth = true,
  className,
  disabled,
  children,
  loading = "spinner",
  isLoading = false,
  loadingText,
  ...rest
}: CustomSelectProps) {
  const { theme } = useTheme();
  const colorStyle = resolveVariantColors(variant, theme);
  const isDisabled = disabled || isLoading;

  return (
    <div className={cx("relative inline-flex items-center", fullWidth && "w-full")}>
      <select
        {...rest}
        disabled={isDisabled}
        className={cx(
          "bg-bg-surface text-text-primary",
          "focus:outline-none focus:ring-2 focus:ring-ui-primary/30",
          sizeVariants[size],
          radiusVariants[rounded],
          borderVariants[border],
          shadowVariants[shadow],
          motionVariants.smooth,
          fullWidth && "w-full",
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        style={{
          borderColor: colorStyle.borderColor,
        }}
      >
        {children}
      </select>
      {isLoading && (
        <span className="absolute right-3">
          <Loading loading={loading} size={size} />
        </span>
      )}
      {isLoading && loadingText && (
        <span className="sr-only">{loadingText}</span>
      )}
    </div>
  );
}