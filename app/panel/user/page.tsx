"use client";

import { UserProfilePanel } from "./user-profile-panel";
import { UserThemePanel } from "./user-theme-panel";

export default function UserPanelPage() {
  return (
    <main className="min-h-screen bg-bg-base p-6 text-primary-text">
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
