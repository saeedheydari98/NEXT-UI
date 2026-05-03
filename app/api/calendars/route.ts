import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { key: "gregorian", label: "میلادی" },
    { key: "persian", label: "شمسی" },
    { key: "arabic", label: "قمری" }
  ]);
}