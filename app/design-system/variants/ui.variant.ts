import { Theme } from "../theme/theme";

export type UICommonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral";

export type VariantColorStyle = {
  backgroundColor: string;
  color: string;
  borderColor: string;
};

export function strengthenBorderColor(color: string): string {
  const match = color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);

  if (!match) {
    return color;
  }

  const darken = (value: string) => {
    const next = Math.round(Number.parseInt(value, 16) * 0.72);
    return next.toString(16).padStart(2, "0");
  };

  return `#${darken(match[1])}${darken(match[2])}${darken(match[3])}`;
}

function createVariantStyle(backgroundColor: string, color: string): VariantColorStyle {
  return {
    backgroundColor,
    color,
    borderColor: strengthenBorderColor(backgroundColor),
  };
}

export function resolveVariantColors(
  variant: UICommonVariant,
  theme: Theme
): VariantColorStyle {
  switch (variant) {
    case "secondary":
      return createVariantStyle(theme.tokens.colors.ui.secondary, theme.tokens.colors.text.primary);
    case "success":
      return createVariantStyle(theme.tokens.colors.ui.success, "#ffffff");
    case "danger":
      return createVariantStyle(theme.tokens.colors.ui.danger, "#ffffff");
    case "warning":
      return createVariantStyle(theme.tokens.colors.ui.warning, "#111111");
    case "info":
      return createVariantStyle(theme.tokens.colors.ui.info, "#ffffff");
    case "neutral":
      return createVariantStyle(theme.tokens.colors.ui.neutral, "#ffffff");
    case "primary":
    default:
      return createVariantStyle(theme.tokens.colors.ui.primary, "#ffffff");
  }
}
