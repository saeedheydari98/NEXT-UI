// app/api/history/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.conversion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ error: "خطا در دریافت تاریخچه" }, { status: 500 });
  }
}