/**
 * Weekly digest — AI-written, one per ISO week, cached.
 */
import prisma from '@/lib/prisma';
import { generate } from '@/lib/ai/provider';
import { decryptForUser } from '@/lib/encryption';
import { logger } from '@/lib/logger';

export interface WeeklyDigest {
    period: 'weekly';
    periodKey: string;            // ISO week, e.g. '2026-W17'
    summary: string;              // 2-3 sentence prose
    highlights: string[];         // bullet list
    themes: string[];              // key emotional themes
    nudge: string;                // single next-step suggestion
    moodAverage: number | null;
    moodTrend: 'improving' | 'stable' | 'declining' | 'volatile' | null;
    generatedAt: Date;
}

export function currentWeekKey(d = new Date()): string {
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export async function getOrGenerateWeeklyDigest(userId: string, force = false): Promise<WeeklyDigest> {
    const periodKey = currentWeekKey();

    if (!force) {
        const cached = await prisma.digestCache.findUnique({
            where: { userId_period_periodKey: { userId, period: 'weekly', periodKey } },
        });
        if (cached) {
            return { ...(cached.payload as unknown as WeeklyDigest), generatedAt: cached.createdAt };
        }
    }

    // Build the input window: last 7 days
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [moodLogs, journals, messages] = await Promise.all([
        prisma.moodLog.findMany({
            where: { userId, createdAt: { gte: since } },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.journalEntry.findMany({
            where: { userId, createdAt: { gte: since } },
            orderBy: { createdAt: 'asc' },
            take: 10,
        }),
        prisma.message.findMany({
            where: { conversation: { userId }, role: 'user', createdAt: { gte: since } },
            orderBy: { createdAt: 'asc' },
            take: 12,
        }),
    ]);

    const avg =
        moodLogs.length > 0
            ? Math.round((moodLogs.reduce((s, m) => s + m.intensity, 0) / moodLogs.length) * 10) / 10
            : null;

    const trend = computeTrend(moodLogs.map((m) => m.intensity));

    // Compact input for the AI
    const journalText = journals
        .slice(-5)
        .map((j) => decryptForUser(userId, j.cipherText, j.content))
        .map((t, i) => `J${i + 1}: ${t.slice(0, 280)}`)
        .join('\n');
    const moodText = moodLogs
        .map((m) => `- ${m.mood} (${m.intensity}/10)${m.note ? ` — ${m.note.slice(0, 60)}` : ''}`)
        .join('\n');
    const chatText = messages.map((m) => `- "${m.content.slice(0, 160)}"`).join('\n');

    const system = `You are a compassionate wellness companion writing a private weekly reflection for ONE user. Read their week's inputs and write a warm, honest digest.

Output a SINGLE JSON object with this exact shape and NOTHING else:
{
  "summary": "2-3 sentence prose reflection in a warm second-person voice",
  "highlights": ["3-5 short bullets about notable moments, patterns, or shifts"],
  "themes": ["2-4 short labels like 'work stress', 'self-compassion', 'sleep'"],
  "nudge": "one sentence, actionable, gentle"
}

Rules: warm, specific, never clinical, never diagnose, avoid generic platitudes. If data is very sparse, acknowledge that and still be kind.`;

    const user = `Data for this week:
MOOD LOGS:
${moodText || '(none)'}

JOURNAL ENTRIES:
${journalText || '(none)'}

CHAT (their own words):
${chatText || '(none)'}

Average mood: ${avg ?? 'n/a'}/10. Trend: ${trend ?? 'n/a'}.`;

    let parsed: { summary?: string; highlights?: string[]; themes?: string[]; nudge?: string } = {};
    try {
        const r = await generate({
            system,
            turns: [{ role: 'user', content: user }],
            maxTokens: 500,
            temperature: 0.6,
        });
        parsed = safeJson(r.text) || {};
    } catch (e) {
        logger.warn({ err: String(e) }, 'digest.ai_failed');
    }

    const payload: WeeklyDigest = {
        period: 'weekly',
        periodKey,
        summary: parsed.summary?.trim() ||
            (journals.length + moodLogs.length === 0
                ? "A quiet week on the record — whenever you're ready, I'm here to listen."
                : "This week, you showed up for yourself in small ways. That matters."),
        highlights: (parsed.highlights || []).slice(0, 5),
        themes: (parsed.themes || []).slice(0, 4),
        nudge: parsed.nudge?.trim() || 'Take three slow breaths before your next message to me.',
        moodAverage: avg,
        moodTrend: trend,
        generatedAt: new Date(),
    };

    await prisma.digestCache.upsert({
        where: { userId_period_periodKey: { userId, period: 'weekly', periodKey } },
        create: {
            userId,
            period: 'weekly',
            periodKey,
            payload: payload as unknown as object,
        },
        update: {
            payload: payload as unknown as object,
        },
    });

    return payload;
}

function computeTrend(values: number[]): WeeklyDigest['moodTrend'] {
    if (values.length < 3) return null;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length;
    if (variance > 4) return 'volatile';
    const n = values.length;
    const xMean = (n - 1) / 2;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (i - xMean) * (values[i] - avg);
        den += (i - xMean) * (i - xMean);
    }
    const slope = den === 0 ? 0 : num / den;
    if (slope > 0.3) return 'improving';
    if (slope < -0.3) return 'declining';
    return 'stable';
}

function safeJson(text: string): Record<string, unknown> | null {
    try {
        const m = text.replace(/```json|```/g, '').match(/\{[\s\S]*\}/);
        return m ? JSON.parse(m[0]) : null;
    } catch {
        return null;
    }
}
