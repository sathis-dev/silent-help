import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { jsonOk, jsonError, parseJson, z } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';

const BodySchema = z.object({
    mood: z.string().trim().min(1).max(40),
    intensity: z.coerce.number().int().min(1).max(10).default(5),
    note: z.string().trim().max(500).optional().nullable(),
});

/** POST /api/mood — log mood entry */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `mood:${payload.userId}`, limit: 30, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, BodySchema);
    if (!parsed.ok) return parsed.response;

    try {
        const moodLog = await prisma.moodLog.create({
            data: {
                userId: payload.userId,
                mood: parsed.data.mood,
                intensity: parsed.data.intensity,
                note: parsed.data.note ?? null,
            },
        });
        await audit({
            req,
            userId: payload.userId,
            action: 'mood.log',
            resource: `mood:${moodLog.id}`,
            meta: { mood: moodLog.mood, intensity: moodLog.intensity },
        });
        return jsonOk({ moodLog }, { status: 201 });
    } catch (e) {
        log.error({ err: String(e) }, 'mood.log.failed');
        return jsonError(500, 'Could not log mood');
    }
}

/** GET /api/mood — last 30 mood entries */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);
    try {
        const logs = await prisma.moodLog.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        return jsonOk({ logs });
    } catch (e) {
        log.error({ err: String(e) }, 'mood.list.failed');
        return jsonError(500, 'Could not load mood history');
    }
}
