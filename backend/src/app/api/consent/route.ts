import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { jsonOk, jsonError, parseJson, z } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import {
    CONSENT_VERSION,
    RETENTION_POLICIES,
    classifyAge,
    getConsentStatus,
    logConsent,
    MIN_AGE,
    type RetentionPolicy,
} from '@/lib/consent';

/** GET /api/consent — current consent + retention + childMode for the user. */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const status = await getConsentStatus(payload.userId);
    if (!status) return jsonError(404, 'User not found');
    return jsonOk({
        consentVersionRequired: CONSENT_VERSION,
        ...status,
    });
}

/**
 * POST /api/consent
 * Records an explicit Art 9(2)(a) consent grant. If birthYear indicates 13-17,
 * server enables Children's Code mode (forces AI_MODE=local for that user).
 */
const BodySchema = z.object({
    birthYear: z.number().int().min(1900).max(new Date().getUTCFullYear()),
    retention: z.enum(RETENTION_POLICIES as [RetentionPolicy, ...RetentionPolicy[]]),
    region: z.string().length(2).optional(),
    locale: z.string().min(2).max(10).optional(),
});

export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `consent:${payload.userId}`, limit: 10, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, BodySchema);
    if (!parsed.ok) return parsed.response;
    const { birthYear, retention, region, locale } = parsed.data;

    const { age, isChild, isAdult } = classifyAge(birthYear);
    if (age < MIN_AGE) {
        return jsonError(
            403,
            'Silent Help is only available to people aged 13 or over.',
            { minAge: MIN_AGE },
        );
    }
    if (!isChild && !isAdult) {
        return jsonError(400, 'Invalid birth year');
    }

    try {
        await prisma.user.update({
            where: { id: payload.userId },
            data: {
                birthYear,
                childMode: isChild,
                consentedAt: new Date(),
                consentVersion: CONSENT_VERSION,
                retentionPolicy: retention,
                region: region ?? null,
                locale: locale ?? null,
            },
        });
        await logConsent({ userId: payload.userId, event: 'age_confirm', req });
        await logConsent({ userId: payload.userId, event: 'grant', retention, req });
        if (isChild) {
            await logConsent({ userId: payload.userId, event: 'child_mode_enabled', req });
        }
        return jsonOk({
            ok: true,
            childMode: isChild,
            retention,
            consentVersion: CONSENT_VERSION,
        });
    } catch (e) {
        log.error({ err: String(e) }, 'consent.grant.failed');
        return jsonError(500, 'Could not record consent');
    }
}

/** DELETE /api/consent — withdraw consent (prepares full erasure). */
export async function DELETE(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    try {
        await prisma.user.update({
            where: { id: payload.userId },
            data: { consentedAt: null, consentVersion: null },
        });
        await logConsent({ userId: payload.userId, event: 'withdraw', req });
        return jsonOk({
            ok: true,
            note:
                'Consent withdrawn. Please use /settings/data → Delete account to erase all stored data.',
        });
    } catch (e) {
        log.error({ err: String(e) }, 'consent.withdraw.failed');
        return jsonError(500, 'Could not withdraw consent');
    }
}
