import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminSecurityRecord = {
  id: number;
  code: string;
  isPanelLocked: boolean;
};

export function isValidAdminCode(code: string) {
  return code.length >= 8 && /[a-z]/i.test(code) && /\d/.test(code);
}

export function readFallbackAdminCode() {
  return String(process.env.ADMIN_ACCESS_CODE ?? process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE ?? "12345").trim();
}

export function toAdminSecurityData(security: Pick<AdminSecurityRecord, "code" | "isPanelLocked">) {
  return {
    security: {
      hasCode: Boolean(security.code),
      isPanelLocked: security.isPanelLocked === true,
    },
  };
}

export async function readAdminSecurity(tx: Prisma.TransactionClient | typeof prisma = prisma) {
  const records = await tx.$queryRaw<AdminSecurityRecord[]>`
    SELECT id, code, "isPanelLocked"
    FROM "AdminSecurity"
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `;
  const record = records[0] ?? null;

  return {
    id: record?.id ?? null,
    code: record?.code ?? "",
    isPanelLocked: record?.isPanelLocked === true,
  };
}

export async function upsertAdminSecurityLock(isPanelLocked: boolean) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await readAdminSecurity(tx);

    const records = existing.id
      ? await tx.$queryRaw<AdminSecurityRecord[]>`
          UPDATE "AdminSecurity"
          SET "isPanelLocked" = ${isPanelLocked}, "updatedAt" = NOW()
          WHERE id = ${existing.id}
          RETURNING id, code, "isPanelLocked"
        `
      : await tx.$queryRaw<AdminSecurityRecord[]>`
          INSERT INTO "AdminSecurity" (code, "isPanelLocked", "createdAt", "updatedAt")
          VALUES ('', ${isPanelLocked}, NOW(), NOW())
          RETURNING id, code, "isPanelLocked"
        `;

    return records[0];
  });
}

export async function setAdminSecurityCode(code: string) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await readAdminSecurity(tx);
    const records = existing.id
      ? await tx.$queryRaw<AdminSecurityRecord[]>`
          UPDATE "AdminSecurity"
          SET code = ${code}, "updatedAt" = NOW()
          WHERE id = ${existing.id}
          RETURNING id, code, "isPanelLocked"
        `
      : await tx.$queryRaw<AdminSecurityRecord[]>`
          INSERT INTO "AdminSecurity" (code, "isPanelLocked", "createdAt", "updatedAt")
          VALUES (${code}, false, NOW(), NOW())
          RETURNING id, code, "isPanelLocked"
        `;

    await tx.customerProfile.updateMany({
      data: { isAdminUnlocked: false },
    });

    return records[0];
  });
}

export async function changeAdminSecurityCode(currentCode: string, code: string) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await readAdminSecurity(tx);
    if (!existing.code || currentCode !== existing.code) {
      throw new Error("invalid-current-admin-code");
    }

    const records = await tx.$queryRaw<AdminSecurityRecord[]>`
      UPDATE "AdminSecurity"
      SET code = ${code}, "updatedAt" = NOW()
      WHERE id = ${existing.id}
      RETURNING id, code, "isPanelLocked"
    `;

    await tx.customerProfile.updateMany({
      data: { isAdminUnlocked: false },
    });

    return records[0];
  });
}

export async function removeAdminSecurityCode(currentCode: string) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await readAdminSecurity(tx);
    if (existing.code && currentCode !== existing.code) {
      throw new Error("invalid-current-admin-code");
    }

    const records = existing.id
      ? await tx.$queryRaw<AdminSecurityRecord[]>`
          UPDATE "AdminSecurity"
          SET code = '', "updatedAt" = NOW()
          WHERE id = ${existing.id}
          RETURNING id, code, "isPanelLocked"
        `
      : await tx.$queryRaw<AdminSecurityRecord[]>`
          INSERT INTO "AdminSecurity" (code, "isPanelLocked", "createdAt", "updatedAt")
          VALUES ('', false, NOW(), NOW())
          RETURNING id, code, "isPanelLocked"
        `;

    await tx.customerProfile.updateMany({
      data: { isAdminUnlocked: false },
    });

    return records[0];
  });
}
