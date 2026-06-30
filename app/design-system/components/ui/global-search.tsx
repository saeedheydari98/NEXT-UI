"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { CustomInput } from "./input";
import { useIsMobile } from "@/hooks/useIsMobile";
import { productSlug, type ProductRecord } from "@/lib/products-client";

type SearchPayload = {
  ok?: boolean;
  data?: {
    products?: {
      items?: ProductRecord[];
    };
  };
};

const INPUT_ID = "global-search-input";

export function GlobalSearch() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [value, setValue] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const isOpen = !isMobile || expanded;
  const query = value.trim();
  const showPanel = isOpen && focused && (query.length > 0 || loading || hasSearched);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      void fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=8`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: SearchPayload | null) => {
          const items = payload?.data?.products?.items;
          setResults(Array.isArray(items) ? items : []);
          setHasSearched(true);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setResults([]);
          setHasSearched(true);
        })
        .finally(() => setLoading(false));
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocused(false);
        if (isMobile) setExpanded(false);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) setExpanded(false);
  }, [isMobile]);

  const open = () => {
    setExpanded(true);
    window.setTimeout(() => (document.getElementById(INPUT_ID) as HTMLInputElement | null)?.focus(), 60);
  };

  const close = () => {
    setExpanded(false);
    setFocused(false);
  };

  const goToProduct = (product: ProductRecord) => {
    setFocused(false);
    setExpanded(false);
    router.push(`/products/${productSlug(product) || product.id}`);
  };

  const handleBlur = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setFocused(false), 120);
  };

  return (
    <div className="relative min-w-0 flex-1 md:flex-none">
      <div className="flex min-w-0 items-center">
        <div
          className={`relative flex items-center transition-all duration-200 ease-out md:static md:h-auto md:w-72 ${
            expanded ? "h-10 w-full min-w-0" : "h-6 w-10 min-w-10 shrink-0 justify-center"
          }`}
        >
          <CustomInput
            id={INPUT_ID}
            name="site-global-search"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="جستجو محصول ..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            showLabel={false}
            fullWidth={isOpen}
            rounded="full"
            border="none"
            className={
              isOpen
                ? "h-10 px-7 text-sm"
                : "h-6 w-10 min-w-10 p-0 text-center text-transparent caret-transparent placeholder:text-transparent md:h-10 md:w-full md:px-7 md:text-sm md:text-primary-text md:caret-auto md:placeholder:text-secondary-text"
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && results[0]) {
                event.preventDefault();
                goToProduct(results[0]);
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            aria-label="جستجوی محصولات"
          />

          <button
            type="button"
            onClick={() => {
              if (isMobile && !expanded) {
                open();
                return;
              }
              setFocused(true);
            }}
            aria-label="باز کردن جستجو"
            className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center text-secondary-text md:right-1.5 md:p-0.5 ${isOpen ? "right-1.5 p-0.5" : "left-1/2 -translate-x-1/2 p-0.5 md:left-auto md:translate-x-0"}`}
          >
            <FiSearch />
          </button>

          {isMobile && expanded ? (
            <button
              type="button"
              onClick={close}
              aria-label="بستن جستجو"
              className="absolute left-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center p-0.5 text-secondary-text"
            >
              <IoClose />
            </button>
          ) : null}
        </div>
      </div>

      {showPanel ? (
        <div className="absolute top-full z-40 mt-2 flex w-full min-w-72 flex-col overflow-hidden rounded-lg border border-primary-border bg-primary-card shadow-lg md:w-72">
          {loading ? (
            <div className="px-3 py-3 text-sm font-semibold text-secondary-text">در حال جستجو...</div>
          ) : results.length > 0 ? (
            <div className="flex max-h-80 flex-col overflow-y-auto">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="flex items-center gap-3 border-b border-primary-border bg-transparent px-3 py-2 text-right transition hover:bg-primary-bg"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goToProduct(product)}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-media">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-secondary-text">بدون</span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="line-clamp-1 text-sm font-bold text-primary-text">{product.title}</span>
                    <span className="line-clamp-1 text-xs font-semibold text-secondary-text">{product.discountPrice || product.price}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-3 text-sm font-semibold text-secondary-text">یافت نشد</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default GlobalSearch;
