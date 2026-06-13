"use client";

import { useEffect, useMemo, useState } from "react";
import { IoBagHandleOutline, IoCardOutline, IoTrashOutline } from "react-icons/io5";
import { CustomButton } from "../design-system/components/ui/button";
import { CustomInput } from "../design-system/components/ui/input";
import { CustomModal } from "../design-system/components/ui/modal";
import {
  EMPTY_USER_PROFILE,
  isUserProfileComplete,
  readUserProfile,
  writeUserProfile,
  type UserProfile,
} from "@/lib/user-profile";

type CartItem = {
  id?: number | string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  discountPrice?: string;
  discountPercent?: number | string;
  imageUrl?: string;
  quantity: number;
};

const CART_STORAGE_KEY = "product-cart";
const CART_UPDATED_EVENT = "product-cart-updated";

function readCart(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

function getFinalPrice(item: CartItem) {
  return item.discountPrice || item.price;
}

function formatPrice(value?: string | number) {
  const normalized = String(value || "").replace(/[^\d.]/g, "");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || !normalized) {
    return String(value || "");
  }

  return `$${parsed.toLocaleString("en-US")}`;
}

function readPriceNumber(value?: string) {
  const normalized = String(value || "").replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDiscountPercent(item: CartItem) {
  const percent = Number(item.discountPercent);
  return Number.isFinite(percent) && percent > 0 ? Math.round(percent) : 0;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [previewImage, setPreviewImage] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState<UserProfile>(EMPTY_USER_PROFILE);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    setItems(readCart());
    const savedProfile = readUserProfile();
    setProfile(savedProfile);
    setProfileDraft(savedProfile ?? EMPTY_USER_PROFILE);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + readPriceNumber(getFinalPrice(item)) * item.quantity, 0),
    [items]
  );

  const removeItem = (target: CartItem) => {
    const targetKey = String(target.id ?? `${target.title}-${target.description}-${target.price}`);
    const nextItems = items.filter(
      (item) => String(item.id ?? `${item.title}-${item.description}-${item.price}`) !== targetKey
    );
    setItems(nextItems);
    writeCart(nextItems);
  };

  const updateQuantity = (target: CartItem, nextQuantity: number) => {
    const targetKey = String(target.id ?? `${target.title}-${target.description}-${target.price}`);

    if (nextQuantity <= 0) {
      removeItem(target);
      return;
    }

    const nextItems = items.map((item) =>
      String(item.id ?? `${item.title}-${item.description}-${item.price}`) === targetKey
        ? { ...item, quantity: nextQuantity }
        : item
    );
    setItems(nextItems);
    writeCart(nextItems);
  };

  const clearCart = () => {
    setItems([]);
    writeCart([]);
  };

  const openImagePreview = (imageUrl?: string) => {
    if (!imageUrl) return;
    setPreviewImage(imageUrl);
  };

  const updateProfileDraft = (patch: Partial<UserProfile>) => {
    setProfileDraft((current) => ({ ...current, ...patch }));
    setProfileError("");
  };

  const saveProfileDraft = () => {
    if (!isUserProfileComplete(profileDraft)) {
      setProfileError("All profile fields are required.");
      return;
    }

    const nextProfile = {
      firstName: profileDraft.firstName.trim(),
      lastName: profileDraft.lastName.trim(),
      nationalId: profileDraft.nationalId.trim(),
      phone: profileDraft.phone.trim(),
    };

    writeUserProfile(nextProfile);
    setProfile(nextProfile);
    setProfileDraft(nextProfile);
    setIsProfileModalOpen(false);
    setCheckoutMessage("Profile saved. You can continue checkout.");
  };

  const continueCheckout = () => {
    const savedProfile = readUserProfile();

    if (!savedProfile) {
      setProfileDraft(profile ?? EMPTY_USER_PROFILE);
      setProfileError("");
      setIsProfileModalOpen(true);
      return;
    }

    setProfile(savedProfile);
    setCheckoutMessage("Profile found. You can continue checkout.");
  };

  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <section className="mx-auto flex w-full flex-col gap-6 px-4 py-8">
        <div className="flex items-center justify-between gap-3 border-b border-ui-primary/30 pb-4">
          <div>
            <div className="text-3xl font-bold">Cart</div>
            <div className="text-sm text-text-secondary">{totalItems} item(s) in cart</div>
            {items.length > 0 && (
              <div className="mt-1 text-base font-bold text-ui-primary">
                Total: {formatPrice(cartTotal)}
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <CustomButton
                border="base"
                size="sm"
                icon={<IoCardOutline />}
                onClick={continueCheckout}
              >
                Continue checkout
              </CustomButton>
              <CustomButton variant="danger" border="base" size="sm" onClick={clearCart}>
                Clear cart
              </CustomButton>
            </div>
          )}
        </div>

        {checkoutMessage ? (
          <div className="rounded-md border border-ui-primary/30 bg-bg-surface px-4 py-2 text-sm font-semibold text-ui-primary">
            {checkoutMessage}
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="rounded-lg border border-ui-primary/30 bg-bg-surface p-6 text-sm text-text-secondary">
            Your cart is empty.
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item, index) => (
              <article
                key={String(item.id ?? `${item.title}-${index}`)}
                className="grid gap-4 rounded-lg border border-ui-primary/30 bg-bg-surface p-4 sm:grid-cols-[120px_1fr_auto]"
              >
                <button
                  type="button"
                  className="flex h-28 items-center justify-center overflow-hidden rounded-md bg-ui-primary/10"
                  onClick={() => openImagePreview(item.imageUrl)}
                  disabled={!item.imageUrl}
                  aria-label="Open product image"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <IoBagHandleOutline className="text-4xl text-ui-primary" aria-hidden="true" />
                  )}
                </button>
                <div className="grid gap-2">
                  <div className="text-lg font-bold">{item.title}</div>
                  <div className="text-sm text-text-secondary">{item.description}</div>
                  <div className="text-sm font-semibold text-ui-primary">
                    {item.originalPrice && getDiscountPercent(item) > 0 && (
                      <span className="mr-2 text-text-secondary line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                    {formatPrice(getFinalPrice(item))} x {item.quantity}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CustomButton
                      variant="neutral"
                      border="base"
                      size="sm"
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                    >
                      -
                    </CustomButton>
                    <span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <CustomButton
                      variant="neutral"
                      border="base"
                      size="sm"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                    >
                      +
                    </CustomButton>
                  </div>
                  <CustomButton
                    variant="danger"
                    border="base"
                    size="sm"
                    icon={<IoTrashOutline />}
                    onClick={() => removeItem(item)}
                  >
                    Remove
                  </CustomButton>
                </div>
              </article>
            ))}
          </div>
        )}

        <CustomModal
          open={Boolean(previewImage)}
          onClose={() => setPreviewImage("")}
          title="Product image"
          closeText="Close"
          rounded="lg"
          border="base"
          shadow="lg"
        >
          <div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-md bg-bg-base">
            {previewImage && (
              <img
                src={previewImage}
                alt="Product image preview"
                className="max-h-[75vh] w-full object-contain"
              />
            )}
          </div>
        </CustomModal>

        <CustomModal
          open={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Checkout profile"
          closeText="Close"
          rounded="lg"
          border="base"
          shadow="lg"
        >
          <div className="flex flex-col gap-3">
            <div className="text-sm text-text-secondary">
              Please register your required profile information before checkout.
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold text-text-primary">First name</div>
              <CustomInput
                value={profileDraft.firstName}
                placeholder="نام"
                required
                aria-label="First name"
                onChange={(event) => updateProfileDraft({ firstName: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold text-text-primary">Last name</div>
              <CustomInput
                value={profileDraft.lastName}
                placeholder="نام خانوادگی"
                required
                aria-label="Last name"
                onChange={(event) => updateProfileDraft({ lastName: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold text-text-primary">National ID</div>
              <CustomInput
                value={profileDraft.nationalId}
                placeholder="کد ملی"
                required
                inputMode="numeric"
                aria-label="National ID"
                onChange={(event) => updateProfileDraft({ nationalId: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold text-text-primary">Phone</div>
              <CustomInput
                value={profileDraft.phone}
                placeholder="شماره تماس"
                required
                inputMode="tel"
                aria-label="Phone"
                onChange={(event) => updateProfileDraft({ phone: event.target.value })}
              />
            </div>
            {profileError ? (
              <div className="rounded-md border border-red-admin-500/30 bg-bg-base px-3 py-2 text-sm font-semibold text-red-admin-500">
                {profileError}
              </div>
            ) : null}
            <CustomButton border="base" fullWidth icon={<IoCardOutline />} onClick={saveProfileDraft}>
              Save and continue
            </CustomButton>
          </div>
        </CustomModal>
      </section>
    </main>
  );
}
