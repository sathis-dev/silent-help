/**
 * Clinical questionnaires — PHQ-9 (depression) and GAD-7 (anxiety).
 *
 * These are validated screening instruments, NOT diagnostic. The frontend
 * shows explicit disclaimers. We persist the score + severity bucket so
 * users can track change over time.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { jsonOk, jsonError, parseJson, z } from '@/lib/http';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';

const InstrumentSchema = z.enum(['phq9', 'gad7']);

const SubmitSchema = z.object({
    instrument: InstrumentSchema,
    answers: z.array(z.number().int().min(0).max(3)),
});

const EXPECTED_LENGTH: Record<z.infer<typeof InstrumentSchema>, number> = {
    phq9: 9,
    gad7: 7,
};

type Severity = 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';

function severityFor(instrument: z.infer<typeof InstrumentSchema>, score: number): Severity {
    if (instrument === 'phq9') {
        if (score <= 4) return 'minimal';
        if (score <= 9) return 'mild';
        if (score <= 14) return 'moderate';
        if (score <= 19) return 'moderately_severe';
        return 'severe';
    }
    // gad7
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
}

export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const url = new URL(req.url);
    const qInstrument = url.searchParams.get('instrument');
    const where: {
        userId: string;
        instrument?: z.infer<typeof InstrumentSchema>;
    } = { userId: payload.userId };
    if (qInstrument && (qInstrument === 'phq9' || qInstrument === 'gad7')) {
        where.instrument = qInstrument;
    }
    try {
        const rows = await prisma.clinicalResult.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        const results = rows.map((r) => ({
            id: r.id,
            instrument: r.instrument,
            score: r.score,
            severity: r.severity,
            answers: r.answers as number[],
            createdAt: r.createdAt.toISOString(),
        }));
        return jsonOk({ results });
    } catch {
        return jsonError(500, 'Could not load results');
    }
}

export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `clinical.submit:${payload.userId}`, limit: 8, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, SubmitSchema);
    if (!parsed.ok) return parsed.response;

    const { instrument, answers } = parsed.data;
    if (answers.length !== EXPECTED_LENGTH[instrument]) {
        return jsonError(400, `Expected ${EXPECTED_LENGTH[instrument]} answers for ${instrument}`);
    }

    const score = answers.reduce((a, b) => a + b, 0);
    const severity = severityFor(instrument, score);

    try {
        const row = await prisma.clinicalResult.create({
            data: {
                userId: payload.userId,
                instrument,
                score,
                severity,
                answers,
            },
        });
        await audit({
            req,
            userId: payload.userId,
            action: 'clinical.submit',
            resource: `clinical:${row.id}`,
            meta: { instrument, score, severity },
        });
        return jsonOk(
            {
                result: {
                    id: row.id,
                    instrument: row.instrument,
                    score: row.score,
                    severity: row.severity,
                    answers: row.answers as number[],
                    createdAt: row.createdAt.toISOString(),
                },
            },
            { status: 201 },
        );
    } catch (e) {
        log.error({ err: String(e) }, 'clinical.create.failed');
        return jsonError(500, 'Could not save result');
    }
}
