import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { ReminderCreateSchema } from '@/contracts/schemas';
import { jsonOk, jsonError, parseJson } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';

/** GET /api/reminders — list pending reminders */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);
    try {
        const reminders = await prisma.reminder.findMany({
            where: { userId: payload.userId, status: 'pending' },
            orderBy: { dueAt: 'asc' },
            take: 50,
        });
        return jsonOk({ reminders });
    } catch (e) {
        log.error({ err: String(e) }, 'reminders.list.failed');
        return jsonError(500, 'Could not load reminders');
    }
}

/** POST /api/reminders — schedule a gentle reminder */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `reminder:${payload.userId}`, limit: 20, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, ReminderCreateSchema);
    if (!parsed.ok) return parsed.response;

    try {
        const due = new Date(parsed.data.dueAt);
        if (isNaN(due.getTime()) || due.getTime() < Date.now() - 60_000) {
            return jsonError(400, 'dueAt must be a valid future timestamp');
        }
        const reminder = await prisma.reminder.create({
            data: {
                userId: payload.userId,
                kind: parsed.data.kind,
                message: parsed.data.message,
                dueAt: due,
            },
        });
        await audit({ req, userId: payload.userId, action: 'reminder.create', resource: `reminder:${reminder.id}` });
        return jsonOk({ reminder }, { status: 201 });
    } catch (e) {
        log.error({ err: String(e) }, 'reminder.create.failed');
        return jsonError(500, 'Could not schedule reminder');
    }
}
