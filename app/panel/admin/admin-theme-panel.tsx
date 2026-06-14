"use client";

import { ThemePalettePicker, hexToRgba } from "@/app/panel/theme-palette-picker";
import { useTheme } from "../../design-system/theme/provider";
import { resolveColor } from "../../design-system/theme/theme";

export function AdminThemePanel() {
  const { adminTheme, updateAdminTheme, theme } = useTheme();
  const adminColor = resolveColor(adminTheme.primary, adminTheme.style, adminTheme.tone);

  const updatePalette = (next: Parameters<typeof updateAdminTheme>[0]) => {
    const themeUpdate: Parameters<typeof updateAdminTheme>[0] = {};

    if (next.primary) {
      themeUpdate.primary = next.primary;
    }

    if (next.style) {
      themeUpdate.style = next.style;
    }

    if (next.tone) {
      themeUpdate.tone = next.tone;
    }

    return updateAdminTheme(themeUpdate);
  };

  return (
    <section
      className="flex w-full max-w-3xl flex-col gap-4 rounded-xl p-4"
      style={{
        border: `1px solid ${hexToRgba(adminColor, 0.3)}`,
        backgroundColor: hexToRgba(adminColor, 0.1),
        color: theme.tokens.colors.text.primary,
      }}
    >
      <ThemePalettePicker
        accentColor={adminColor}
        selectedColor={adminTheme.primary}
        selectedStyle={adminTheme.style}
        selectedTone={adminTheme.tone}
        textColor={theme.tokens.colors.text.primary}
        selectionClassName="text-admin-admin-admin"
        onChange={(next) =>
          updatePalette({
            primary: next.color,
            style: next.style,
            tone: next.tone,
          })
        }
      />
    </section>
  );
}
