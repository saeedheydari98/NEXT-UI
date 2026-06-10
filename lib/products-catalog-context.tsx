"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  findProductById,
  findShowcaseById,
  getProducts,
  type ProductRecord,
  type ShowcaseRecord,
} from "@/lib/products-client";

type ProductsCatalogContextValue = {
  products: ProductRecord[];
  showcases: ShowcaseRecord[];
  loading: boolean;
  getProductById: (id: string | number) => ProductRecord | null;
  getShowcaseById: (id: string | number) => ShowcaseRecord | null;
  refresh: () => Promise<void>;
};

const ProductsCatalogContext = createContext<ProductsCatalogContextValue | null>(null);

export function ProductsCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [showcases, setShowcases] = useState<ShowcaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (force = false) => {
    if (!force) setLoading(true);
    try {
      const data = await getProducts({ force });
      setProducts(data.products);
      setShowcases(data.showcases);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const data = await getProducts();
      if (cancelled) return;
      setProducts(data.products);
      setShowcases(data.showcases);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const getProductById = useCallback(
    (id: string | number) => findProductById(products, id),
    [products]
  );

  const getShowcaseById = useCallback(
    (id: string | number) => findShowcaseById(products, showcases, id),
    [products, showcases]
  );

  const value = useMemo(
    () => ({
      products,
      showcases,
      loading,
      getProductById,
      getShowcaseById,
      refresh: () => load(true),
    }),
    [products, showcases, loading, getProductById, getShowcaseById, load]
  );

  return (
    <ProductsCatalogContext.Provider value={value}>{children}</ProductsCatalogContext.Provider>
  );
}

export function useProductsCatalog() {
  const context = useContext(ProductsCatalogContext);
  if (!context) {
    throw new Error("useProductsCatalog must be used within ProductsCatalogProvider");
  }
  return context;
}
