"use client";

import { CustomButton } from "@/app/design-system/components/ui/button";
import { useTheme } from "@/app/design-system/theme/provider";
import { resolveColor } from "@/app/design-system/theme/theme";
import { ThemePalettePicker, getContrastColor, hexToRgba } from "@/app/panel/theme-palette-picker";

export function UserThemePanel() {
  const { mode, modePreference, setModePreference, userTheme, updateUserTheme, theme } =
    useTheme();
  const accentColor = resolveColor(userTheme.preferredColor, userTheme.style, userTheme.tone);

  const updatePalette = (next: Parameters<typeof updateUserTheme>[0]) => {
    const themeUpdate: Parameters<typeof updateUserTheme>[0] = {};

    if (next.preferredColor) {
      themeUpdate.preferredColor = next.preferredColor;
    }

    if (next.style) {
      themeUpdate.style = next.style;
    }

    if (next.tone) {
      themeUpdate.tone = next.tone;
    }

    updateUserTheme(themeUpdate);
  };

  const renderModeButton = (value: "system" | "light" | "dark", label: string) => {
    const selected = modePreference === value;

    return (
      <CustomButton
        key={value}
        variant="secondary"
        rounded="full"
        size="sm"
        style={{
          backgroundColor: selected ? accentColor : "transparent",
          borderColor: selected ? accentColor : hexToRgba(accentColor, 0.3),
          color: selected ? getContrastColor(accentColor) : theme.tokens.colors.text.primary,
        }}
        onClick={() => setModePreference(value)}
      >
        {label}
      </CustomButton>
    );
  };

  return (
    <section
      className="flex w-full max-w-3xl flex-col gap-4 rounded-xl p-4"
      style={{
        border: `1px solid ${hexToRgba(accentColor, 0.3)}`,
        backgroundColor: hexToRgba(accentColor, 0.1),
        color: theme.tokens.colors.text.primary,
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-text-secondary">
            mode: <span className="font-bold text-user-user-user">{mode}</span>
          </div>
          <div
            className="flex flex-wrap items-center gap-2 rounded-full border p-2"
            style={{ borderColor: hexToRgba(accentColor, 0.3) }}
          >
            {renderModeButton("system", "device")}
            {renderModeButton("light", "light")}
            {renderModeButton("dark", "dark")}
          </div>
        </div>
      </div>

      <ThemePalettePicker
        accentColor={accentColor}
        selectedColor={userTheme.preferredColor}
        selectedStyle={userTheme.style}
        selectedTone={userTheme.tone}
        textColor={theme.tokens.colors.text.primary}
        selectionClassName="text-user-user-user"
        onChange={(next) =>
          updatePalette({
            preferredColor: next.color,
            style: next.style,
            tone: next.tone,
          })
        }
      />
    </section>
  );
}
