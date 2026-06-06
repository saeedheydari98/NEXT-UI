"use client";

import Link from "next/link";
import { useState } from "react";
import { IoArrowBack, IoClose, IoMenu } from "react-icons/io5";
import Toggle from "../shared/toggle";
import { useTheme } from "../../theme/provider";
import { useScrollHeaderHide } from "@/hooks/useScrollHeaderHide";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useBackNavigation } from "@/hooks/useBackNavigation";

const navItems = [
  { href: "/", label: "home", tone: "bg-ui-primary text-white" },
  { href: "/date.converter", label: "date converter", tone: "bg-ui-primary text-white" },
  { href: "/panel/admin", label: "admin panel", tone: "bg-ui-primary text-white" },
  { href: "/panel/user", label: "user panel", tone: "bg-ui-primary text-white" },
];

export function AppHeader() {
  const { mode, setMode } = useTheme();
  const hideHeader = useScrollHeaderHide(10);
  const isMobile = useIsMobile();
  const { goBack, showBackButton } = useBackNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`
        sticky top-0 z-30 border-b border-ui-primary/20 
        bg-bg-base/90 backdrop-blur flex justify-center items-center 
        w-full h-20 transition-transform duration-300
        ${hideHeader ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="flex justify-between items-center w-full  px-4">
        {/* Logo or brand name */}
        <div className="flex justify-center items-center gap-4">
          {showBackButton && isMobile && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ui-primary/30 text-xl text-text-primary transition-colors hover:bg-ui-primary/10"
              aria-label="back"
            >
              <IoArrowBack aria-hidden="true" />
            </button>
          )}
          <div className="text-sm font-bold text-text-primary border-b-2 border-red-600">
            LiveUiBook
          </div>
          <Toggle
            checked={mode === "dark"}
            onChange={(isDark: boolean) => setMode(isDark ? "dark" : "light")}
          />
        </div>


        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex justify-center items-center gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-all hover:scale-105 ${item.tone}`}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
            <a
              className="rounded-md px-4 py-2 text-sm font-semibold text-white bg-ui-primary transition-all hover:scale-105"
              href="http://localhost:6006"
              target="_blank"
              rel="noreferrer"
            >
              storybook
            </a>
          </nav>
        )}

        {/* Mobile Navigation - Menu/Close Button and Theme Toggle */}
        {isMobile && (
          <div className="flex items-center gap-3">

            <button
              onClick={toggleMenu}
              className="text-2xl text-text-primary p-1 rounded-md hover:bg-ui-primary/10 transition-colors"
              aria-label={isMenuOpen ? "close menu" : "open menu"}
            >
              {isMenuOpen ? <IoClose /> : <IoMenu />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown - Glassmorphic Background */}
      {isMobile && isMenuOpen && (
        <div className="absolute top-20 left-0 right-0 z-20 ">
          <div className="flex flex-col p-4 gap-2 max-w-5xl mx-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={`rounded-md px-4 py-3 text-sm font-semibold transition-all hover:scale-105 text-center backdrop-blur-md bg-bg-base/80 border border-ui-primary/20 ${item.tone}`}
                href={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <a
              className="rounded-md px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-105 text-center backdrop-blur-md bg-ui-primary border border-ui-primary/20 "
              href="http://localhost:6006"
              target="_blank"
              rel="noreferrer"
              onClick={closeMenu}
            >
              storybook
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
