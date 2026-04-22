import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { SafetyPlanSchema } from '@/contracts/schemas';
import { jsonOk, jsonError, parseJson } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';

/** GET /api/safety-plan — fetch user's personal safety plan */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);
    try {
        const plan = await prisma.safetyPlan.findUnique({ where: { userId: payload.userId } });
        return jsonOk({ plan });
    } catch (e) {
        log.error({ err: String(e) }, 'safety_plan.get.failed');
        return jsonError(500, 'Could not load safety plan');
    }
}

/** PUT /api/safety-plan — upsert user's personal safety plan */
export async function PUT(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `safety:${payload.userId}`, limit: 10, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, SafetyPlanSchema);
    if (!parsed.ok) return parsed.response;
    const data = parsed.data;

    try {
        const plan = await prisma.safetyPlan.upsert({
            where: { userId: payload.userId },
            create: { userId: payload.userId, ...(data as unknown as object) },
            update: { ...(data as unknown as object) },
        });
        await audit({
            req,
            userId: payload.userId,
            action: 'safety_plan.upsert',
            resource: `safety_plan:${plan.id}`,
        });
        return jsonOk({ plan });
    } catch (e) {
        log.error({ err: String(e) }, 'safety_plan.upsert.failed');
        return jsonError(500, 'Could not save safety plan');
    }
}
