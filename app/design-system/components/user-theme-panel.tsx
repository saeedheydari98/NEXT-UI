"use client";

import { CustomButton } from "./ui/button";
import { CustomSwitch } from "./ui/switch";
import { useTheme } from "../theme/provider";
import { resolveColor, ThemeColorKey, ThemeStyle, ThemeTone } from "../theme/theme";

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

const getContrastColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#111111" : "#ffffff";
};

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function UserThemePanel() {
  const { mode, setMode, userTheme, updateUserTheme } = useTheme();
  const accentColor = resolveColor(userTheme.preferredColor, userTheme.style, userTheme.tone);

  const renderStyleButton = (item: ThemeStyle) => {
    const background = resolveColor(userTheme.preferredColor, item, userTheme.tone);
    const selected = userTheme.style === item;

    return (
      <CustomButton
        key={item}
        style={{
          backgroundColor: background,
          borderColor: background,
          borderStyle: "none",
          borderWidth: "0",
          color: getContrastColor(background),
        }}
        className=""
        onClick={() => updateUserTheme({ style: item })}
      >
        {item}
      </CustomButton>
    );
  };

  const renderColorButton = (color: ThemeColorKey) => {
    const background = resolveColor(color, userTheme.style, userTheme.tone);
    const selected = userTheme.preferredColor === color;

    return (
      <CustomButton
        key={color}
        style={{
          backgroundColor: background,
          borderColor: background,
          borderStyle: "none",
          borderWidth: "0",
          color: getContrastColor(background),
        }}
        className=""
        onClick={() => updateUserTheme({ preferredColor: color })}
      >
        {color}
      </CustomButton>
    );
  };

  const renderToneButton = (tone: ThemeTone) => {
    const background = resolveColor(userTheme.preferredColor, userTheme.style, tone);
    const selected = userTheme.tone === tone;

    return (
      <CustomButton
        key={tone}
        style={{
          backgroundColor: background,
          borderColor: background,
          borderStyle: "none",
          borderWidth: "0",
          color: getContrastColor(background),
        }}
        className=""
        onClick={() => updateUserTheme({ tone })}
      >
        tone {tone}
      </CustomButton>
    );
  };

  return (
    <section
      className="flex flex-col gap-4 w-full max-w-3xl rounded-xl bg-bg-surface p-4"
      style={{
        border: `1px solid ${hexToRgba(accentColor, 0.3)}`,
      }}
    >
      <div className=" text-xl font-bold">User Panel Theme</div>

      <div className=" flex flex-wrap items-center gap-4">
        <CustomSwitch
          checked={mode === "dark"}
          onChange={(next) => setMode(next ? "dark" : "light")}
          customColor={accentColor}
          label={`mode: ${mode}`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {colorOptions.map(renderColorButton)}
      </div>

      <div className=" flex flex-wrap gap-2">
        {styleOptions.map(renderStyleButton)}
      </div>

      <div className=" flex flex-wrap gap-2">
        {toneOptions.map(renderToneButton)}
      </div>
    </section>
  );
}
