"use client";

import React from "react";
import { useTheme } from "../../theme/provider";
import { resolveVariantColors, UICommonVariant } from "../../variants/ui.variant";
import { borderVariants, cx, interactionStates, motionVariants, radiusVariants, shadowVariants, sizeVariants } from "../../variants/shared.variant";
import Loading, { LoadingVariant } from "../loading/loading";

type CustomInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  variant?: UICommonVariant;
  size?: keyof typeof sizeVariants;
  rounded?: keyof typeof radiusVariants;
  border?: keyof typeof borderVariants;
  shadow?: keyof typeof shadowVariants;
  fullWidth?: boolean;
  loading?: LoadingVariant;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
};

export function CustomInput({
  variant = "primary",
  size = "md",
  rounded = "md",
  border = "base",
  shadow = "none",
  fullWidth = true,
  className,
  disabled,
  loading = "spinner",
  isLoading = false,
  loadingText,
  icon,
  iconAfter,
  ...rest
}: CustomInputProps) {
  const { theme } = useTheme();
  const colorStyle = resolveVariantColors(variant, theme);
  const isDisabled = disabled || isLoading;

  return (
    <div className={cx("relative inline-flex items-center", fullWidth && "w-full")}>
      {!isLoading && icon && (
        <span className="absolute left-3 text-text-secondary">{icon}</span>
      )}
      <input
        {...rest}
        disabled={isDisabled}
        className={cx(
          "bg-bg-surface text-text-primary placeholder:text-text-secondary",
          "focus:outline-none focus:ring-2 focus:ring-ui-primary/30",
          sizeVariants[size],
          radiusVariants[rounded],
          borderVariants[border],
          shadowVariants[shadow],
          motionVariants.smooth,
          !isDisabled && interactionStates.hover.none,
          isDisabled && interactionStates.disabled.base,
          fullWidth && "w-full",
          icon !== undefined && "pl-10",
          iconAfter !== undefined && "pr-10",
          className
        )}
        style={{
          borderColor: colorStyle.borderColor,
        }}
      />
      {isLoading && (
        <span className="absolute right-3">
          <Loading loading={loading} size={size} />
        </span>
      )}
      {!isLoading && iconAfter && (
        <span className="absolute right-3 text-text-secondary">{iconAfter}</span>
      )}
      {isLoading && loadingText && (
        <span className="sr-only">{loadingText}</span>
      )}
    </div>
  );
}