import {
  GET as getUserTheme,
  POST as saveUserTheme,
} from "@/app/api/theme/user/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: Request) {
  return getUserTheme(request);
}

export function PUT(request: Request) {
  return saveUserTheme(request);
}
