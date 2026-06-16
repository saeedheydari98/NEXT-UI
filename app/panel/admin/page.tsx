"use client";

import { useEffect, useState } from "react";
import { AdminAccessPanel } from "@/app/panel/admin/admin-access-panel";
import { AdminThemePanel } from "@/app/panel/admin/admin-theme-panel";
import { AdminProductsPanel } from "@/app/panel/admin/admin-products-panel";
import { AdminSecurityPanel } from "@/app/panel/admin/admin-security-panel";
import {
  ADMIN_ACCESS_UPDATED_EVENT,
  isAdminAccessUnlocked,
} from "@/lib/admin-access";

export default function AdminPanelPage() {
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    const syncAccess = () => setHasAdminAccess(isAdminAccessUnlocked());

    syncAccess();
    window.addEventListener(ADMIN_ACCESS_UPDATED_EVENT, syncAccess);
    window.addEventListener("storage", syncAccess);

    return () => {
      window.removeEventListener(ADMIN_ACCESS_UPDATED_EVENT, syncAccess);
      window.removeEventListener("storage", syncAccess);
    };
  }, []);

  return (
    <main className="min-h-screen bg-bg-base p-6 text-primary-text">
      {hasAdminAccess ? (
        <div className="flex w-full flex-col gap-6">
          <section className="flex flex-col  gap-4">
            <div className="text-admin-admin-admin text-2xl font-bold">Admin Control</div>
            <div className="flex flex-col md:flex-row gap-2">
              <AdminThemePanel />
              <AdminSecurityPanel />
            </div>
          </section>
          <div className="h-0.5 bg-primary-border"></div>
          <AdminProductsPanel />
        </div>
      ) : (
        <div className="flex min-h-[50vh] items-center justify-center">
          <AdminAccessPanel onUnlock={() => setHasAdminAccess(true)} />
        </div>
      )}
    </main>
  );
}
