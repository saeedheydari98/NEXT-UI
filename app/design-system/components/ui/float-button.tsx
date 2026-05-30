"use client";

import React from "react";
import { CustomButton } from "./button";
import { UICommonVariant } from "../../variants/ui.variant";
import { LoadingVariant } from "../loading/loading";

type FloatButtonProps = {
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  variant?: UICommonVariant;
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
  label = "Action",
  variant = "primary",
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
        rounded="full"
        shadow="lg"
        hover="lift"
        border="base"
        onClick={onClick}
        icon={<span className="text-lg leading-none">{icon}</span>}
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