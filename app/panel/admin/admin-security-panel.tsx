"use client";

import { useEffect, useState } from "react";
import { CustomButton } from "@/app/design-system/components/ui/button";
import { CustomInput } from "@/app/design-system/components/ui/input";
import {
  fetchAdminSecurity,
  saveAdminAccessCode,
} from "@/lib/admin-access";

export function AdminSecurityPanel() {
  const [hasAdminCode, setHasAdminCode] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [confirmAdminCode, setConfirmAdminCode] = useState("");
  const [savingCode, setSavingCode] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    void fetchAdminSecurity()
      .then((security) => setHasAdminCode(security.hasCode))
      .catch((error) => {
        console.error("Admin security load error:", error);
      });
  }, []);

  const saveSecurityCode = async () => {
    setSavingCode(true);
    setStatus("");

    try {
      const saved = await saveAdminAccessCode(adminCode, confirmAdminCode);
      setHasAdminCode(saved.hasCode);
      setAdminCode("");
      setConfirmAdminCode("");
      setStatus("Admin security code saved. Admin access is locked until the code is entered again.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Admin security code save failed.");
    } finally {
      setSavingCode(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-primary-border bg-primary-bg p-4 text-primary-text">
      <div className="flex flex-col gap-1">
        <div className="text-base font-bold text-primary-text">Admin panel lock</div>
        <div className="text-sm text-primary-text">
          Set the code that unlocks admin access for each profile.
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-primary-border bg-primary-card p-3">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-bold text-primary-text">Admin security code</div>
          <span className="text-xs text-secondary-text">
            {hasAdminCode ? "Custom code is active." : "Set a custom code for admin access."}
          </span>
        </div>
        <CustomInput
          value={adminCode}
          type="password"
          placeholder="New code"
          aria-label="New admin security code"
          onChange={(event) => {
            setAdminCode(event.target.value);
            setStatus("");
          }}
        />
        <CustomInput
          value={confirmAdminCode}
          type="password"
          placeholder="Confirm new code"
          aria-label="Confirm new admin security code"
          onChange={(event) => {
            setConfirmAdminCode(event.target.value);
            setStatus("");
          }}
        />
        <CustomButton
          border="base"
          fullWidth
          isLoading={savingCode}
          loading="dots"
          loadingText="Saving..."
          onClick={saveSecurityCode}
        >
          Save security code
        </CustomButton>
      </div>

      {status ? (
        <div className="rounded-md border border-primary-border bg-primary-bg px-3 py-2 text-sm font-semibold text-primary-text">
          {status}
        </div>
      ) : null}
    </section>
  );
}
