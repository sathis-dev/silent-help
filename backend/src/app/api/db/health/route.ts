import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = (await prisma.$queryRawUnsafe("SELECT 1 AS ok")) as { ok: number }[];
    const ok = rows[0]?.ok === 1;
    return NextResponse.json({ db: ok ? "up" : "unknown", time: new Date().toISOString() });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ db: "down", error: message }, { status: 500 });
  }
}
