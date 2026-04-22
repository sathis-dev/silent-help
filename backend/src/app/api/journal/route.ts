import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { listJournal, createJournal } from '@/services/journalService';
import { jsonOk, jsonError, parseJson, z } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';

const CreateSchema = z.object({
    content: z.string().trim().min(1).max(8000),
    mood: z.string().trim().max(50).optional().nullable(),
});

/** GET /api/journal — List journal entries (decrypted for owner) */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);
    try {
        const entries = await listJournal(payload.userId, 50);
        return jsonOk({ entries });
    } catch (e) {
        log.error({ err: String(e) }, 'journal.list.failed');
        return jsonError(500, 'Could not load entries');
    }
}

/** POST /api/journal — Create (encrypted + embedded) entry */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `journal.create:${payload.userId}`, limit: 20, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, CreateSchema);
    if (!parsed.ok) return parsed.response;

    try {
        const entry = await createJournal({
            userId: payload.userId,
            content: parsed.data.content,
            mood: parsed.data.mood ?? null,
        });
        await audit({
            req,
            userId: payload.userId,
            action: 'journal.create',
            resource: `journal:${entry.id}`,
            meta: { mood: entry.mood, chars: parsed.data.content.length },
        });
        return jsonOk({ entry }, { status: 201 });
    } catch (e) {
        log.error({ err: String(e) }, 'journal.create.failed');
        return jsonError(500, 'Could not save entry');
    }
}
