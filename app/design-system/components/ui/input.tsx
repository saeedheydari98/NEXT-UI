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
  invalid?: boolean;
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
  invalid = false,
  style,
  ...rest
}: CustomInputProps) {
  const { theme } = useTheme();
  const colorStyle = resolveVariantColors(variant, theme);
  const controlBackground = `color-mix(in srgb, ${colorStyle.backgroundColor} 10%, var(--bg-surface))`;
  const isDisabled = disabled || isLoading;

  return (
    <div className={cx("relative inline-flex items-center", fullWidth && "w-full")}>
      {!isLoading && icon && (
        <span className="absolute left-3 text-secondary-text">{icon}</span>
      )}
      <input
        {...rest}
        aria-invalid={invalid || rest["aria-invalid"]}
        disabled={isDisabled}
        className={cx(
          "text-primary-text placeholder:text-secondary-text",
          invalid ? "focus:outline-none focus:ring-2 focus:ring-danger-border-nomode" : "focus:outline-none focus:ring-2 focus:ring-primary-border",
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
          backgroundColor: controlBackground,
          borderColor: invalid ? "var(--danger-border-nomode)" : colorStyle.borderColor,
          ...style,
        }}
      />
      {isLoading && (
        <span className="absolute right-3 flex items-center gap-2 text-secondary-text">
          <Loading loading={loading} size={size} />
          {loadingText && <span className="text-sm">{loadingText}</span>}
        </span>
      )}
      {!isLoading && iconAfter && (
        <span className="absolute right-3 text-secondary-text">{iconAfter}</span>
      )}
    </div>
  );
}
