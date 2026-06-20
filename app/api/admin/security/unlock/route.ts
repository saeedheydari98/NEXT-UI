import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiFail, apiOk, apiServerError } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody } from "@/lib/api/validation";
import {
  readAdminSecurity,
  readFallbackAdminCode,
  toAdminSecurityData,
  upsertAdminSecurityLock,
} from "@/lib/api/admin-security-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const unlockSchema = z.object({
  code: z.string().trim().optional().default(""),
  profile: z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    nationalId: z.string().trim().min(1),
    phone: z.string().trim().min(1),
  }).optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const parsed = await parseJsonBody(request, unlockSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const security = await readAdminSecurity();
    const adminCode = security.code || readFallbackAdminCode();

    if (!parsed.data.code) {
      const unlocked = await upsertAdminSecurityLock(false);
      return apiOk({
        ...toAdminSecurityData(unlocked),
        access: { isAdminUnlocked: true },
      });
    }

    if (!security.isPanelLocked) {
      return apiOk({
        ...toAdminSecurityData(security),
        access: { isAdminUnlocked: true },
      });
    }

    if (!adminCode || parsed.data.code !== adminCode) {
      return apiFail("invalid admin code", 401);
    }

    if (!parsed.data.profile) {
      return apiFail("complete profile is required", 400);
    }

    const saved = await prisma.customerProfile.upsert({
      where: { nationalId: parsed.data.profile.nationalId },
      update: {
        firstName: parsed.data.profile.firstName,
        lastName: parsed.data.profile.lastName,
        phone: parsed.data.profile.phone,
        isAdminUnlocked: true,
      },
      create: {
        ...parsed.data.profile,
        isAdminUnlocked: true,
      },
    });

    return apiOk({
      ...toAdminSecurityData(security),
      user: { profile: saved },
    });
  } catch (error) {
    console.error("Admin security unlock error:", error);
    return apiServerError();
  }
}
