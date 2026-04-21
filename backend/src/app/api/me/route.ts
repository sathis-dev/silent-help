import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';
import { jsonOk, jsonError } from '@/lib/http';

/**
 * DELETE /api/me — GDPR soft-delete.
 * Marks the user as deleted; their rows cascade-delete via FK when the
 * purge job runs 30 days later. Sets `deleted_at` now so reads can filter.
 */
export async function DELETE(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `me.delete:${payload.userId}`, limit: 3, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    try {
        await prisma.user.update({
            where: { id: payload.userId },
            data: { deletedAt: new Date() },
        });
        await audit({ req, userId: payload.userId, action: 'me.delete_requested' });
        return jsonOk({
            ok: true,
            deletedAt: new Date().toISOString(),
            note: 'Your account is marked for deletion. All data will be purged permanently within 30 days.',
        });
    } catch (e) {
        log.error({ err: String(e) }, 'me.delete.failed');
        return jsonError(500, 'Could not process deletion request');
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
