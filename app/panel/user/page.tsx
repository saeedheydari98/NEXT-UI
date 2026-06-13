"use client";

import { useTheme } from "@/app/design-system/theme/provider";
import { UserProfilePanel } from "./user-profile-panel";
import { UserThemePanel } from "./user-theme-panel";

export default function UserPanelPage() {
  const { theme } = useTheme();

  return (
    <main
      className="min-h-screen p-6"
      style={{
        backgroundColor: theme.tokens.colors.background.base,
        color: theme.tokens.colors.text.primary,
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="text-2xl text-user-user-user font-bold">User Control</div>
        <section className="flex flex-col md:flex-row  w-full gap-4">
          <UserThemePanel />
          <UserProfilePanel />
        </section>  
      </div>
    </main>
  );
}
