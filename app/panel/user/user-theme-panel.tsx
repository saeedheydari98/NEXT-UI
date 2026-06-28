"use client";

import { CustomButton } from "@/app/design-system/components/ui/button";
import { useTheme } from "@/app/design-system/theme/provider";
import { ThemePalettePicker } from "@/app/panel/theme-palette-picker";

export function UserThemePanel() {
  const { mode, modePreference, setModePreference, userTheme, updateUserTheme } =
    useTheme();

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
        unstyled
        className={selected ? "border-secondary bg-secondary text-secondary-contrast" : "border-secondary-border bg-transparent text-primary-text"}
        onClick={() => setModePreference(value)}
      >
        {label}
      </CustomButton>
    );
  };

  return (
    <section
      className="flex w-full max-w-3xl flex-col gap-4 rounded-xl border border-secondary-border bg-secondary-card p-4 text-primary-text"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-secondary-text">
            حالت: <span className="font-bold text-user-user-user">{mode === "dark" ? "تیره" : "روشن"}</span>
          </div>
          <div
            className="flex flex-wrap items-center gap-2 rounded-full border border-secondary-border p-2"
          >
            {renderModeButton("system", "دستگاه")}
            {renderModeButton("light", "روشن")}
            {renderModeButton("dark", "تیره")}
          </div>
        </div>
      </div>

      {userTheme.isColorPanelLocked ? (
          <div
            className="rounded-lg border border-secondary-border bg-secondary-card p-3 text-sm font-semibold text-secondary-text"
          >
            <span>پنل رنگ کاربر توسط مدیر قفل شده است.</span>
          </div>
      ) : null}

      <ThemePalettePicker
        scope="user"
        disabled={userTheme.isColorPanelLocked}
        selectedColor={userTheme.preferredColor}
        selectedStyle={userTheme.style}
        selectedTone={userTheme.tone}
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
