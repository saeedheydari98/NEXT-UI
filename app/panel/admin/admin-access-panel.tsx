"use client";

import { useState } from "react";
import { IoLockOpenOutline } from "react-icons/io5";
import { CustomButton } from "@/app/design-system/components/ui/button";
import { CustomInput } from "@/app/design-system/components/ui/input";
import { unlockAdminAccess } from "@/lib/admin-access";

type AdminAccessPanelProps = {
  onUnlock: () => void;
};

export function AdminAccessPanel({ onUnlock }: AdminAccessPanelProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");

  const submitCode = () => {
    if (unlockAdminAccess(code)) {
      setStatus("");
      onUnlock();
      return;
    }

    setStatus("Security code was not accepted.");
  };

  return (
    <section className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-primary-border bg-primary-card p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <div className="text-xl font-bold text-primary-text">Admin access</div>
        <div className="text-sm text-secondary-text">
          Enter the security code to open the admin panel.
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-primary-text">Security code</div>
        <CustomInput
          value={code}
          type="password"
          placeholder="Enter admin code"
          aria-label="Admin access code"
          onChange={(event) => {
            setCode(event.target.value);
            setStatus("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submitCode();
            }
          }}
        />
      </div>

      {status ? (
        <div className="rounded-md border border-danger-border bg-primary-soft px-3 py-2 text-sm font-semibold text-danger-text">
          {status}
        </div>
      ) : null}

      <CustomButton border="base" fullWidth icon={<IoLockOpenOutline />} onClick={submitCode}>
        Open admin panel
      </CustomButton>
    </section>
  );
}
