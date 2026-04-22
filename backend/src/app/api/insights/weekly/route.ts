import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { getOrGenerateWeeklyDigest } from '@/services/digestService';
import { jsonOk, jsonError } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';

/** GET /api/insights/weekly — AI-generated weekly reflection (cached per ISO week) */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const force = req.nextUrl.searchParams.get('refresh') === 'true';
    const rl = await rateLimit({
        key: `digest:${payload.userId}`,
        limit: force ? 3 : 30,
        windowMs: 60_000,
    });
    if (!rl.ok) return rateLimitResponse(rl);

    try {
        const digest = await getOrGenerateWeeklyDigest(payload.userId, force);
        return jsonOk({ digest });
    } catch (e) {
        log.error({ err: String(e) }, 'insights.weekly.failed');
        return jsonError(500, 'Could not generate digest');
    }
}
