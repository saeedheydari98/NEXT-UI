import {
  GET as getProfile,
  POST as saveProfile,
} from "@/app/api/profile/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: Request) {
  return getProfile(request);
}

export function PUT(request: Request) {
  return saveProfile(request);
}

export function PATCH(request: Request) {
  return saveProfile(request);
}
