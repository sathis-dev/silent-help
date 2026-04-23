import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { jsonOk, jsonError, parseJson, z } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { RETENTION_POLICIES, logConsent, type RetentionPolicy } from '@/lib/consent';

const BodySchema = z.object({
    retention: z.enum(RETENTION_POLICIES as [RetentionPolicy, ...RetentionPolicy[]]),
});

/**
 * POST /api/me/retention — change the user's retention choice.
 * UK GDPR requires a defined retention period; `forever` is allowed but only as
 * an *explicit* opt-in which the user can change here at any time.
 */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `retention:${payload.userId}`, limit: 10, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, BodySchema);
    if (!parsed.ok) return parsed.response;

    try {
        await prisma.user.update({
            where: { id: payload.userId },
            data: { retentionPolicy: parsed.data.retention },
        });
        await logConsent({
            userId: payload.userId,
            event: 'retention_change',
            retention: parsed.data.retention,
            req,
        });
        return jsonOk({ ok: true, retention: parsed.data.retention });
    } catch (e) {
        log.error({ err: String(e) }, 'retention.change.failed');
        return jsonError(500, 'Could not update retention');
    }
}
