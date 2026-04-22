import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';
import { jsonOk, jsonError } from '@/lib/http';

/**
 * DELETE /api/me — GDPR Art 17 right to erasure.
 *
 * This performs a **hard delete**: the user row is removed, and every related
 * row (conversations, messages, journal entries, moods, memories, safety plan,
 * reminders, digests, gratitude, letters, clinical results, affirmations,
 * consent logs, audit logs, wellness profile, user state) cascades away via
 * the `onDelete: Cascade` FK rules defined in the Prisma schema.
 *
 * We first write an audit trail (on a separate table not cascaded) so the ICO
 * can see the erasure request was honoured, then delete.
 */
export async function DELETE(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `me.delete:${payload.userId}`, limit: 3, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    try {
        // Audit first — the audit_logs FK is SetNull on user delete so the row
        // survives the cascade for ICO accountability.
        await audit({ req, userId: payload.userId, action: 'me.erasure_performed' });
        await prisma.user.delete({ where: { id: payload.userId } });
        return jsonOk({
            ok: true,
            erasedAt: new Date().toISOString(),
            note: 'Your account and all associated data have been permanently erased.',
        });
    } catch (e) {
        log.error({ err: String(e) }, 'me.delete.failed');
        return jsonError(500, 'Could not process erasure request');
    }
}

/** GET /api/me — current authenticated user summary */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, name: true, createdAt: true, deletedAt: true },
        });
        if (!user) return jsonError(404, 'User not found');
        return jsonOk({ user });
    } catch {
        return jsonError(500, 'Could not load account');
    }
}
