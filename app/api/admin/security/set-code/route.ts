import { z } from "zod";
import { apiFail, apiOk, apiServerError } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody } from "@/lib/api/validation";
import { isValidAdminCode, setAdminSecurityCode, toAdminSecurityData } from "@/lib/api/admin-security-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const codeSchema = z.object({
  code: z.string().trim().min(1),
  confirmCode: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const parsed = await parseJsonBody(request, codeSchema);
  if (!parsed.ok) return parsed.response;

  if (parsed.data.code !== parsed.data.confirmCode) {
    return apiFail("admin code confirmation does not match", 400);
  }

  if (!isValidAdminCode(parsed.data.code)) {
    return apiFail("admin code must be at least 8 characters and include letters and numbers", 422);
  }

  try {
    const security = await setAdminSecurityCode(parsed.data.code);
    return apiOk(toAdminSecurityData(security), { status: 201 });
  } catch (error) {
    console.error("Admin security set code error:", error);
    return apiServerError();
  }
}
