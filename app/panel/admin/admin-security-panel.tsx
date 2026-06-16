"use client";

import { useEffect, useState } from "react";
import { IoLockClosedOutline, IoSaveOutline } from "react-icons/io5";
import { CustomButton } from "@/app/design-system/components/ui/button";
import { CustomInput } from "@/app/design-system/components/ui/input";
import {
  lockAdminAccess,
  readAdminSecurityCode,
  writeAdminSecurityCode,
} from "@/lib/admin-access";

export function AdminSecurityPanel() {
  const [securityCode, setSecurityCode] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setSecurityCode(readAdminSecurityCode());
  }, []);

  const saveSecurityCode = () => {
    writeAdminSecurityCode(securityCode);
    setStatus(securityCode.trim() ? "Security code saved." : "Security code cleared.");
  };

  const lockPanel = () => {
    lockAdminAccess();
    setStatus("Admin panel locked.");
  };

  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-primary-border bg-primary-bg p-4 text-primary-text"
    >
      <div className="flex flex-col gap-1">
        <div className="text-base font-bold text-primary-text">Admin security code</div>
        <div className="text-sm text-primary-text">
          Set the code that unlocks admin access from the user panel.
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-primary-text">Security code</div>
        <CustomInput
          value={securityCode}
          placeholder="Enter admin code"
          type="password"
          aria-label="Admin security code"
          onChange={(event) => {
            setSecurityCode(event.target.value);
            setStatus("");
          }}
        />
      </div>

      {status ? (
        <div
          className="rounded-md border border-primary-border bg-primary-bg px-3 py-2 text-sm font-semibold text-primary-text"
        >
          {status}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <CustomButton border="base" icon={<IoSaveOutline />} onClick={saveSecurityCode}>
          Save code
        </CustomButton>
        <CustomButton variant="neutral" border="base" icon={<IoLockClosedOutline />} onClick={lockPanel}>
          Lock admin
        </CustomButton>
      </div>
    </section>
  );
}
