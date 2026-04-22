import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { createMemory, listMemories } from '@/services/memoryService';
import { MemoryCreateSchema } from '@/contracts/schemas';
import { jsonOk, jsonError, parseJson } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';

/** GET /api/memory — list user's saved memories */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);
    try {
        const memories = await listMemories(payload.userId);
        return jsonOk({ memories });
    } catch (e) {
        log.error({ err: String(e) }, 'memory.list.failed');
        return jsonError(500, 'Could not load memories');
    }
}

/** POST /api/memory — save a user-blessed memory */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `memory:${payload.userId}`, limit: 20, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, MemoryCreateSchema);
    if (!parsed.ok) return parsed.response;

    try {
        const memory = await createMemory({
            userId: payload.userId,
            content: parsed.data.content,
            kind: parsed.data.kind,
            source: 'user',
        });
        await audit({
            req,
            userId: payload.userId,
            action: 'memory.create',
            resource: `memory:${memory.id}`,
            meta: { kind: memory.kind, chars: memory.content.length },
        });
        return jsonOk({ memory }, { status: 201 });
    } catch (e) {
        log.error({ err: String(e) }, 'memory.create.failed');
        return jsonError(500, 'Could not save memory');
    }
}
