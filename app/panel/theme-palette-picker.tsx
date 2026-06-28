"use client";

import { ReactNode, useId, useState } from "react";
import { IoChevronDown, IoCheckmark } from "react-icons/io5";
import { CustomButton } from "@/app/design-system/components/ui/button";
import { resolveColor, ThemeColorKey, ThemeStyle, ThemeTone } from "@/app/design-system/theme/theme";

const colorOptions: ThemeColorKey[] = [
  "green",
  "blue",
  "purple",
  "orange",
  "red",
  "yellow",
  "gray",
];

const styleOptions: ThemeStyle[] = ["light", "dark", "fantasy"];
const toneOptions = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const previewTones: ThemeTone[] = [100, 300, 500, 700, 900];

const colorLabels: Record<ThemeColorKey, string> = {
  green: "سبز",
  blue: "آبی",
  purple: "بنفش",
  orange: "نارنجی",
  red: "قرمز",
  yellow: "زرد",
  gray: "خاکستری",
};

const styleLabels: Record<ThemeStyle, string> = {
  light: "روشن",
  dark: "تیره",
  fantasy: "فانتزی",
};

type PaletteSection = "colors" | "styles" | "tones";
type PaletteScope = "admin" | "user";

const paletteScopeClasses: Record<
  PaletteScope,
  {
    border: string;
    borderSoft: string;
    surface: string;
    icon: string;
  }
> = {
  admin: {
    border: "border-primary-border",
    borderSoft: "border-primary-border",
    surface: "bg-primary-card",
    icon: "bg-primary-icon text-primary",
  },
  user: {
    border: "border-secondary-border",
    borderSoft: "border-secondary-border",
    surface: "bg-secondary-card",
    icon: "bg-secondary-icon text-secondary",
  },
};

export const getContrastColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#111111" : "#ffffff";
};

const getThemeContrastColor = (
  background: string,
  color: ThemeColorKey,
  style: ThemeStyle
) => {
  return getContrastColor(background) === "#111111"
    ? resolveColor(color, style, 950)
    : resolveColor(color, style, 50);
};

export const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type ThemePalettePickerProps = {
  disabled?: boolean;
  scope: PaletteScope;
  selectedColor: ThemeColorKey;
  selectedStyle: ThemeStyle;
  selectedTone: ThemeTone;
  selectionClassName: string;
  onChange: (next: {
    color?: ThemeColorKey;
    style?: ThemeStyle;
    tone?: ThemeTone;
  }) => void | Promise<void>;
};

type PaletteSectionProps = {
  children: ReactNode;
  id: string;
  open: boolean;
  preview: ReactNode;
  scopeClasses: (typeof paletteScopeClasses)[PaletteScope];
  title: string;
  value: string;
  valueClassName: string;
  onToggle: () => void;
};

function PaletteSection({
  children,
  id,
  open,
  preview,
  scopeClasses,
  title,
  value,
  valueClassName,
  onToggle,
}: PaletteSectionProps) {
  return (
    <div className={`flex flex-col gap-3 border-t py-3 first:border-t-0 first:pt-0 last:pb-0 ${scopeClasses.border}`}>
      <button
        type="button"
        aria-controls={id}
        aria-expanded={open}
        className="flex w-full cursor-pointer touch-manipulation items-center justify-between gap-3 rounded-lg bg-transparent p-0 text-start text-primary-text transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary-border focus-visible:ring-offset-2"
        onClick={onToggle}
      >
        <span className="flex min-w-0 items-center gap-3">
          {preview}
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-semibold">{title}</span>
            <span className={`truncate text-xs font-semibold ${valueClassName}`}>{value}</span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform ${scopeClasses.icon}`}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <IoChevronDown />
        </span>
      </button>

      {open ? (
        <div id={id} className="flex flex-wrap gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function ThemePalettePicker({
  disabled = false,
  scope,
  selectedColor,
  selectedStyle,
  selectedTone,
  selectionClassName,
  onChange,
}: ThemePalettePickerProps) {
  const paletteId = useId();
  const [openSections, setOpenSections] = useState<Record<PaletteSection, boolean>>({
    colors: true,
    styles: false,
    tones: false,
  });
  const selectedThemeLabel = `${colorLabels[selectedColor]} / ${styleLabels[selectedStyle]} / ${selectedTone}`;
  const selectedPreviewColor = resolveColor(selectedColor, selectedStyle, selectedTone);
  const scopeClasses = paletteScopeClasses[scope];

  const toggleSection = (section: PaletteSection) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${scopeClasses.border} ${scopeClasses.surface} ${disabled ? "opacity-70" : "opacity-100"}`}
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-semibold uppercase text-secondary-text">پالت رنگ</span>
          <span className={`truncate text-sm font-bold ${selectionClassName}`}>{selectedThemeLabel}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
          {previewTones.map((tone) => (
            <span
              key={tone}
              className="h-8 w-2.5 rounded-full"
              style={{ backgroundColor: resolveColor(selectedColor, selectedStyle, tone) }}
            />
          ))}
        </span>
      </div>

      <div
        className={`flex flex-col rounded-xl border p-3 ${scopeClasses.borderSoft} ${disabled ? "opacity-70" : "opacity-100"}`}
      >
        <PaletteSection
          id={`${paletteId}-colors`}
          open={openSections.colors}
          scopeClasses={scopeClasses}
          title="رنگ‌ها"
          value={colorLabels[selectedColor]}
          valueClassName={selectionClassName}
          onToggle={() => toggleSection("colors")}
          preview={
            <span
              className="h-8 w-8 shrink-0 rounded-full"
              style={{ backgroundColor: selectedPreviewColor }}
              aria-hidden="true"
            />
          }
        >
          {colorOptions.map((color) => {
            const background = resolveColor(color, selectedStyle, selectedTone);
            const selected = selectedColor === color;
            const textColor = getThemeContrastColor(background, color, selectedStyle);

            return (
              <button
                key={color}
                type="button"
                aria-label={colorLabels[color]}
                className="flex h-9 w-9 cursor-pointer touch-manipulation items-center justify-center rounded-full border transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary-border focus-visible:ring-offset-2"
                disabled={disabled}
                style={{
                  backgroundColor: background,
                  borderColor: selected ? getContrastColor(background) : hexToRgba(background, 0.3),
                  boxShadow: selected ? `0 0 0 2px ${hexToRgba(background, 0.45)}` : "none",
                  color: textColor,
                }}
                onClick={() => {
                  if (!disabled) void onChange({ color });
                }}
              >
                {selected ? <IoCheckmark aria-hidden="true" /> : null}
              </button>
            );
          })}
        </PaletteSection>

        <PaletteSection
          id={`${paletteId}-styles`}
          open={openSections.styles}
          scopeClasses={scopeClasses}
          title="سبک‌ها"
          value={styleLabels[selectedStyle]}
          valueClassName={selectionClassName}
          onToggle={() => toggleSection("styles")}
          preview={
            <span className="flex shrink-0 gap-1" aria-hidden="true">
              {styleOptions.map((style) => (
                <span
                  key={style}
                  className="h-8 w-2.5 rounded-full"
                  style={{ backgroundColor: resolveColor(selectedColor, style, selectedTone) }}
                />
              ))}
            </span>
          }
        >
          {styleOptions.map((item) => {
            const background = resolveColor(selectedColor, item, selectedTone);
            const selected = selectedStyle === item;
            const selectedTextColor = getThemeContrastColor(background, selectedColor, item);

            return (
              <CustomButton
                key={item}
                rounded="full"
                size="sm"
                style={{
                  backgroundColor: selected ? background : "transparent",
                  borderColor: selected ? background : hexToRgba(background, 0.38),
                  borderStyle: "solid",
                  borderWidth: "1px",
                  color: selected ? selectedTextColor : "var(--primary-text)",
                }}
                icon={selected ? <IoCheckmark aria-hidden="true" /> : undefined}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) void onChange({ style: item });
                }}
              >
                {styleLabels[item]}
              </CustomButton>
            );
          })}
        </PaletteSection>

        <PaletteSection
          id={`${paletteId}-tones`}
          open={openSections.tones}
          scopeClasses={scopeClasses}
          title="شدت رنگ"
          value={String(selectedTone)}
          valueClassName={selectionClassName}
          onToggle={() => toggleSection("tones")}
          preview={
            <span
              className="h-8 w-8 shrink-0 rounded-full"
              style={{ backgroundColor: selectedPreviewColor }}
              aria-hidden="true"
            />
          }
        >
          {toneOptions.map((tone) => {
            const toneColor = resolveColor(selectedColor, selectedStyle, tone);
            const selected = selectedTone === tone;
            const textColor = getThemeContrastColor(toneColor, selectedColor, selectedStyle);

            return (
              <button
                key={tone}
                type="button"
                className="flex h-8 min-w-8 cursor-pointer touch-manipulation items-center justify-center rounded-full border text-xs font-bold tabular-nums transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary-border focus-visible:ring-offset-2"
                disabled={disabled}
                style={{
                  backgroundColor: toneColor,
                  borderColor: selected ? getContrastColor(toneColor) : hexToRgba(toneColor, 0.28),
                  boxShadow: selected ? `0 0 0 2px ${hexToRgba(toneColor, 0.45)}` : "none",
                  color: textColor,
                }}
                onClick={() => {
                  if (!disabled) void onChange({ tone });
                }}
                aria-label={`${selectedColor} ${tone}`}
              >
                <span>{tone}</span>
              </button>
            );
          })}
        </PaletteSection>
      </div>
    </div>
  );
}
