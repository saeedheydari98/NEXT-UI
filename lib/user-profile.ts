export type UserProfile = {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
};

export const USER_PROFILE_STORAGE_KEY = "user-profile";
export const USER_PROFILE_UPDATED_EVENT = "user-profile-updated";

export const EMPTY_USER_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  nationalId: "",
  phone: "",
};

export function normalizeUserProfile(value: Partial<UserProfile> | null | undefined): UserProfile {
  return {
    firstName: String(value?.firstName ?? ""),
    lastName: String(value?.lastName ?? ""),
    nationalId: String(value?.nationalId ?? ""),
    phone: String(value?.phone ?? ""),
  };
}

export function isUserProfileComplete(profile: Partial<UserProfile> | null | undefined) {
  const normalized = normalizeUserProfile(profile);

  return Boolean(
    normalized.firstName.trim() &&
      normalized.lastName.trim() &&
      normalized.nationalId.trim() &&
      normalized.phone.trim()
  );
}

export function readUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const parsed = JSON.parse(localStorage.getItem(USER_PROFILE_STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return null;
    const profile = normalizeUserProfile(parsed as Partial<UserProfile>);
    return isUserProfileComplete(profile) ? profile : null;
  } catch {
    return null;
  }
}

export function writeUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;

  const nextProfile = normalizeUserProfile(profile);
  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
  window.dispatchEvent(new Event(USER_PROFILE_UPDATED_EVENT));
}
