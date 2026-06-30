"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryOption from "./design-system/components/ui/category-option";
import { BannerCarousel } from "./products/product-showcase/banner-carousel";
import {
  getProducts,
  slugifyCatalogValue,
  type BannerRecord,
  type ProductRecord,
} from "@/lib/products-client";

type BrandRecord = {
  id: string;
  title: string;
  imageUrl?: string;
};

export default function Home() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const catalog = await getProducts();
      if (cancelled) return;

      const brandMap = new Map<string, BrandRecord>();
      catalog.products
        .filter((product: ProductRecord) => product.active !== false && product.isActive !== false && String(product.brand ?? "").trim())
        .forEach((product: ProductRecord) => {
          const title = String(product.brand ?? "").trim();
          const id = slugifyCatalogValue(title);
          if (!brandMap.has(id)) {
            brandMap.set(id, { id, title, imageUrl: product.imageUrl });
          }
        });

      setBrands(Array.from(brandMap.values()));
      setBanners(catalog.banners.filter((banner) => banner.active !== false && banner.showOnHome !== false));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-primary-base text-primary-text">
      <div className="mx-auto flex w-full flex-col gap-8 px-4 py-8">
        <div className="flex flex-col gap-3 border-b border-primary-border pb-5">
          <div className="text-3xl font-bold">خوش آمدید</div>
          <span className="text-sm text-secondary-text">اینجا خانه فروشگاه است؛ معرفی فروشگاه، بنرها و برندهای منتخب را از همین صفحه دنبال کنید.</span>
        </div>

        {!loading && banners.length > 0 ? (
          <div className="flex flex-col gap-4">
            {banners.map((banner) => (
              <BannerCarousel
                key={banner.id}
                banner={{ ...banner, title: banner.title ?? "", imageUrls: banner.imageUrls ?? [], active: banner.active !== false, sortOrder: Number(banner.sortOrder ?? 0) }}
                onPreview={(imageUrl) => setPreviewImage(imageUrl ?? "")}
              />
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <div className="text-xl font-bold">برندها</div>
          {loading ? <div className="text-sm text-secondary-text">در حال بارگذاری برندها...</div> : null}
          {!loading && brands.length === 0 ? (
            <div className="rounded-lg border border-primary-border bg-primary-card p-4 text-sm text-secondary-text">در حال حاضر برند فعالی وجود ندارد.</div>
          ) : null}
          <div className="flex flex-wrap gap-4">
            {brands.map((brand) => (
              <CategoryOption
                key={brand.id}
                label={brand.title}
                imageUrl={brand.imageUrl}
                size="lg"
                onClick={() => router.push(`/brand/${brand.id}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {previewImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/10 p-4 backdrop-blur-sm" onClick={() => setPreviewImage("")}>
          <div className="flex max-h-[75vh] w-full max-w-3xl items-center justify-center overflow-hidden rounded-lg border border-primary-border bg-primary-card p-2 shadow-xl">
            <img src={previewImage} alt="پیش نمایش بنر" className="max-h-[72vh] w-full object-contain" onClick={(event) => event.stopPropagation()} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
