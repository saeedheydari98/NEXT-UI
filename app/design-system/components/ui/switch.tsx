"use client";

import React from "react";
import { useTheme } from "../../theme/provider";
import { resolveVariantColors, UICommonVariant } from "../../variants/ui.variant";
import { cx, motionVariants, sizeVariants } from "../../variants/shared.variant";
import Loading, { LoadingVariant } from "../loading/loading";

type CustomSwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  variant?: UICommonVariant;
  size?: keyof typeof sizeVariants;
  token?: string;
  customColor?: string;
  label?: string;
  loading?: LoadingVariant;
  isLoading?: boolean;
};

export function CustomSwitch({
  checked,
  onChange,
  disabled = false,
  variant = "primary",
  size = "md",
  token,
  customColor,
  label,
  loading = "spinner",
  isLoading = false,
}: CustomSwitchProps) {
  const { theme } = useTheme();
  const colorStyle = resolveVariantColors(variant, theme);
  const switchColor = customColor ?? colorStyle.backgroundColor;
  const borderColor = customColor ?? colorStyle.borderColor;
  const isDisabled = disabled || isLoading;

  return (
    <label className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-pressed={checked}
        disabled={isDisabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-7 w-12 rounded-full border",
          motionVariants.smooth,
          isDisabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          backgroundColor: checked ? switchColor : "#9ca3af",
          borderColor,
        }}
      >
        {isLoading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loading loading={loading} size={size} />
          </span>
        ) : (
          <span
            className={cx(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white",
              motionVariants.smooth,
              checked ? "left-6" : "left-0.5"
            )}
          />
        )}
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}