/**
 * Gratitude mode — encrypted short entries with a simple per-UTC-day streak counter.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { encryptForUser, decryptForUser } from '@/lib/encryption';
import { jsonOk, jsonError, parseJson, z } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';

const CreateSchema = z.object({
    content: z.string().trim().min(2).max(2000),
});

function dayKeyFor(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function streakFromDays(dayKeys: string[]): number {
    if (dayKeys.length === 0) return 0;
    const set = new Set(dayKeys);
    let streak = 0;
    const cursor = new Date();
    // Walk back day-by-day. Consider today OR yesterday as the anchor so late-night logging doesn't reset.
    const todayKey = dayKeyFor(cursor);
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const yestKey = dayKeyFor(cursor);
    if (!set.has(todayKey) && !set.has(yestKey)) return 0;
    const start = new Date();
    if (!set.has(todayKey)) {
        start.setUTCDate(start.getUTCDate() - 1);
    }
    const c = new Date(start);
    while (set.has(dayKeyFor(c))) {
        streak++;
        c.setUTCDate(c.getUTCDate() - 1);
    }
    return streak;
}

export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);
    try {
        const entries = await prisma.gratitudeEntry.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
            take: 60,
        });
        const decoded = entries.map((e) => ({
            id: e.id,
            content: decryptForUser(payload.userId, e.cipherText, e.content),
            createdAt: e.createdAt.toISOString(),
        }));
        // streak over last 90 days
        const earliest = new Date();
        earliest.setUTCDate(earliest.getUTCDate() - 90);
        const daysRows = await prisma.gratitudeEntry.findMany({
            where: { userId: payload.userId, createdAt: { gte: earliest } },
            select: { dayKey: true },
        });
        const streak = streakFromDays(daysRows.map((r) => r.dayKey));
        return jsonOk({ entries: decoded, streak });
    } catch (e) {
        log.error({ err: String(e) }, 'gratitude.list.failed');
        return jsonError(500, 'Could not load gratitude');
    }
}

export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);
    const rl = await rateLimit({ key: `gratitude.create:${payload.userId}`, limit: 15, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, CreateSchema);
    if (!parsed.ok) return parsed.response;

    const { cipherText, plaintextFallback } = encryptForUser(payload.userId, parsed.data.content);
    try {
        const now = new Date();
        const entry = await prisma.gratitudeEntry.create({
            data: {
                userId: payload.userId,
                content: plaintextFallback ?? '[encrypted]',
                cipherText: cipherText ?? null,
                dayKey: dayKeyFor(now),
            },
        });
        await audit({
            req,
            userId: payload.userId,
            action: 'gratitude.create',
            resource: `gratitude:${entry.id}`,
        });
        const earliest = new Date();
        earliest.setUTCDate(earliest.getUTCDate() - 90);
        const daysRows = await prisma.gratitudeEntry.findMany({
            where: { userId: payload.userId, createdAt: { gte: earliest } },
            select: { dayKey: true },
        });
        const streak = streakFromDays(daysRows.map((r) => r.dayKey));
        return jsonOk(
            {
                entry: {
                    id: entry.id,
                    content: parsed.data.content,
                    createdAt: entry.createdAt.toISOString(),
                },
                streak,
            },
            { status: 201 },
        );
    } catch (e) {
        log.error({ err: String(e) }, 'gratitude.create.failed');
        return jsonError(500, 'Could not save');
    }
}
