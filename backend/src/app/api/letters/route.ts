/**
 * Letter to future you — encrypted self-compassion intervention.
 * User writes now, it's revealed on a future date.
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
    content: z.string().trim().min(5).max(8000),
    deliverInDays: z.number().int().min(1).max(365),
});

export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);
    try {
        const rows = await prisma.futureLetter.findMany({
            where: { userId: payload.userId },
            orderBy: { deliverAt: 'asc' },
            take: 60,
        });
        const now = Date.now();
        const letters = rows.map((l) => {
            const canSee = l.delivered || l.deliverAt.getTime() <= now;
            return {
                id: l.id,
                // Seal content until delivery date.
                content: canSee ? decryptForUser(payload.userId, l.cipherText, l.content) : '',
                deliverAt: l.deliverAt.toISOString(),
                delivered: canSee,
                createdAt: l.createdAt.toISOString(),
            };
        });
        return jsonOk({ letters });
    } catch (e) {
        log.error({ err: String(e) }, 'letters.list.failed');
        return jsonError(500, 'Could not load letters');
    }
}

export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);
    const rl = await rateLimit({ key: `letters.create:${payload.userId}`, limit: 6, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, CreateSchema);
    if (!parsed.ok) return parsed.response;

    const { cipherText, plaintextFallback } = encryptForUser(payload.userId, parsed.data.content);
    const deliverAt = new Date();
    deliverAt.setUTCDate(deliverAt.getUTCDate() + parsed.data.deliverInDays);

    try {
        const letter = await prisma.futureLetter.create({
            data: {
                userId: payload.userId,
                content: plaintextFallback ?? '[sealed]',
                cipherText: cipherText ?? null,
                deliverAt,
            },
        });
        await audit({
            req,
            userId: payload.userId,
            action: 'letter.create',
            resource: `letter:${letter.id}`,
            meta: { deliverInDays: parsed.data.deliverInDays },
        });
        return jsonOk(
            {
                letter: {
                    id: letter.id,
                    content: '',
                    deliverAt: letter.deliverAt.toISOString(),
                    delivered: false,
                    createdAt: letter.createdAt.toISOString(),
                },
            },
            { status: 201 },
        );
    } catch (e) {
        log.error({ err: String(e) }, 'letters.create.failed');
        return jsonError(500, 'Could not seal letter');
    }
}
