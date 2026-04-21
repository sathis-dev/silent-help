/**
 * Adaptive coach — picks the next 3-minute action most likely to help, based on:
 *   - user's current feeling (optional input),
 *   - recent mood trajectory,
 *   - tools that have actually helped them (mood delta > 0),
 *   - fallback defaults per emotional direction.
 *
 * Output is safe-by-default: even without any data, returns a gentle suggestion.
 */
import prisma from '@/lib/prisma';
import { computeUserState } from '@/lib/ai-engine';
import { generate } from '@/lib/ai/provider';
import { logger } from '@/lib/logger';

export interface CoachSuggestion {
    headline: string;        // "Try Box Breathing"
    subhead: string;         // "It helped you 4/5 of the last times"
    toolId: string | null;   // maps to frontend tool registry
    reason: string;          // human-readable reason
    source: 'learned' | 'default' | 'ai';
}

const DEFAULT_BY_DIRECTION: Record<string, CoachSuggestion> = {
    declining: {
        headline: 'Try a 3-minute Body Scan',
        subhead: 'A gentle tour of what your body is holding right now.',
        toolId: 'body_scan',
        reason: 'Your mood has been trending lower. A body scan can help name and release tension.',
        source: 'default',
    },
    volatile: {
        headline: 'Try Box Breathing',
        subhead: '4 seconds in, hold, out, hold. Three rounds.',
        toolId: 'box_breathing',
        reason: 'Your feelings have been swinging. A steady breath pattern brings the nervous system back.',
        source: 'default',
    },
    stable: {
        headline: 'Log one thing you noticed today',
        subhead: 'Small observations become patterns over time.',
        toolId: 'journal_prompt',
        reason: 'When things feel steady, small noticing deepens self-awareness.',
        source: 'default',
    },
    improving: {
        headline: 'Savor the lift — name one win',
        subhead: "Write down what's working, however small.",
        toolId: 'journal_prompt',
        reason: "You're trending up. Anchoring wins helps the brain re-wire.",
        source: 'default',
    },
};

const TOOL_LABELS: Record<string, string> = {
    box_breathing: 'Box Breathing',
    body_scan: 'Body Scan',
    grounding_54321: '5-4-3-2-1 Grounding',
    journal_prompt: 'a quick journal prompt',
    gratitude_three: 'Three Good Things',
    progressive_relaxation: 'Progressive Relaxation',
};

export async function suggestNext(params: {
    userId: string;
    feeling?: string;
}): Promise<CoachSuggestion> {
    const { userId, feeling } = params;

    let state: Awaited<ReturnType<typeof computeUserState>> | null = null;
    try {
        state = await computeUserState(userId);
    } catch (e) {
        logger.warn({ err: String(e) }, 'coach.computeUserState_failed');
    }

    // ── Learned suggestion: pick the tool with the best mood-delta track record ──
    try {
        const usages = await prisma.toolUsage.findMany({
            where: {
                userId,
                action: 'completed',
                moodBefore: { not: null },
                moodAfter: { not: null },
            },
            take: 100,
            orderBy: { createdAt: 'desc' },
        });
        if (usages.length >= 2) {
            const score: Record<string, { improved: number; total: number }> = {};
            for (const u of usages) {
                if (u.moodBefore == null || u.moodAfter == null) continue;
                score[u.toolId] ??= { improved: 0, total: 0 };
                score[u.toolId].total++;
                if (u.moodAfter < u.moodBefore) score[u.toolId].improved++;
            }
            const ranked = Object.entries(score)
                .filter(([, v]) => v.total >= 2 && v.improved / v.total >= 0.5)
                .sort((a, b) => b[1].improved / b[1].total - a[1].improved / a[1].total);
            const top = ranked[0];
            if (top) {
                const [toolId, stats] = top;
                const pretty = TOOL_LABELS[toolId] ?? toolId.replace(/_/g, ' ');
                return {
                    headline: `Try ${pretty}`,
                    subhead: `It helped you ${stats.improved}/${stats.total} of the last times.`,
                    toolId,
                    reason: `Your own history says this works for you.`,
                    source: 'learned',
                };
            }
        }
    } catch (e) {
        logger.warn({ err: String(e) }, 'coach.learned_failed');
    }

    // ── AI-written suggestion if a feeling is provided ──
    if (feeling && feeling.trim().length > 3) {
        try {
            const ai = await generate({
                system: `You are a gentle coach inside a mental-health app. Given how the user is feeling RIGHT NOW, recommend ONE 3-minute action from this list:
- box_breathing
- body_scan
- grounding_54321
- journal_prompt
- gratitude_three
- progressive_relaxation

Respond with a single JSON object and NOTHING else:
{"toolId":"<id>","headline":"<short>","subhead":"<1 line>","reason":"<1 line>"}`,
                turns: [{ role: 'user', content: feeling.slice(0, 200) }],
                maxTokens: 200,
                temperature: 0.4,
            });
            const parsed = extractJson(ai.text);
            if (parsed && parsed.toolId && parsed.headline) {
                return {
                    toolId: String(parsed.toolId),
                    headline: String(parsed.headline),
                    subhead: String(parsed.subhead ?? ''),
                    reason: String(parsed.reason ?? ''),
                    source: 'ai',
                };
            }
        } catch (e) {
            logger.warn({ err: String(e) }, 'coach.ai_failed');
        }
    }

    // ── Default by trajectory ──
    const direction = state?.emotionalTrajectory?.direction || 'stable';
    return DEFAULT_BY_DIRECTION[direction] ?? DEFAULT_BY_DIRECTION.stable;
}

function extractJson(text: string): Record<string, unknown> | null {
    try {
        const match = text.replace(/```json|```/g, '').match(/\{[\s\S]*\}/);
        if (!match) return null;
        return JSON.parse(match[0]);
    } catch {
        return null;
    }
}
