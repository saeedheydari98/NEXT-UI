"use client";

import React from "react";
import { CustomButton } from "./button";
import { UICommonVariant } from "../../variants/ui.variant";
import { LoadingVariant } from "../loading/loading";
import { borderVariants, cursorVariants, interactionStates, radiusVariants, shadowVariants, sizeVariants } from "../../variants/shared.variant";

type FloatButtonProps = {
  onClick?: () => void;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  label?: string;
  variant?: UICommonVariant;
  size?: keyof typeof sizeVariants;
  rounded?: keyof typeof radiusVariants;
  border?: keyof typeof borderVariants;
  shadow?: keyof typeof shadowVariants;
  hover?: keyof typeof interactionStates.hover;
  cursor?: keyof typeof cursorVariants;
  fullWidth?: boolean;
  position?: "bottom-right" | "bottom-left";
  loading?: LoadingVariant;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
};

export function FloatButton({
  onClick,
  icon = "+",
  iconAfter,
  label = "Action",
  variant = "primary",
  size = "md",
  rounded = "full",
  border = "base",
  shadow = "lg",
  hover = "lift",
  cursor = "pointer",
  fullWidth = false,
  position = "bottom-right",
  loading = "spinner",
  isLoading = false,
  loadingText,
  disabled = false,
  className,
}: FloatButtonProps) {
  const positionClass =
    position === "bottom-left" ? "left-6 bottom-6" : "right-6 bottom-6";

  return (
    <div className={`fixed z-40 ${positionClass} ${className || ""}`}>
      <CustomButton
        variant={variant}
        size={size}
        rounded={rounded}
        border={border}
        shadow={shadow}
        hover={hover}
        cursor={cursor}
        fullWidth={fullWidth}
        onClick={onClick}
        icon={<span className="text-lg leading-none">{icon}</span>}
        iconAfter={iconAfter}
        loading={loading}
        isLoading={isLoading}
        loadingText={loadingText}
        disabled={disabled}
      >
        {label}
      </CustomButton>
    </div>
  );
}
