"use client";

import { useEffect, useMemo, useState } from "react";
import { IoAdd, IoCloudUploadOutline, IoSaveOutline, IoTrashOutline } from "react-icons/io5";
import { CustomButton } from "../../design-system/components/ui/button";
import { FloatButton } from "../../design-system/components/ui/float-button";
import { CustomInput } from "../../design-system/components/ui/input";
import { CustomModal } from "../../design-system/components/ui/modal";
import { CustomSwitch } from "../../design-system/components/ui/switch";

type ProductForm = {
  id: number | string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  badge: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
  sortOrder: number;
};

const PRODUCTS_STORAGE_KEY = "admin-products";

const createProduct = (): ProductForm => ({
  id: `local-${Date.now()}`,
  title: "",
  description: "",
  price: "",
  imageUrl: "",
  badge: "",
  ctaLabel: "View product",
  ctaHref: "#",
  active: true,
  sortOrder: 1,
});

function readLocalProducts(): ProductForm[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalProducts(products: ProductForm[]) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function mergeProducts(...lists: ProductForm[][]) {
  const seen = new Set<string>();
  const merged: ProductForm[] = [];

  for (const item of lists.flat()) {
    const key = String(item.id ?? `${item.title}-${item.description}-${item.price}`);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged;
}

function normalizeProduct(item: Partial<ProductForm>, index: number): ProductForm {
  return {
    id: item.id ?? `local-${Date.now()}-${index}`,
    title: String(item.title ?? ""),
    description: String(item.description ?? ""),
    price: String(item.price ?? ""),
    imageUrl: String(item.imageUrl ?? ""),
    badge: String(item.badge ?? ""),
    ctaLabel: String(item.ctaLabel ?? "View product"),
    ctaHref: String(item.ctaHref ?? "#"),
    active: Boolean(item.active),
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1,
  };
}

export function AdminProductsPanel() {
  const [products, setProducts] = useState<ProductForm[]>([]);
  const [draftProduct, setDraftProduct] = useState<ProductForm>(createProduct);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products?all=1", { cache: "no-store" });
        const data = await res.json();
        const apiProducts = Array.isArray(data?.data) ? data.data.map(normalizeProduct) : [];
        const localProducts = readLocalProducts().map(normalizeProduct);
        setProducts(mergeProducts(apiProducts, localProducts));
      } catch {
        setProducts(readLocalProducts().map(normalizeProduct));
      }
    };

    loadProducts();
  }, []);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.sortOrder - b.sortOrder),
    [products]
  );

  const updateProduct = (id: ProductForm["id"], patch: Partial<ProductForm>) => {
    setProducts((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeProduct = (id: ProductForm["id"]) => {
    setProducts((current) => current.filter((item) => item.id !== id));
  };

  const persistProducts = async (nextProducts: ProductForm[]) => {
    const validProducts = nextProducts.filter(
      (item) => item.title.trim() && item.description.trim() && item.price.trim()
    );

    setSaving(true);
    setStatus("");

    try {
      writeLocalProducts(validProducts);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: validProducts }),
      });
      const data = await res.json();
      const savedProducts = Array.isArray(data?.data) ? data.data.map(normalizeProduct) : validProducts;
      setProducts(savedProducts);
      writeLocalProducts(savedProducts);
      setStatus("Products saved.");
    } catch {
      writeLocalProducts(validProducts);
      setStatus("Saved locally. API was not available.");
    } finally {
      setSaving(false);
    }
  };

  const saveProducts = () => persistProducts(sortedProducts);

  const openCreateModal = () => {
    setDraftProduct({ ...createProduct(), sortOrder: products.length + 1 });
    setIsCreateOpen(true);
  };

  const updateDraftProduct = (patch: Partial<ProductForm>) => {
    setDraftProduct((current) => ({ ...current, ...patch }));
  };

  const handleImageUpload = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateDraftProduct({ imageUrl: String(reader.result ?? "") });
    };
    reader.readAsDataURL(file);
  };

  const submitDraftProduct = async () => {
    if (!draftProduct.title.trim() || !draftProduct.description.trim() || !draftProduct.price.trim()) {
      setStatus("Title, description, and price are required.");
      return;
    }

    const nextProducts = [...products, draftProduct];
    setProducts(nextProducts);
    setIsCreateOpen(false);
    await persistProducts(nextProducts);
  };

  return (
    <section className="flex w-full max-w-5xl flex-col gap-4 rounded-lg border border-ui-primary/30 bg-bg-surface p-4 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Products</h2>
          <p className="text-sm text-text-secondary">Manage the product showcase cards.</p>
        </div>
        <div className="flex gap-2">
          <CustomButton
            size="sm"
            border="base"
            isLoading={saving}
            loading="dots"
            loadingText="Saving..."
            icon={<IoSaveOutline />}
            onClick={saveProducts}
          >
            Save
          </CustomButton>
        </div>
      </div>

      {status && <div className="text-sm font-semibold text-ui-primary">{status}</div>}

      {sortedProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ui-primary/30 bg-bg-base p-6 text-sm text-text-secondary">
          No products registered yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedProducts.map((product, index) => (
            <div key={product.id} className="grid gap-3 rounded-lg border border-ui-primary/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold">Product {index + 1}</div>
              <div className="flex items-center gap-3">
                <CustomSwitch
                  checked={product.active}
                  onChange={(active) => updateProduct(product.id, { active })}
                  label={product.active ? "Active" : "Hidden"}
                  size="sm"
                />
                <CustomButton
                  size="sm"
                  variant="danger"
                  border="base"
                  icon={<IoTrashOutline />}
                  onClick={() => removeProduct(product.id)}
                >
                  Delete
                </CustomButton>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <CustomInput
                value={product.title}
                placeholder="Title"
                onChange={(event) => updateProduct(product.id, { title: event.target.value })}
              />
              <CustomInput
                value={product.price}
                placeholder="Price"
                onChange={(event) => updateProduct(product.id, { price: event.target.value })}
              />
              <CustomInput
                value={product.imageUrl}
                placeholder="Image URL"
                onChange={(event) => updateProduct(product.id, { imageUrl: event.target.value })}
              />
              <CustomInput
                value={product.badge}
                placeholder="Badge"
                onChange={(event) => updateProduct(product.id, { badge: event.target.value })}
              />
              <CustomInput
                value={product.ctaLabel}
                placeholder="CTA label"
                onChange={(event) => updateProduct(product.id, { ctaLabel: event.target.value })}
              />
              <CustomInput
                value={product.ctaHref}
                placeholder="CTA href"
                onChange={(event) => updateProduct(product.id, { ctaHref: event.target.value })}
              />
              <CustomInput
                type="number"
                value={product.sortOrder}
                placeholder="Sort order"
                onChange={(event) => updateProduct(product.id, { sortOrder: Number(event.target.value) })}
              />
            </div>

            <textarea
              value={product.description}
              placeholder="Description"
              onChange={(event) => updateProduct(product.id, { description: event.target.value })}
              className="min-h-24 rounded-md border border-ui-primary/30 bg-bg-base p-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-ui-primary/30"
            />
            </div>
          ))}
        </div>
      )}

      <FloatButton
        label="New product"
        icon={<IoAdd />}
        position="bottom-right"
        border="base"
        shadow="lg"
        onClick={openCreateModal}
      />

      <CustomModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register product"
        closeText="Close"
        rounded="lg"
        border="base"
        shadow="lg"
      >
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
          <div className="grid gap-3 md:grid-cols-2">
            <CustomInput
              value={draftProduct.title}
              placeholder="Title"
              onChange={(event) => updateDraftProduct({ title: event.target.value })}
            />
            <CustomInput
              value={draftProduct.price}
              placeholder="Price"
              onChange={(event) => updateDraftProduct({ price: event.target.value })}
            />
            <CustomInput
              value={draftProduct.badge}
              placeholder="Badge"
              onChange={(event) => updateDraftProduct({ badge: event.target.value })}
            />
            <CustomInput
              type="number"
              value={draftProduct.sortOrder}
              placeholder="Sort order"
              onChange={(event) => updateDraftProduct({ sortOrder: Number(event.target.value) })}
            />
            <CustomInput
              value={draftProduct.ctaLabel}
              placeholder="CTA label"
              onChange={(event) => updateDraftProduct({ ctaLabel: event.target.value })}
            />
            <CustomInput
              value={draftProduct.ctaHref}
              placeholder="CTA href"
              onChange={(event) => updateDraftProduct({ ctaHref: event.target.value })}
            />
          </div>

          <textarea
            value={draftProduct.description}
            placeholder="Description"
            onChange={(event) => updateDraftProduct({ description: event.target.value })}
            className="min-h-24 rounded-md border border-ui-primary/30 bg-bg-base p-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-ui-primary/30"
          />

          <div className="grid gap-3 rounded-lg border border-ui-primary/20 p-3">
            <div className="text-sm font-bold">Product image</div>
            <CustomInput
              value={draftProduct.imageUrl}
              placeholder="Image URL or uploaded image data"
              onChange={(event) => updateDraftProduct({ imageUrl: event.target.value })}
            />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-ui-primary/40 bg-bg-base p-4 text-sm font-semibold text-text-secondary transition hover:bg-ui-primary/10">
              <IoCloudUploadOutline className="text-xl" aria-hidden="true" />
              Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
              />
            </label>
            <div className="flex h-40 items-center justify-center overflow-hidden rounded-md border border-ui-primary/20 bg-bg-base">
              {draftProduct.imageUrl ? (
                <img
                  src={draftProduct.imageUrl}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm text-text-secondary">Image preview</span>
              )}
            </div>
          </div>

          <CustomSwitch
            checked={draftProduct.active}
            onChange={(active) => updateDraftProduct({ active })}
            label={draftProduct.active ? "Active" : "Hidden"}
            size="sm"
          />

          <CustomButton
            border="base"
            fullWidth
            isLoading={saving}
            loading="dots"
            loadingText="Saving..."
            icon={<IoSaveOutline />}
            onClick={submitDraftProduct}
          >
            Register product
          </CustomButton>
        </div>
      </CustomModal>
    </section>
  );
}
