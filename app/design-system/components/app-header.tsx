"use client";

import React from "react";
import Toggle from "./shared/toggle";
import { useTheme } from "../theme/provider";

const navItems = [
  { href: "/", label: "home", tone: "bg-ui-info text-white" },
  { href: "/date.converter", label: "date converter", tone: "bg-ui-warning text-white" },
  { href: "/panel/admin", label: "admin panel", tone: "bg-ui-primary text-black" },
  { href: "/panel/user", label: "user panel", tone: "bg-ui-secondary text-white" },
  { href: "/test", label: "theme test", tone: "bg-ui-success text-black" },
];

export function AppHeader() {
  const { mode, setMode } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-ui-primary/20 bg-bg-base/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl flex-wrap gap-3 p-4">
        <Toggle
          checked={mode === "dark"}
          onChange={(isDark: boolean) => setMode(isDark ? "dark" : "light")}
        />
        {navItems.map((item) => (
          <a
            key={item.href}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${item.tone}`}
            href={item.href}
          >
            {item.label}
          </a>
        ))}
        <a
          className="rounded-md bg-ui-info px-4 py-2 text-sm font-semibold text-white"
          href="http://localhost:6006"
          target="_blank"
          rel="noreferrer"
        >
          storybook
        </a>
      </nav>
    </header>
  );
}