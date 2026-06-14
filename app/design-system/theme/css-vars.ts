import { resolveColor, Theme } from "./theme";

export function generateCSSVariables(theme: Theme) {
  const adminColor50 = resolveColor(
    theme.admin?.primary ?? "green",
    theme.admin?.style ?? theme.state.style,
    50
  );
  const userColor50 = resolveColor(
    theme.user?.preferredColor ?? "green",
    theme.user?.style ?? theme.state.style,
    50
  );

  return {
    "--ui-primary": theme.tokens.colors.ui.primary,
    "--ui-secondary": theme.tokens.colors.ui.secondary,
    "--ui-success": theme.tokens.colors.ui.success,
    "--ui-danger": theme.tokens.colors.ui.danger,
    "--ui-warning": theme.tokens.colors.ui.warning,
    "--ui-info": theme.tokens.colors.ui.info,

    "--bg-base": theme.tokens.colors.background.base,
    "--bg-surface": theme.tokens.colors.background.surface,
    "--surface-admin-soft": `color-mix(in srgb, ${adminColor50} 18%, var(--bg-surface))`,
    "--surface-admin-card": `color-mix(in srgb, ${adminColor50} 26%, var(--bg-base))`,
    "--surface-admin-media": `color-mix(in srgb, ${adminColor50} 40%, var(--bg-base))`,
    "--surface-user-soft": `color-mix(in srgb, ${userColor50} 18%, var(--bg-surface))`,
    "--surface-user-card": `color-mix(in srgb, ${userColor50} 26%, var(--bg-base))`,
    "--surface-user-media": `color-mix(in srgb, ${userColor50} 40%, var(--bg-base))`,

    "--text-primary": theme.tokens.colors.text.primary,
    "--text-secondary": theme.tokens.colors.text.secondary,
  } as React.CSSProperties;
}
