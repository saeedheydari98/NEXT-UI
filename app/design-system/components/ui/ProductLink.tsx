import React from "react";
import { slugifyCatalogValue } from "@/lib/products-client";
import { CustomButton } from "./button";
import type { UICommonVariant } from "../../variants/ui.variant";
import {
  borderVariants,
  radiusVariants,
  shadowVariants,
  sizeVariants,
} from "../../variants/shared.variant";

type Props = {
  productId: string | number;
  productTitle?: string;
  children?: React.ReactNode;
  variant?: UICommonVariant;
  size?: keyof typeof sizeVariants;
  rounded?: keyof typeof radiusVariants;
  border?: keyof typeof borderVariants;
  shadow?: keyof typeof shadowVariants;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  className?: string;
  externalHref?: string | null;
};

export default function ProductLink({
  productId,
  productTitle,
  children,
  variant = "primary",
  size = "sm",
  rounded = "md",
  border,
  shadow,
  fullWidth,
  className,
  icon,
  iconAfter,
  externalHref,
}: Props) {
  const slug = slugifyCatalogValue(productTitle || productId);
  const internalHref = `/products/${slug || productId}`;
  const isExternal = Boolean(externalHref && externalHref !== "#");

  return (
    <CustomButton
      href={isExternal ? String(externalHref) : internalHref}
      variant={variant}
      size={size}
      rounded={rounded}
      border={border}
      shadow={shadow}
      fullWidth={fullWidth}
      className={className}
      icon={icon}
      iconAfter={iconAfter}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
    >
      {children ?? "مشاهده"}
    </CustomButton>
  );
}
