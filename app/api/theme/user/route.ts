import { NextResponse } from "next/server";

type ThemeStyle = "light" | "dark" | "fantasy";
type ThemeColor = "green" | "red" | "blue" | "yellow" | "gray" | "orange" | "purple";
type ThemeDensity = "compact" | "comfortable" | "spacious";

type UserThemeConfig = {
  preferredColor: ThemeColor;
  style: ThemeStyle;
  tone: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
  density: ThemeDensity;
};

const defaultUserTheme: UserThemeConfig = {
  preferredColor: "green",
  style: "light",
  tone: 500,
  density: "comfortable",
};

function isThemeStyle(value: string): value is ThemeStyle {
  return value === "light" || value === "dark" || value === "fantasy";
}

function isThemeColor(value: string): value is ThemeColor {
  return (
    value === "green" ||
    value === "red" ||
    value === "blue" ||
    value === "yellow" ||
    value === "gray" ||
    value === "orange" ||
    value === "purple"
  );
}

function isThemeTone(value: unknown): value is UserThemeConfig["tone"] {
  const tone = Number(value);
  return [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].includes(tone);
}

function isThemeDensity(value: string): value is ThemeDensity {
  return value === "compact" || value === "comfortable" || value === "spacious";
}

export async function GET() {
  // User panel is purely front-end; just return defaults so initial load has a shape.
  return NextResponse.json(defaultUserTheme);
}

export async function POST(request: Request) {
  // Echo back validated theme without touching any database.
  const body = (await request.json()) as Partial<UserThemeConfig>;

  const nextTheme: UserThemeConfig = {
    preferredColor: isThemeColor(String(body.preferredColor))
      ? (body.preferredColor as ThemeColor)
      : defaultUserTheme.preferredColor,
    style: isThemeStyle(String(body.style))
      ? (body.style as ThemeStyle)
      : defaultUserTheme.style,
    tone: isThemeTone(body.tone) ? body.tone : defaultUserTheme.tone,
    density: isThemeDensity(String(body.density))
      ? (body.density as ThemeDensity)
      : defaultUserTheme.density,
  };

  return NextResponse.json(nextTheme);
}
