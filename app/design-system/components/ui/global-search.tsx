"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { CustomInput } from "./input";
import { useIsMobile } from "@/hooks/useIsMobile";

export function GlobalSearch() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [value, setValue] = useState("");
  const [expanded, setExpanded] = useState(false);
  const INPUT_ID = "global-search-input";
  const isOpen = !isMobile || expanded;

  const submit = (q?: string) => {
    const v = (q ?? value).trim();
    if (!v) return; // do not submit empty
    router.push(`/search?q=${encodeURIComponent(v)}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile && expanded) {
        close();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded, isMobile]);

  useEffect(() => {
    if (isMobile) {
      close();
    }
  }, [isMobile]);

  const open = () => {
    setExpanded(true);
    setTimeout(() => (document.getElementById(INPUT_ID) as HTMLInputElement | null)?.focus(), 60);
  };

  const close = () => {
    setExpanded(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <div
          className={`relative flex items-center transition-all duration-200 md:static md:h-auto md:w-72 ${
            expanded ? "w-72" : "h-6 w-6 shrink-0 justify-center"
          }`}
        >
          <CustomInput
            id={INPUT_ID}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder=" search products ..."
            fullWidth={isOpen}
            rounded="full"
            border="none"
            className={
              isOpen
                ? "h-10 bg-primary-media px-9 text-sm"
                : "bg-primary-media h-6 w-6 min-w-6 p-0 text-center text-transparent caret-transparent placeholder:text-transparent md:h-10 md:w-full md:px-9 md:text-sm md:text-primary-text md:caret-auto md:placeholder:text-secondary-text"
            }
            style={{ backgroundColor: "var(--primary-media)" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            aria-label="global-search"
          />

          <button
            type="button"
            onClick={() => {
              if (isMobile) {
                if (!expanded) {
                  open();
                  return;
                }
              }

              submit();
            }}
            aria-label="submit-search"
            className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center text-secondary-text md:right-2 md:p-1 ${isOpen ? "right-2 p-1" : "left-1/2 -translate-x-1/2 p-0.5 md:left-auto md:translate-x-0"}`}
          >
            <FiSearch />
          </button>

          {isMobile && expanded && (
            <button
              type="button"
              onClick={close}
              aria-label="close-search"
              className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center justify-center p-1 text-secondary-text"
            >
              <IoClose />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
