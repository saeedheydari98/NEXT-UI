import { resolveColor, Theme } from "./theme";

export function generateCSSVariables(theme: Theme) {
  const adminColorKey = theme.admin?.primary ?? "green";
  const adminStyle = theme.admin?.style ?? theme.state.style;
  const adminColor = resolveColor(adminColorKey, adminStyle, theme.admin?.tone ?? 500);
  const userColorKey = theme.user?.preferredColor ?? "green";
  const userStyle = theme.user?.style ?? theme.state.style;
  const userColor = resolveColor(userColorKey, userStyle, theme.user?.tone ?? 500);

  const withAlpha = (color: string, alpha: number) =>
    `color-mix(in srgb, ${color} ${alpha}%, transparent)`;
  const withSurface = (color: string, amount: number, surface = "var(--bg-base)") =>
    `color-mix(in srgb, ${color} ${amount}%, ${surface})`;
  const textTone = theme.state.mode === "dark" ? 50 : 950;
  const getContrastColor = (color: string) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#111111" : "#ffffff";
  };

  const buildThemeTokens = (
    colorKey: typeof adminColorKey,
    style: typeof adminStyle,
    color: string,
    options?: {
      base?: string;
      surface?: string;
      textTone?: typeof textTone;
    }
  ) => ({
    color,
    contrast: getContrastColor(color),
    text: resolveColor(colorKey, style, options?.textTone ?? textTone),
    bg: withSurface(resolveColor(colorKey, style, 100), 16, options?.base),
    panel: withSurface(resolveColor(colorKey, style, 200), 36, options?.base ?? "var(--bg-base)"),
    soft: withSurface(resolveColor(colorKey, style, 100), 28, options?.surface ?? "var(--bg-surface)"),
    card: withSurface(resolveColor(colorKey, style, 200), 36, options?.base ?? "var(--bg-base)"),
    media: withSurface(resolveColor(colorKey, style, 200), 44, options?.base ?? "var(--bg-base)"),
    icon: withSurface(resolveColor(colorKey, style, 200), 48, options?.base ?? "var(--bg-base)"),
    border: resolveColor(colorKey, style, 500),
  });

  const primaryTokens = buildThemeTokens(adminColorKey, adminStyle, adminColor);
  const primaryTokensNoMode = buildThemeTokens(adminColorKey, adminStyle, adminColor, {
    base: "#ffffff",
    surface: "#f5f5f5",
    textTone: 950,
  });
  const secondaryTokens = {
    ...buildThemeTokens(userColorKey, userStyle, userColor),
    strongBg: withSurface(resolveColor(userColorKey, userStyle, 200), 40, "var(--bg-base)"),
  };
  const secondaryTokensNoMode = {
    ...buildThemeTokens(userColorKey, userStyle, userColor, {
      base: "#ffffff",
      surface: "#f5f5f5",
      textTone: 950,
    }),
    strongBg: withSurface(resolveColor(userColorKey, userStyle, 200), 40, "#ffffff"),
  };
  const staticVariant = (
    color: "green" | "red" | "yellow" | "blue" | "gray",
    style: "light" | "dark" = theme.state.mode === "dark" ? "dark" : "light"
  ) => {
    const base = resolveColor(color, style, 500);
    const textToneForStyle = style === "dark" ? 50 : 800;

    return {
      color: base,
      text: resolveColor(color, style, textToneForStyle),
      bg: withAlpha(base, 30),
      border: withAlpha(base, 50),
    };
  };
  const successTokens = staticVariant("green");
  const successTokensNoMode = staticVariant("green", "light");
  const dangerTokens = staticVariant("red");
  const dangerTokensNoMode = staticVariant("red", "light");
  const warningTokens = staticVariant("yellow");
  const warningTokensNoMode = staticVariant("yellow", "light");
  const infoTokens = staticVariant("blue");
  const infoTokensNoMode = staticVariant("blue", "light");
  const neutralTokens = staticVariant("gray");
  const neutralTokensNoMode = staticVariant("gray", "light");

  return {
    "--ui-primary": theme.tokens.colors.ui.primary,
    "--ui-secondary": theme.tokens.colors.ui.secondary,
    "--ui-success": theme.tokens.colors.ui.success,
    "--ui-danger": theme.tokens.colors.ui.danger,
    "--ui-warning": theme.tokens.colors.ui.warning,
    "--ui-info": theme.tokens.colors.ui.info,

    "--bg-base": theme.tokens.colors.background.base,
    "--bg-surface": theme.tokens.colors.background.surface,
    "--border-default": theme.tokens.colors.border.default,

    "--primary": primaryTokens.color,
    "--primary-nomode": primaryTokensNoMode.color,
    "--primary-contrast": primaryTokens.contrast,
    "--primary-contrast-nomode": primaryTokensNoMode.contrast,
    "--primary-text": primaryTokens.text,
    "--primary-text-nomode": primaryTokensNoMode.text,
    "--primary-bg": primaryTokens.bg,
    "--primary-bg-nomode": primaryTokensNoMode.bg,
    "--primary-panel": primaryTokens.panel,
    "--primary-panel-nomode": primaryTokensNoMode.panel,
    "--primary-soft": primaryTokens.soft,
    "--primary-soft-nomode": primaryTokensNoMode.soft,
    "--primary-card": primaryTokens.card,
    "--primary-card-nomode": primaryTokensNoMode.card,
    "--primary-media": primaryTokens.media,
    "--primary-media-nomode": primaryTokensNoMode.media,
    "--primary-icon": primaryTokens.icon,
    "--primary-icon-nomode": primaryTokensNoMode.icon,
    "--primary-border": primaryTokens.border,
    "--primary-border-nomode": primaryTokensNoMode.border,

    "--secondary": secondaryTokens.color,
    "--secondary-nomode": secondaryTokensNoMode.color,
    "--secondary-contrast": secondaryTokens.contrast,
    "--secondary-contrast-nomode": secondaryTokensNoMode.contrast,
    "--secondary-text": secondaryTokens.text,
    "--secondary-text-nomode": secondaryTokensNoMode.text,
    "--secondary-bg": secondaryTokens.bg,
    "--secondary-bg-nomode": secondaryTokensNoMode.bg,
    "--secondary-bg-strong": secondaryTokens.strongBg,
    "--secondary-bg-strong-nomode": secondaryTokensNoMode.strongBg,
    "--secondary-panel": secondaryTokens.panel,
    "--secondary-panel-nomode": secondaryTokensNoMode.panel,
    "--secondary-soft": secondaryTokens.soft,
    "--secondary-soft-nomode": secondaryTokensNoMode.soft,
    "--secondary-card": secondaryTokens.card,
    "--secondary-card-nomode": secondaryTokensNoMode.card,
    "--secondary-media": secondaryTokens.media,
    "--secondary-media-nomode": secondaryTokensNoMode.media,
    "--secondary-icon": secondaryTokens.icon,
    "--secondary-icon-nomode": secondaryTokensNoMode.icon,
    "--secondary-border": secondaryTokens.border,
    "--secondary-border-nomode": secondaryTokensNoMode.border,

    "--text-primary": theme.tokens.colors.text.primary,
    "--text-secondary": theme.tokens.colors.text.secondary,
    "--text-muted": theme.tokens.colors.text.muted,
    "--body-text": theme.tokens.colors.text.primary,
    "--body-text-muted": theme.tokens.colors.text.secondary,
    "--body-text-subtle": theme.tokens.colors.text.muted,
    "--success": successTokens.color,
    "--success-nomode": successTokensNoMode.color,
    "--success-text": successTokens.text,
    "--success-text-nomode": successTokensNoMode.text,
    "--success-bg": successTokens.bg,
    "--success-bg-nomode": successTokensNoMode.bg,
    "--success-border": successTokens.border,
    "--success-border-nomode": successTokensNoMode.border,
    "--danger": dangerTokens.color,
    "--danger-nomode": dangerTokensNoMode.color,
    "--danger-text": dangerTokens.text,
    "--danger-text-nomode": dangerTokensNoMode.text,
    "--danger-bg": dangerTokens.bg,
    "--danger-bg-nomode": dangerTokensNoMode.bg,
    "--danger-border": dangerTokens.border,
    "--danger-border-nomode": dangerTokensNoMode.border,
    "--warning": warningTokens.color,
    "--warning-nomode": warningTokensNoMode.color,
    "--warning-text": warningTokens.text,
    "--warning-text-nomode": warningTokensNoMode.text,
    "--warning-bg": warningTokens.bg,
    "--warning-bg-nomode": warningTokensNoMode.bg,
    "--warning-border": warningTokens.border,
    "--warning-border-nomode": warningTokensNoMode.border,
    "--info": infoTokens.color,
    "--info-nomode": infoTokensNoMode.color,
    "--info-text": infoTokens.text,
    "--info-text-nomode": infoTokensNoMode.text,
    "--info-bg": infoTokens.bg,
    "--info-bg-nomode": infoTokensNoMode.bg,
    "--info-border": infoTokens.border,
    "--info-border-nomode": infoTokensNoMode.border,
    "--neutral": neutralTokens.color,
    "--neutral-nomode": neutralTokensNoMode.color,
    "--neutral-text": neutralTokens.text,
    "--neutral-text-nomode": neutralTokensNoMode.text,
    "--neutral-bg": neutralTokens.bg,
    "--neutral-bg-nomode": neutralTokensNoMode.bg,
    "--neutral-border": neutralTokens.border,
    "--neutral-border-nomode": neutralTokensNoMode.border,
  } as React.CSSProperties;
}
