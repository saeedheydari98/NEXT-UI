"use client";

import React from "react";
import { resolveVariantColors, UICommonVariant } from "../../variants/ui.variant";
import { borderVariants, cx, interactionStates, radiusVariants, shadowVariants, sizeVariants } from "../../variants/shared.variant";
import { useTheme } from "../../theme/provider";
import Loading, { LoadingVariant } from "../loading/loading";

type CustomCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  title?: string;
  variant?: UICommonVariant;
  size?: keyof typeof sizeVariants;
  rounded?: keyof typeof radiusVariants;
  border?: keyof typeof borderVariants;
  shadow?: keyof typeof shadowVariants;
  hover?: keyof typeof interactionStates.hover;
  className?: string;
  loading?: LoadingVariant;
  isLoading?: boolean;
  loadingText?: string;
};

export function CustomCard({
  children,
  title,
  variant = "primary",
  size = "md",
  rounded = "lg",
  border = "base",
  shadow = "sm",
  className,
  hover = "lift",
  loading = "spinner",
  isLoading = false,
  loadingText,
  ...rest
}: CustomCardProps) {
  const { theme } = useTheme();
  const colorStyle = resolveVariantColors(variant, theme);

  return (
    <article
      {...rest}
      className={cx(
        "bg-[var(--surface-user-card)] p-4",
        radiusVariants[rounded],
        borderVariants[border],
        shadowVariants[shadow],
        hover !== "none" && interactionStates.hover[hover],
        className
      )}
      style={{ borderColor: colorStyle.borderColor }}
    >
      <div>
        {title && <div className="mb-2 text-lg font-semibold">{title}</div>}
        <div>
          {isLoading ? (
            <Loading
              loading={loading === "spinner" ? "skeleton-card" : loading}
              isLoading
              className="w-full"
            >
              <div className="flex min-h-20 w-full flex-col gap-3">{children}</div>
            </Loading>
          ) : (
            children
          )}
        </div>
      </div>
    </article>
  );
}
