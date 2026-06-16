"use client";

import { CustomSwitch } from "@/app/design-system/components/ui/switch";
import { ThemePalettePicker } from "@/app/panel/theme-palette-picker";
import { useTheme } from "../../design-system/theme/provider";
import { resolveColor } from "../../design-system/theme/theme";

export function AdminThemePanel() {
  const { adminTheme, userTheme, updateAdminTheme, updateUserTheme } = useTheme();
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
      className="flex w-full max-w-3xl flex-col gap-4 rounded-xl border border-primary-border bg-primary-bg p-4 text-primary-text"
    >
      <ThemePalettePicker
        scope="admin"
        selectedColor={adminTheme.primary}
        selectedStyle={adminTheme.style}
        selectedTone={adminTheme.tone}
        selectionClassName="text-admin-admin-admin"
        onChange={(next) =>
          updatePalette({
            primary: next.color,
            style: next.style,
            tone: next.tone,
          })
        }
      />

      <div
        className="flex flex-col gap-3 rounded-xl border border-primary-border bg-primary-card p-3"
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-admin-admin-admin">User color panel</span>
          <span className="text-xs font-semibold text-primary-text">
            Lock user palette controls from the admin panel.
          </span>
        </div>
        <CustomSwitch
          checked={userTheme.isColorPanelLocked}
          customColor={adminColor}
          label={userTheme.isColorPanelLocked ? "Locked" : "Unlocked"}
          onChange={(isColorPanelLocked) => updateUserTheme({ isColorPanelLocked })}
        />
      </div>
    </section>
  );
}
