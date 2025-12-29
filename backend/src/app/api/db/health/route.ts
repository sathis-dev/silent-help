import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<{ ok: number }[]>(Prisma.sql`SELECT 1 AS ok`);
    const ok = rows[0]?.ok === 1;
    return NextResponse.json({ db: ok ? "up" : "unknown", time: new Date().toISOString() });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ db: "down", error: message }, { status: 500 });
  }
}
