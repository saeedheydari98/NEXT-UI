export type UserProfile = {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  isAdminUnlocked: boolean;
};

export const USER_PROFILE_STORAGE_KEY = "user-profile";
export const USER_PROFILE_UPDATED_EVENT = "user-profile-updated";

export const EMPTY_USER_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  nationalId: "",
  phone: "",
  isAdminUnlocked: false,
};

function readProfileFromApiData(data: any) {
  return data?.data?.user?.profile ?? data?.data?.profile ?? null;
}

function areProfilesEqual(first: UserProfile | null, second: UserProfile | null) {
  if (!first || !second) return first === second;

  return (
    first.firstName === second.firstName &&
    first.lastName === second.lastName &&
    first.nationalId === second.nationalId &&
    first.phone === second.phone &&
    first.isAdminUnlocked === second.isAdminUnlocked
  );
}

export function normalizeUserProfile(value: Partial<UserProfile> | null | undefined): UserProfile {
  return {
    firstName: String(value?.firstName ?? ""),
    lastName: String(value?.lastName ?? ""),
    nationalId: String(value?.nationalId ?? ""),
    phone: String(value?.phone ?? ""),
    isAdminUnlocked: value?.isAdminUnlocked === true,
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

export function writeUserProfile(profile: UserProfile, options?: { emit?: boolean }) {
  if (typeof window === "undefined") return;

  const nextProfile = normalizeUserProfile(profile);
  const currentProfile = readUserProfile();
  if (areProfilesEqual(currentProfile, nextProfile)) return;

  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
  if (options?.emit !== false) {
    window.dispatchEvent(new Event(USER_PROFILE_UPDATED_EVENT));
  }
}

export async function fetchUserProfile(nationalId?: string, options?: { write?: boolean; emit?: boolean }) {
  const id = String(nationalId ?? readUserProfile()?.nationalId ?? "").trim();
  if (!id) return null;

  const res = await fetch(`/api/user/profile?nationalId=${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || "Profile load failed");
  }

  const profileData = readProfileFromApiData(data);
  const profile = profileData
    ? normalizeUserProfile(profileData as Partial<UserProfile>)
    : null;
  if (profile && isUserProfileComplete(profile)) {
    if (options?.write !== false) {
      writeUserProfile(profile, { emit: options?.emit });
    }
    return profile;
  }

  return null;
}

export async function saveUserProfile(profile: UserProfile) {
  const nextProfile = normalizeUserProfile(profile);
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: nextProfile }),
  });
  const data = await res.json();
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || "Profile save failed");
  }

  const savedProfile = normalizeUserProfile(readProfileFromApiData(data) ?? nextProfile);
  writeUserProfile(savedProfile);
  return savedProfile;
}
