import { apiOk, apiServerError } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";
import { readAdminSecurity, toAdminSecurityData } from "@/lib/api/admin-security-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;

  try {
    const security = await readAdminSecurity();
    return apiOk(toAdminSecurityData(security));
  } catch (error) {
    console.error("Admin security status error:", error);
    return apiServerError();
  }
}
