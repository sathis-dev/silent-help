/**
 * POST /api/journal/distortions
 * Takes a journal entry body and returns:
 *  - detected cognitive distortions (Burns/Beck list)
 *  - a gentle CBT-style reframe for each
 *  - an overall kind summary
 *
 * Stays strictly in scope — does NOT diagnose. Disclaimers enforced in the prompt.
 * Rate-limited to protect costs.
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { generate } from '@/lib/ai/provider';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { jsonError, parseJson, z } from '@/lib/http';

const BodySchema = z.object({
    content: z.string().trim().min(10).max(8000),
});

const DISTORTION_TAXONOMY = [
    'catastrophising',
    'all_or_nothing',
    'mind_reading',
    'fortune_telling',
    'should_statements',
    'personalisation',
    'emotional_reasoning',
    'disqualifying_the_positive',
    'magnification',
    'labeling',
    'mental_filter',
    'overgeneralisation',
] as const;

type Distortion = (typeof DISTORTION_TAXONOMY)[number];

interface AnalysisResult {
    summary: string;
    distortions: Array<{
        label: Distortion;
        evidence: string;
        reframe: string;
    }>;
}

const SYSTEM_PROMPT = `You are Silent Help's gentle CBT analysis assistant.

Your ONLY job: read a user's journal entry and return a JSON object that identifies cognitive distortions (from the classical Burns / Beck list) and offers a warm, non-judgemental reframe for each.

RULES:
- You are NOT diagnosing. Distortions are patterns of thought, not illnesses.
- Reframes must be compassionate — never "you're wrong", always "another way to look at this might be…".
- Only label a distortion if the evidence is clear in the text. Return [] if none.
- Keep each reframe under 220 characters.
- Taxonomy (use EXACTLY these keys): catastrophising, all_or_nothing, mind_reading, fortune_telling, should_statements, personalisation, emotional_reasoning, disqualifying_the_positive, magnification, labeling, mental_filter, overgeneralisation
- summary: one warm sentence acknowledging what the user is carrying. Max 180 chars.

OUTPUT: raw JSON only. No markdown fence, no prose.
Shape: { "summary": string, "distortions": [{ "label": string, "evidence": string, "reframe": string }] }`;

function tryParse(raw: string): AnalysisResult | null {
    const trimmed = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    try {
        const parsed = JSON.parse(trimmed);
        if (!parsed || typeof parsed !== 'object') return null;
        if (typeof parsed.summary !== 'string') return null;
        if (!Array.isArray(parsed.distortions)) return null;
        const distortions = (parsed.distortions as unknown[])
            .filter(
                (d): d is { label: string; evidence: string; reframe: string } =>
                    !!d &&
                    typeof d === 'object' &&
                    typeof (d as { label?: unknown }).label === 'string' &&
                    typeof (d as { evidence?: unknown }).evidence === 'string' &&
                    typeof (d as { reframe?: unknown }).reframe === 'string',
            )
            .filter((d) => (DISTORTION_TAXONOMY as readonly string[]).includes(d.label))
            .map((d) => ({ label: d.label as Distortion, evidence: d.evidence, reframe: d.reframe }));
        return { summary: parsed.summary, distortions };
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `distortions:${payload.userId}`, limit: 12, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    const parsed = await parseJson(req, BodySchema);
    if (!parsed.ok) return parsed.response;
    const { content } = parsed.data;

    try {
        const result = await generate({
            system: SYSTEM_PROMPT,
            turns: [{ role: 'user', content }],
            maxTokens: 800,
            temperature: 0.4,
        });
        const structured = tryParse(result.text);
        if (!structured) {
            return Response.json({
                summary: 'I read your entry. Sometimes the mind leans on familiar patterns when things are heavy — notice what you wrote with kindness.',
                distortions: [],
                provider: result.provider,
                degraded: true,
            });
        }
        return Response.json({ ...structured, provider: result.provider });
    } catch (err) {
        log.warn({ err: String(err) }, 'distortions.generate_failed');
        return jsonError(502, 'Analysis unavailable, please try again shortly');
    }
}
