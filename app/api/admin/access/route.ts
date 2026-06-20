import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeProfile(value: any) {
  return {
    firstName: String(value?.firstName ?? "").trim(),
    lastName: String(value?.lastName ?? "").trim(),
    nationalId: String(value?.nationalId ?? "").trim(),
    phone: String(value?.phone ?? "").trim(),
  };
}

function isProfileComplete(profile: ReturnType<typeof normalizeProfile>) {
  return Boolean(profile.firstName && profile.lastName && profile.nationalId && profile.phone);
}

function readAdminAccessCode() {
  return String(process.env.ADMIN_ACCESS_CODE ?? process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE ?? "12345").trim();
}

async function readSavedAdminAccessCode() {
  const record = await prisma.adminSecurity.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return record?.code ?? "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body.code ?? "").trim();
  const profile = normalizeProfile(body.profile ?? {});
  const adminCode = (await readSavedAdminAccessCode()) || readAdminAccessCode();

  if (!adminCode || code !== adminCode) {
    return NextResponse.json({ ok: false, error: "invalid admin code" }, { status: 401 });
  }

  if (!isProfileComplete(profile)) {
    return NextResponse.json({ ok: false, error: "complete profile is required" }, { status: 400 });
  }

  try {
    const saved = await prisma.customerProfile.upsert({
      where: { nationalId: profile.nationalId },
      update: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        isAdminUnlocked: true,
      },
      create: {
        ...profile,
        isAdminUnlocked: true,
      },
    });

    return NextResponse.json({ ok: true, data: { user: { profile: saved } } });
  } catch (error) {
    console.error("Admin access unlock error:", error);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
