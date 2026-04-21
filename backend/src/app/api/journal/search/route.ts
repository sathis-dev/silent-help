import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { searchJournalSemantic } from '@/services/journalService';
import { JournalSearchQuerySchema } from '@/contracts/schemas';
import { jsonOk, jsonError, parseQuery } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';

/** GET /api/journal/search?q=...&limit=... — semantic search over user's journal */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `search:${payload.userId}`, limit: 30, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = parseQuery(req, JournalSearchQuerySchema);
    if (!parsed.ok) return parsed.response;

    try {
        const results = await searchJournalSemantic(payload.userId, parsed.data.q, parsed.data.limit);
        return jsonOk({ results, query: parsed.data.q });
    } catch (e) {
        log.error({ err: String(e) }, 'journal.search.failed');
        return jsonError(500, 'Could not search entries');
    }
}
