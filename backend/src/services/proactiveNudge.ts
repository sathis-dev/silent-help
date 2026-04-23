/**
 * Proactive inline nudges for chat v2.
 *
 * Silent Help watches the user's mood trend, clinical history and recent tool
 * usage, and — when there is something genuinely worth saying — asks the
 * companion to weave a short, non-intrusive observation into the reply.
 *
 * Design constraints:
 *  - Nudges are advisory: they appear as `proactiveNudge` meta in the SSE
 *    stream, surfaced as an inline card. They are NEVER forced into the reply
 *    text — the LLM decides whether to mention them, with guidance.
 *  - Nudges only appear when consent is active (`users.consented_at` set).
 *  - `childMode:true` users get the same nudges with the same local-only AI.
 *  - No nudge text references methods of self-harm (Samaritans-safe).
 */
import prisma from '@/lib/prisma';

export type NudgeKind = 'low_mood_streak' | 'overdue_check_in' | 'tool_that_helped' | 'safety_plan_reminder';

export interface ProactiveNudge {
    kind: NudgeKind;
    message: string;
    /** UI can deep-link if desired. */
    actionLabel?: string;
    actionHref?: string;
}

const LOW_MOOD_THRESHOLD = 4; // 1-10 scale; <=4 counts as low
const LOW_MOOD_MIN_CONSECUTIVE = 3;
const OVERDUE_CHECKIN_DAYS = 21;

export async function computeNudges(userId: string): Promise<ProactiveNudge[]> {
    const nudges: ProactiveNudge[] = [];

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { consentedAt: true },
    });
    if (!user?.consentedAt) return nudges;

    // Low-mood streak
    try {
        const recent = await prisma.moodLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: LOW_MOOD_MIN_CONSECUTIVE,
            select: { intensity: true },
        });
        if (
            recent.length === LOW_MOOD_MIN_CONSECUTIVE &&
            recent.every((m) => (m.intensity ?? 0) <= LOW_MOOD_THRESHOLD)
        ) {
            nudges.push({
                kind: 'low_mood_streak',
                message:
                    "I've noticed your last few check-ins have been on the heavier side. If you'd like, we can slow down together.",
                actionLabel: '5-4-3-2-1 grounding',
                actionHref: '/tools?tool=grounding-54321',
            });
        }
    } catch {
        /* ignore */
    }

    // Overdue clinical check-in
    try {
        const last = await prisma.clinicalResult.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true, instrument: true },
        });
        const days = last ? Math.round((Date.now() - last.createdAt.getTime()) / 86_400_000) : null;
        if (days !== null && days >= OVERDUE_CHECKIN_DAYS) {
            nudges.push({
                kind: 'overdue_check_in',
                message: `It's been ${days} days since your last ${last!.instrument.toUpperCase()} check-in — no pressure, only when you're ready.`,
                actionLabel: 'Re-check in',
                actionHref: '/clinical',
            });
        }
    } catch {
        /* ignore */
    }

    // Tool that helped — if a tool ended with moodAfter > moodBefore, remind us.
    try {
        const helpful = await prisma.toolUsage.findFirst({
            where: {
                userId,
                action: 'completed',
                moodBefore: { not: null },
                moodAfter: { not: null },
            },
            orderBy: { createdAt: 'desc' },
            select: { toolId: true, moodBefore: true, moodAfter: true, createdAt: true },
        });
        if (
            helpful &&
            typeof helpful.moodBefore === 'number' &&
            typeof helpful.moodAfter === 'number' &&
            helpful.moodAfter - helpful.moodBefore >= 2
        ) {
            nudges.push({
                kind: 'tool_that_helped',
                message: `Last time, ${helpful.toolId.replace(/_/g, ' ')} seemed to help lift things a bit. Worth another try?`,
                actionLabel: 'Open tool',
                actionHref: `/tools?tool=${encodeURIComponent(helpful.toolId)}`,
            });
        }
    } catch {
        /* ignore */
    }

    // At most two nudges at once — one mood-related, one action-related.
    return nudges.slice(0, 2);
}

/**
 * System-prompt addendum the LLM can use as context. Kept short and optional.
 */
export function nudgePromptAddendum(nudges: ProactiveNudge[]): string {
    if (nudges.length === 0) return '';
    return (
        '\n\n— Observations you may gently weave into the reply if relevant —\n' +
        nudges.map((n) => `• ${n.message}`).join('\n') +
        '\n— End observations —\n(These are optional. Only mention if it fits the user\'s moment — never force.)'
    );
}
