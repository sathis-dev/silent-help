import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { suggestNext } from '@/services/coachService';
import { CoachSuggestInputSchema } from '@/contracts/schemas';
import { jsonOk, jsonError, parseJson } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';

/** POST /api/coach/suggest — adaptive next-action suggestion */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `coach:${payload.userId}`, limit: 15, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    // Body is optional; accept empty payloads
    let feeling: string | undefined;
    if (req.headers.get('content-length') && req.headers.get('content-length') !== '0') {
        const parsed = await parseJson(req, CoachSuggestInputSchema);
        if (!parsed.ok) return parsed.response;
        feeling = parsed.data.feeling;
    }

    try {
        const suggestion = await suggestNext({ userId: payload.userId, feeling });
        return jsonOk({ suggestion });
    } catch (e) {
        log.error({ err: String(e) }, 'coach.suggest.failed');
        return jsonError(500, 'Could not generate suggestion');
    }
}
