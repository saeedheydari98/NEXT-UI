import {
  fetchUserProfile,
  isUserProfileComplete,
  normalizeUserProfile,
  readUserProfile,
  writeUserProfile,
  USER_PROFILE_UPDATED_EVENT,
} from "@/lib/user-profile";

export const ADMIN_ACCESS_UPDATED_EVENT = "admin-access-updated";

function emitAdminAccessUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_ACCESS_UPDATED_EVENT));
}

export function isAdminAccessUnlocked(profile = readUserProfile()) {
  return profile?.isAdminUnlocked === true;
}

export async function fetchAdminAccess() {
  const profile = await fetchUserProfile();
  return isAdminAccessUnlocked(profile);
}

export async function unlockAdminAccessWithCode(code: string, profile = readUserProfile()) {
  if (!profile || !isUserProfileComplete(profile)) {
    throw new Error("Complete profile is required before changing admin access.");
  }

  const res = await fetch("/api/admin/access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, profile }),
  });
  const data = await res.json();
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || "Admin code was not accepted.");
  }

  const savedProfile = normalizeUserProfile(data?.data?.user?.profile ?? data?.data?.profile ?? {
    ...profile,
    isAdminUnlocked: true,
  });
  writeUserProfile(savedProfile);
  emitAdminAccessUpdated();
  return savedProfile.isAdminUnlocked;
}

export async function fetchAdminSecurity() {
  const res = await fetch("/api/admin/security", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || "Admin security load failed");
  }

  return {
    hasCode: data?.data?.security?.hasCode === true,
  };
}

export async function saveAdminAccessCode(code: string, confirmCode: string) {
  const res = await fetch("/api/admin/security", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, confirmCode }),
  });
  const data = await res.json();
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || "Admin security save failed");
  }

  const profile = readUserProfile();
  if (profile) {
    writeUserProfile({
      ...profile,
      isAdminUnlocked: false,
    });
  }
  emitAdminAccessUpdated();

  return {
    hasCode: data?.data?.security?.hasCode === true,
  };
}

export function subscribeAdminAccess(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener(ADMIN_ACCESS_UPDATED_EVENT, listener);
  window.addEventListener(USER_PROFILE_UPDATED_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(ADMIN_ACCESS_UPDATED_EVENT, listener);
    window.removeEventListener(USER_PROFILE_UPDATED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
