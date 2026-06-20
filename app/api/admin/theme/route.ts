import {
  GET as getAdminTheme,
  POST as saveAdminTheme,
} from "@/app/api/theme/admin/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return getAdminTheme();
}

export function PUT(request: Request) {
  return saveAdminTheme(request);
}
