import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { deleteMemory } from '@/services/memoryService';
import { jsonOk, jsonError } from '@/lib/http';
import { audit } from '@/lib/audit';

/** DELETE /api/memory/[id] — forget a memory */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const { id } = await params;

    const deleted = await deleteMemory(payload.userId, id);
    if (!deleted) return jsonError(404, 'Memory not found');
    await audit({ req, userId: payload.userId, action: 'memory.delete', resource: `memory:${id}` });
    return jsonOk({ ok: true });
}
