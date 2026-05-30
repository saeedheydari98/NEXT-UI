// components/ui/loading/loading.tsx

"use client";

import React from "react";

import { motion } from "motion/react";

import {
  cx,
  radiusVariants,
  sizeVariants,
} from "../../variants/shared.variant";

export type LoadingVariant =
  | "spinner"
  | "ring"
  | "dots"
  | "pulse"
  | "bars"
  | "skeleton"
  | "skeleton-block";

type LoadingSize =
  keyof typeof sizeVariants;

interface LoadingProps {
  loading?: LoadingVariant;

  size?: LoadingSize;

  className?: string;

  children?: React.ReactNode;
}

export default function Loading({
  loading = "spinner",

  size = "md",

  className,

  children,
}: LoadingProps) {
  // =========================
  // Dynamic Size Resolver
  // =========================

  const resolvedSize =
    size === "xs"
      ? 12
      : size === "sm"
      ? 14
      : size === "md"
      ? 18
      : size === "lg"
      ? 22
      : size === "xl"
      ? 26
      : size === "xxl"
      ? 30
      : size === "xxxl"
      ? 34
      : 18;

  // =========================
  // Spinner
  // =========================

  if (loading === "spinner") {
    return (
      <div
        className={cx(
          "animate-spin rounded-full border-2 border-current/30 border-t-current",
          className
        )}
        style={{
          width: resolvedSize,
          height: resolvedSize,
        }}
      />
    );
  }

  // =========================
  // Ring
  // =========================

  if (loading === "ring") {
    return (
      <motion.div
        className={cx(
          "rounded-full border-2 border-current border-t-transparent",
          className
        )}
        style={{
          width: resolvedSize,
          height: resolvedSize,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      />
    );
  }

  // =========================
  // Dots
  // =========================

  if (loading === "dots") {
    return (
      <div
        className={cx(
          "flex items-center gap-1",
          className
        )}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full bg-current"
            style={{
              width: resolvedSize / 3,
              height: resolvedSize / 3,
            }}
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  // =========================
  // Pulse
  // =========================

  if (loading === "pulse") {
    return (
      <motion.div
        className={cx(
          "rounded-full bg-current",
          className
        )}
        style={{
          width: resolvedSize,
          height: resolvedSize,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          repeat: Infinity,
          duration: 1,
        }}
      />
    );
  }

  // =========================
  // Bars
  // =========================

  if (loading === "bars") {
    return (
      <div
        className={cx(
          "flex items-end gap-1",
          className
        )}
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-current"
            style={{
              height: resolvedSize,
            }}
            animate={{
              scaleY: [1, 1.8, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.7,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  // =========================
  // Skeleton
  // =========================

  if (
    loading === "skeleton" ||
    loading === "skeleton-block"
  ) {
    return (
      <div
        className={cx(
          "relative overflow-hidden",

          loading === "skeleton-block"
            ? "bg-zinc-800"
            : "bg-zinc-700",

          radiusVariants.lg,

          className
        )}
      >
        {/* shimmer */}
        <motion.div
          className="absolute inset-0 gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
        />

        {/* preserve layout */}
        <div className="opacity-0">
          {children}
        </div>
      </div>
    );
  }

  return null;
}