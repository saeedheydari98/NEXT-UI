import { resolveColor, semanticThemeMap, Theme, ThemeColorKey, ThemeStyle } from "../theme/theme";

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

type ThemeTextSource = "admin" | "user";

function getThemeTextSource(theme: Theme, source: ThemeTextSource) {
  if (source === "user") {
    return {
      color: theme.user?.preferredColor ?? "green",
      style: theme.user?.style ?? theme.state.style,
    };
  }

  return {
    color: theme.admin?.primary ?? "green",
    style: theme.admin?.style ?? theme.state.style,
  };
}

export function resolveThemeTextColor(
  theme: Theme,
  source: ThemeTextSource,
  tone: 50 | 200 | 300 | 700 | 800 | 950
) {
  const themeSource = getThemeTextSource(theme, source);

  return resolveColor(
    themeSource.color as ThemeColorKey,
    themeSource.style as ThemeStyle,
    tone
  );
}

export function resolveSemanticTextColor(
  theme: Theme,
  color: ThemeColorKey,
  tone: 50 | 200 | 300 | 700 | 800 | 950
) {
  return resolveColor(color, theme.state.style, tone);
}

export function resolveTokenTextColor(
  theme: Theme,
  token: string,
  tone: 50 | 200 | 300 | 700 | 800 | 950
) {
  if (token.includes("-user-")) {
    return resolveThemeTextColor(theme, "user", tone);
  }

  return resolveThemeTextColor(theme, "admin", tone);
}

export function resolveVariantColors(
  variant: UICommonVariant,
  theme: Theme
): VariantColorStyle {
  switch (variant) {
    case "secondary":
      return createVariantStyle(
        theme.tokens.colors.ui.secondary,
        theme.state.mode === "dark"
          ? resolveThemeTextColor(theme, "user", 50)
          : resolveThemeTextColor(theme, "user", 950)
      );
    case "success":
      return createVariantStyle(
        theme.tokens.colors.ui.success,
        resolveSemanticTextColor(theme, semanticThemeMap.success, 50)
      );
    case "danger":
      return createVariantStyle(
        theme.tokens.colors.ui.danger,
        resolveSemanticTextColor(theme, semanticThemeMap.danger, 50)
      );
    case "warning":
      return createVariantStyle(
        theme.tokens.colors.ui.warning,
        resolveSemanticTextColor(theme, semanticThemeMap.warning, 950)
      );
    case "info":
      return createVariantStyle(
        theme.tokens.colors.ui.info,
        resolveSemanticTextColor(theme, semanticThemeMap.info, 50)
      );
    case "neutral":
      return createVariantStyle(
        theme.tokens.colors.ui.neutral,
        resolveSemanticTextColor(theme, semanticThemeMap.neutral, 50)
      );
    case "primary":
    default:
      return createVariantStyle(theme.tokens.colors.ui.primary, resolveThemeTextColor(theme, "admin", 50));
  }
}
