import { ProductsCatalogProvider } from "@/lib/products-catalog-context";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <ProductsCatalogProvider>{children}</ProductsCatalogProvider>;
}
