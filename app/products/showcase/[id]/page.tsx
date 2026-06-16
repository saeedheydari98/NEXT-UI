"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProductsCatalog } from "@/lib/products-catalog-context";
import { FiExternalLink } from "react-icons/fi";
import Loading from "@/app/design-system/components/loading/loading";
import { CustomButton } from "@/app/design-system/components/ui/button";

const LOADING_PRODUCTS = [
  {
    id: "loading-product-1",
    title: "Product title placeholder",
    price: "1299",
    description: "Short product description for loading layout",
  },
  {
    id: "loading-product-2",
    title: "Another product item",
    price: "899",
    description: "Second product description for sizing",
  },
  {
    id: "loading-product-3",
    title: "Premium catalog item",
    price: "2499",
    description: "Third product description for sizing",
  },
];

export default function ShowcasePage() {
  const params = useParams();
  const showcaseId = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? "");
  const { getShowcaseById, loading } = useProductsCatalog();
  const showcase = useMemo(() => getShowcaseById(showcaseId), [getShowcaseById, showcaseId]);
  const products = showcase?.products ?? [];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyActive, setOnlyActive] = useState(true);
  const [globalSearchResults, setGlobalSearchResults] = useState<any[] | null>(null);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [yearMin, setYearMin] = useState<string>("");
  const [yearMax, setYearMax] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  // When a global search query is entered, fetch all products and filter across showcases
  useEffect(() => {
    let cancelled = false;
    const q = String(searchQuery ?? "").trim();
    if (!q) {
      setGlobalSearchResults(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/products`);
        const json = await res.json();
        const list = Array.isArray(json?.data?.products) ? json.data.products : [];
        const filtered = list.filter((p: any) => {
          const txt = `${p.title} ${p.description} ${p.price}`.toLowerCase();
          return txt.includes(q.toLowerCase());
        });
        if (!cancelled) setGlobalSearchResults(filtered);
      } catch {
        if (!cancelled) setGlobalSearchResults([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  // Apply local filters on current product list or global search results
  const filteredProducts = (globalSearchResults ?? products).filter((p: any) => {
    if (onlyActive && p.active === false) return false;
    if (onlyDiscounted) {
      const percent = Number(p.discountPercent || 0);
      if (!(percent > 0 || (p.discountPrice && String(p.discountPrice).trim()))) return false;
    }
    // Price range filter (parse numeric values)
    const parsePrice = (v: any) => {
      try {
        const s = String(v || "").replace(/[^\d.]/g, "");
        return s ? Number(s) : NaN;
      } catch {
        return NaN;
      }
    };

    const pPrice = Number.isFinite(parsePrice(p.discountPrice)) ? parsePrice(p.discountPrice) : parsePrice(p.price);
    const min = Number.isFinite(Number(parsePrice(priceMin))) ? Number(parsePrice(priceMin)) : NaN;
    const max = Number.isFinite(Number(parsePrice(priceMax))) ? Number(parsePrice(priceMax)) : NaN;
    if (!Number.isNaN(min) && !Number.isNaN(pPrice) && pPrice < min) return false;
    if (!Number.isNaN(max) && !Number.isNaN(pPrice) && pPrice > max) return false;

    // Year range filter (support multiple possible field names)
    const getYear = (prod: any) => {
      const candidates = [prod.year, prod.manufactureYear, prod.madeYear, prod.releaseYear];
      for (const c of candidates) {
        const n = Number(String(c || "").replace(/[^\d-]/g, ""));
        if (Number.isFinite(n) && n > 0) return n;
      }
      return NaN;
    };

    const py = getYear(p);
    const yMin = Number(String(yearMin || "").replace(/[^\d]/g, ""));
    const yMax = Number(String(yearMax || "").replace(/[^\d]/g, ""));
    if (!Number.isNaN(yMin) && !Number.isNaN(py) && py < yMin) return false;
    if (!Number.isNaN(yMax) && !Number.isNaN(py) && py > yMax) return false;

    // Category and type filters (optional fields)
    if (selectedCategory && String(p.category || p.typeCategory || "").toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedType && String(p.type || p.productType || "").toLowerCase() !== selectedType.toLowerCase()) return false;

    return true;
  });

  if (loading && !showcase) {
    return (
      <main className="min-h-screen bg-bg-base text-primary-text">
        <div className="p-4 w-full">
          <div className="flex items-center justify-between">
            <Loading loading="skeleton-item" isLoading>
              <div className="text-2xl font-bold">Showcase title placeholder</div>
            </Loading>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {LOADING_PRODUCTS.map((product) => (
                <div key={product.id} className="rounded-md border border-border-default p-3 bg-primary-card">
                  <div className="flex gap-3">
                    <Loading loading="skeleton-item" isLoading>
                      <div className="w-24 h-24 overflow-hidden rounded bg-primary-media" />
                    </Loading>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col h-full">
                        <Loading loading="skeleton-item" isLoading>
                          <div className="text-sm font-bold">{product.title}</div>
                        </Loading>
                        <Loading loading="skeleton-item" isLoading>
                          <div className="text-primary text-sm font-bold">{product.price}$</div>
                        </Loading>
                        <Loading loading="skeleton-item" isLoading>
                          <div className="text-xs text-secondary-text line-clamp-2">
                            {product.description}
                          </div>
                        </Loading>
                      </div>
                      <div className=" flex gap-2">
                        <Loading loading="skeleton-item" isLoading className="w-full">
                          {(() => {
                            const viewHref = `/products/${product.id}`;
                            const handleClick = async (e: React.MouseEvent) => {
                              e.preventDefault();
                              try { await fetch(`/api/products?id=${encodeURIComponent(String(product.id))}`, { method: "GET" }); } catch {}
                              router.push(viewHref);
                            };
                            return (
                              <CustomButton href={viewHref} onClick={handleClick} className="w-full" variant="primary" size="sm" rounded="md" iconAfter={<FiExternalLink />}>View</CustomButton>
                            );
                          })()}
                        </Loading>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="p-4 w-full">
      <div className="flex items-center justify-between gap-4">
        <div className="text-2xl font-bold">{showcase?.title || `Showcase: ${showcaseId}`}</div>

        <div className="flex-1">
          {/* Desktop: show input; Mobile: toggleable */}
          <div className="hidden sm:flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all products..."
              className="w-full rounded-md border p-2 text-sm"
            />
          </div>
          <div className="flex sm:hidden items-center gap-2">
            {showMobileSearch ? (
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-md border p-2 text-sm"
              />
            ) : (
              <CustomButton size="sm" variant="neutral" onClick={() => setShowMobileSearch(true)}>Search</CustomButton>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CustomButton size="sm" variant="secondary" onClick={() => setShowFilterModal(true)}>Filter</CustomButton>
        </div>
      </div>

      {showcase?.description ? (
        <div className="mt-2 text-sm text-secondary-text">{showcase.description}</div>
      ) : null}

      <div className="mt-4 flex gap-4">
        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-sm text-secondary-text">No products found for this showcase.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="rounded-md border border-primary-border p-3 bg-primary-card">
                  <div className="flex gap-3">
                    <div className="w-24 h-24 overflow-hidden rounded bg-primary-media">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="p-2 text-sm">No image</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col h-full">
                        <div className="text-sm font-bold">{product.title}</div>
                        <div className="text-primary text-sm font-bold">{product.price}$</div>
                        <div className="text-xs text-secondary-text line-clamp-2">{product.description}</div>
                      </div>
                      <div className=" flex gap-2">
                        {(() => {
                          const viewHref = `/products/${product.id}`;
                          const handleClick = async (e: React.MouseEvent) => {
                            e.preventDefault();
                            try { await fetch(`/api/products?id=${encodeURIComponent(String(product.id))}`, { method: "GET" }); } catch {}
                            router.push(viewHref);
                          };

                          return (
                            <CustomButton href={viewHref} onClick={handleClick} className="w-full" variant="primary" size="sm" rounded="md" iconAfter={<FiExternalLink />}>View</CustomButton>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Filters are only available via the Filter button (modal). Desktop panel removed per design. */}
      </div>

      {/* Mobile filter modal */}
      {showFilterModal ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilterModal(false)} />
          <div className="relative bg-white w-3/4 max-w-sm h-full p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold">Filters</div>
              <CustomButton size="sm" variant="neutral" onClick={() => setShowFilterModal(false)}>Close</CustomButton>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} /> Active only</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyDiscounted} onChange={(e) => setOnlyDiscounted(e.target.checked)} /> Only discounted</label>

              <div>
                <div className="text-xs text-secondary-text mb-1">Price range</div>
                <div className="flex gap-2">
                  <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min" className="w-1/2 rounded-md border px-2 py-1 text-sm" />
                  <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max" className="w-1/2 rounded-md border px-2 py-1 text-sm" />
                </div>
              </div>

              <div>
                <div className="text-xs text-secondary-text mb-1">Year range</div>
                <div className="flex gap-2">
                  <input value={yearMin} onChange={(e) => setYearMin(e.target.value)} placeholder="From" className="w-1/2 rounded-md border px-2 py-1 text-sm" />
                  <input value={yearMax} onChange={(e) => setYearMax(e.target.value)} placeholder="To" className="w-1/2 rounded-md border px-2 py-1 text-sm" />
                </div>
              </div>

              <div>
                <div className="text-xs text-secondary-text mb-1">Category</div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-md border px-2 py-1 text-sm">
                  <option value="">All categories</option>
                  {(Array.from(new Set((products || []).map((p: any) => String(p.category || p.typeCategory || "")).filter(Boolean)))).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs text-secondary-text mb-1">Type</div>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full rounded-md border px-2 py-1 text-sm">
                  <option value="">All types</option>
                  {(Array.from(new Set((products || []).map((p: any) => String(p.type || p.productType || "")).filter(Boolean)))).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <CustomButton size="sm" variant="primary" onClick={() => setShowFilterModal(false)}>Apply</CustomButton>
                <CustomButton size="sm" variant="neutral" onClick={() => {
                  setPriceMin(""); setPriceMax(""); setYearMin(""); setYearMax(""); setSelectedCategory(""); setSelectedType(""); setOnlyDiscounted(false); setOnlyActive(true); setShowFilterModal(false);
                }}>Clear</CustomButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
