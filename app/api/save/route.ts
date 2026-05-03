// app/api/save/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const saved = await prisma.conversion.create({
      data: {
        date: body.date,
        fromType: body.fromType,
        toType: body.toType,
        result: body.result,
      },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ error: "خطا در ذخیره" }, { status: 500 });
  }
}