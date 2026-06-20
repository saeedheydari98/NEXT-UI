import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isValidAdminCode(code: string) {
  return code.length >= 8 && /[a-z]/i.test(code) && /\d/.test(code);
}

function readCode(value: unknown) {
  return String(value ?? "").trim();
}

async function readSavedAdminCode() {
  const record = await prisma.adminSecurity.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return record?.code ?? "";
}

export async function GET() {
  try {
    const code = await readSavedAdminCode();
    return NextResponse.json({
      ok: true,
      data: {
        security: {
          hasCode: Boolean(code),
        },
      },
    });
  } catch (error) {
    console.error("Admin security GET error:", error);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = readCode(body.code);
  const confirmCode = readCode(body.confirmCode);

  if (code !== confirmCode) {
    return NextResponse.json({ ok: false, error: "admin code confirmation does not match" }, { status: 400 });
  }

  if (!isValidAdminCode(code)) {
    return NextResponse.json(
      { ok: false, error: "admin code must be at least 8 characters and include letters and numbers" },
      { status: 400 }
    );
  }

  try {
    const saved = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.adminSecurity.findFirst({
        orderBy: { updatedAt: "desc" },
      });
      const nextSecurity = existing
        ? await tx.adminSecurity.update({
            where: { id: existing.id },
            data: { code },
          })
        : await tx.adminSecurity.create({
            data: { code },
          });

      await tx.customerProfile.updateMany({
        data: { isAdminUnlocked: false },
      });

      return nextSecurity;
    });

    return NextResponse.json({
      ok: true,
      data: {
        security: {
          hasCode: Boolean(saved.code),
        },
      },
    });
  } catch (error) {
    console.error("Admin security POST error:", error);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
