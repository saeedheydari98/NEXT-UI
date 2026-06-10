"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { CustomButton } from "./button";

type Props = {
  showcaseId: string | number;
  children?: React.ReactNode;
  variant?: Parameters<typeof CustomButton>[0]["variant"];
  size?: Parameters<typeof CustomButton>[0]["size"];
  className?: string;
};

export default function ShowcaseLink({
  showcaseId,
  children,
  variant = "neutral",
  size = "sm",
  className,
}: Props) {
  const router = useRouter();
  const href = `/products/showcase/${showcaseId}`;

  return (
    <CustomButton
      type="button"
      className={className}
      variant={variant}
      size={size}
      rounded="full"
      border="base"
      onClick={() => router.push(href)}
    >
      {children ?? "See all"}
    </CustomButton>
  );
}
