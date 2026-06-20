import { apiOk, apiServerError } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";
import { toAdminSecurityData, upsertAdminSecurityLock } from "@/lib/api/admin-security-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;

  try {
    const security = await upsertAdminSecurityLock(true);
    return apiOk(toAdminSecurityData(security));
  } catch (error) {
    console.error("Admin security lock error:", error);
    return apiServerError();
  }
}
