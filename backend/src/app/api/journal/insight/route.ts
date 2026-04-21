import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { decryptForUser } from '@/lib/encryption';
import { generate } from '@/lib/ai/provider';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { jsonOk, jsonError } from '@/lib/http';

/** POST /api/journal/insight — AI-written reflection over the last 7 entries */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `journal.insight:${payload.userId}`, limit: 10, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    try {
        const entries = await prisma.journalEntry.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
            take: 7,
        });
        if (entries.length < 2) {
            return jsonOk({
                insight: null,
                message: 'Write at least 2 journal entries to unlock AI insights.',
            });
        }

        const journalText = entries
            .reverse()
            .map((e, i) => {
                const date = new Date(e.createdAt).toLocaleDateString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short',
                });
                const content = decryptForUser(payload.userId, e.cipherText, e.content);
                return `Entry ${i + 1} (${date})${e.mood ? ` [Mood: ${e.mood}]` : ''}:\n${content}`;
            })
            .join('\n\n---\n\n');

        const system = `You are a compassionate wellness companion analyzing someone's private journal entries. Your goal is to identify emotional patterns, hidden stressors, and positive moments they might not have noticed themselves.

Please provide a brief, warm, insightful analysis (3-4 paragraphs max) that:
1. Identifies any emotional patterns or recurring themes
2. Highlights positive moments or signs of growth they may have overlooked
3. Gently notes any potential stressors worth being mindful of
4. Ends with one actionable, compassionate suggestion

Important: Be warm and encouraging, not clinical. Write as a caring friend, not a therapist. Do NOT diagnose anything. Use "I notice" language rather than definitive statements.`;

        const { text, provider } = await generate({
            system,
            turns: [{ role: 'user', content: `Here are my recent journal entries (oldest to newest):\n\n${journalText}` }],
            maxTokens: 600,
            temperature: 0.6,
        });

        return jsonOk({
            insight: text || 'Unable to generate insight at this time.',
            entryCount: entries.length,
            provider,
        });
    } catch (e) {
        log.error({ err: String(e) }, 'journal.insight.failed');
        return jsonError(500, 'Failed to generate insight');
    }
}
