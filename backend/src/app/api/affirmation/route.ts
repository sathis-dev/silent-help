/**
 * GET /api/affirmation
 * Returns today's AI-generated affirmation, cached per (userId, dayKey).
 *
 * Generation signal:
 *   - User's wellness profile emotional primary (anxious/overwhelmed/sad/…)
 *   - Last 3 journal entry snippets (decrypted briefly in-memory)
 *   - Recent mood trend
 *
 * Degrades gracefully to a curated library if no AI is configured.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { generate } from '@/lib/ai/provider';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { jsonOk, jsonError } from '@/lib/http';
import { decryptForUser } from '@/lib/encryption';

const FALLBACK_LIBRARY = [
    { tone: 'anchoring', text: 'You do not have to carry everything today. Rest counts.' },
    { tone: 'anchoring', text: 'You are allowed to begin again, softly, as many times as you need.' },
    { tone: 'warming', text: 'The part of you that keeps showing up — that is strength, even when it feels quiet.' },
    { tone: 'warming', text: 'You are still here. That is not small.' },
    { tone: 'steadying', text: 'Feelings are weather. You are the sky.' },
    { tone: 'steadying', text: 'Slow breath. Slower thought. Softer judgement.' },
];

function todayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

const SYSTEM = `You write a single short affirmation for a Silent Help user.

RULES:
- First person: "I can…", "I am…", or second person: "You can…", "You are…"
- No toxic positivity — no "everything happens for a reason". No denial of pain.
- Under 140 characters. One sentence. No emojis.
- Warm, quiet, grounded tone. The voice of a patient friend, not a coach.
- Must feel different from generic Instagram quotes.
- OUTPUT: raw JSON only. Shape: { "text": string, "tone": string }
- "tone" is one of: anchoring, warming, steadying, tender, encouraging.`;

export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const dayKey = todayKey();

    // Cached?
    const cached = await prisma.affirmationCache.findUnique({
        where: { userId_dayKey: { userId: payload.userId, dayKey } },
    });
    if (cached) {
        return jsonOk({ affirmation: cached.content, tone: cached.tone, cached: true });
    }

    const rl = await rateLimit({ key: `affirmation:${payload.userId}`, limit: 8, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    // Build a lightweight personal signal
    let emotion: string | undefined;
    let snippets: string[] = [];
    try {
        const profile = await prisma.wellnessProfile.findUnique({ where: { userId: payload.userId } });
        const rawProfile = profile?.profile as { emotionalPrimary?: string } | null;
        emotion = rawProfile?.emotionalPrimary;
        const recent = await prisma.journalEntry.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
            take: 3,
        });
        snippets = recent
            .map((r) => decryptForUser(payload.userId, r.cipherText, r.content))
            .filter(Boolean)
            .map((t) => t.slice(0, 180));
    } catch (e) {
        log.warn({ err: String(e) }, 'affirmation.signal.failed');
    }

    // AI generate
    let affirmation: string | null = null;
    let tone = 'anchoring';
    try {
        const userPrompt = [
            emotion ? `Primary emotion: ${emotion}.` : null,
            snippets.length
                ? `Recent reflections (for tone only, do NOT quote):\n${snippets.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
                : null,
        ]
            .filter(Boolean)
            .join('\n\n') || 'No context. Write a gentle universal affirmation.';

        const result = await generate({
            system: SYSTEM,
            turns: [{ role: 'user', content: userPrompt }],
            maxTokens: 180,
            temperature: 0.8,
        });
        const cleaned = result.text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (typeof parsed?.text === 'string' && parsed.text.length > 4 && parsed.text.length < 260) {
            affirmation = parsed.text.trim();
            if (typeof parsed.tone === 'string') tone = parsed.tone;
        }
    } catch (e) {
        log.warn({ err: String(e) }, 'affirmation.generate.failed');
    }

    if (!affirmation) {
        const pick = FALLBACK_LIBRARY[new Date().getUTCDate() % FALLBACK_LIBRARY.length];
        affirmation = pick.text;
        tone = pick.tone;
    }

    try {
        await prisma.affirmationCache.create({
            data: { userId: payload.userId, dayKey, content: affirmation, tone },
        });
    } catch (e) {
        // race — another request cached first; that's fine
        log.debug({ err: String(e) }, 'affirmation.cache.race');
    }

    return jsonOk({ affirmation, tone, cached: false });
}

export async function POST(req: NextRequest) {
    // Forcing a regenerate — not cached.
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const dayKey = todayKey();
    try {
        await prisma.affirmationCache.deleteMany({ where: { userId: payload.userId, dayKey } });
    } catch {
        // ignore
    }
    return GET(req);
}

export async function DELETE() {
    return jsonError(405, 'Method not allowed');
}
