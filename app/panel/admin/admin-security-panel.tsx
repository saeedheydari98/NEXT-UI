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
    <section className="flex flex-col gap-4 rounded-xl border border-ui-primary/30 bg-ui-primary/10 p-4">
      <div className="flex flex-col gap-1">
        <div className="text-base font-bold text-text-primary">Admin security code</div>
        <div className="text-sm text-text-secondary">
          Set the code that unlocks admin access from the user panel.
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-text-primary">Security code</div>
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
        <div className="rounded-md border border-ui-primary/30 bg-bg-base px-3 py-2 text-sm font-semibold text-text-primary">
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
