import { ThemeProvider } from "./design-system/theme/provider";
import { AppHeader } from "./design-system/components/layout/app-header";
import "./globals.css";
import { AppFooter } from "./design-system/components/layout/app-footer";
import { ProductsCatalogProvider } from "@/lib/products-catalog-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="flex flex-col min-h-screen text-right" dir="rtl">
        <ThemeProvider>
          <ProductsCatalogProvider>
            <AppHeader />
            <main className="flex-1">
              {children}
            </main>
            <AppFooter />
          </ProductsCatalogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
