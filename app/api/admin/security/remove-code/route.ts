import { z } from "zod";
import { apiFail, apiOk, apiServerError } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody } from "@/lib/api/validation";
import { removeAdminSecurityCode, toAdminSecurityData } from "@/lib/api/admin-security-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const removeCodeSchema = z.object({
  currentCode: z.string().trim().optional().default(""),
});

export async function POST(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const parsed = await parseJsonBody(request, removeCodeSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const security = await removeAdminSecurityCode(parsed.data.currentCode);
    return apiOk(toAdminSecurityData(security));
  } catch (error) {
    if (error instanceof Error && error.message === "invalid-current-admin-code") {
      return apiFail("current admin code is not correct", 401);
    }

    console.error("Admin security remove code error:", error);
    return apiServerError();
  }
}
