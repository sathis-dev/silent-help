/**
 * Silent Help — Adaptive Context Engine (AI Engine Layer 1)
 *
 * Computes a living UserState from all available data points,
 * then generates a dynamic system prompt that evolves with the user.
 *
 * Data sources:
 *   - WellnessProfile (onboarding baseline)
 *   - MoodLog (last 7 entries → emotional trajectory)
 *   - JournalEntry (last 3 → theme extraction)
 *   - Message history (last conversation → recent emotional state)
 *   - ToolUsage (what works for this user)
 *   - UserState (previously computed state)
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getCrisisSystemPrompt } from '@/lib/crisis';

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

interface EmotionalTrajectory {
    direction: 'improving' | 'stable' | 'declining' | 'volatile';
    last7: number[];      // intensity values from recent mood logs
    average: number;
    trend: number;        // positive = improving, negative = declining
}

interface ContextSummary {
    timestamp: string;
    type: 'chat' | 'mood' | 'journal' | 'tool';
    summary: string;
}

interface EngagementPattern {
    toolsUsed: Record<string, number>;      // toolId -> count
    toolsCompleted: Record<string, number>;
    toolsSkipped: Record<string, number>;
    favorites: string[];                    // top 3 most used
    effectiveTools: string[];               // tools where moodAfter > moodBefore
}

export interface ComputedUserState {
    currentArchetype: string;
    emotionalTrajectory: EmotionalTrajectory;
    sessionCount: number;
    lastCrisisFlag: Date | null;
    copingStrength: number;
    engagementPattern: EngagementPattern;
    contextWindow: ContextSummary[];
    isReturningUser: boolean;
    daysSinceLastSession: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

// ═══════════════════════════════════════════════
// COMPUTE USER STATE
// ═══════════════════════════════════════════════

export async function computeUserState(userId: string): Promise<ComputedUserState> {
    // Fetch all data sources in parallel
    const [wellnessProfile, moodLogs, journalEntries, recentMessages, toolUsages, existingState] = await Promise.all([
        prisma.wellnessProfile.findUnique({ where: { userId } }),
        prisma.moodLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 7,
        }),
        prisma.journalEntry.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 3,
        }),
        prisma.message.findMany({
            where: { conversation: { userId } },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
        prisma.toolUsage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        }),
        prisma.userState.findUnique({ where: { userId } }),
    ]);

    // ── 1. Emotional Trajectory ──
    const trajectory = computeTrajectory(moodLogs);

    // ── 2. Engagement Pattern ──
    const engagement = computeEngagement(toolUsages);

    // ── 3. Context Window (last 5 interactions) ──
    const contextWindow = buildContextWindow(moodLogs, journalEntries, recentMessages);

    // ── 4. Coping Strength (0–1) ──
    const copingStrength = computeCopingStrength(trajectory, engagement);

    // ── 5. Current Archetype ──
    const profile = wellnessProfile?.profile as Record<string, unknown> | null;
    const baseArchetype = (profile?.archetype as string) || 'The Steady Path';
    const currentArchetype = adjustArchetype(baseArchetype, trajectory, copingStrength);

    // ── 6. Session metadata ──
    const sessionCount = (existingState?.sessionCount || 0) + 1;
    const lastComputedAt = existingState?.computedAt || new Date();
    const daysSinceLastSession = Math.floor(
        (Date.now() - new Date(lastComputedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const hour = new Date().getHours();
    const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night';

    const state: ComputedUserState = {
        currentArchetype,
        emotionalTrajectory: trajectory,
        sessionCount,
        lastCrisisFlag: existingState?.lastCrisisFlag || null,
        copingStrength,
        engagementPattern: engagement,
        contextWindow,
        isReturningUser: sessionCount > 1,
        daysSinceLastSession,
        timeOfDay,
    };

    // Persist to DB
    await prisma.userState.upsert({
        where: { userId },
        create: {
            userId,
            currentArchetype,
            emotionalTrajectory: trajectory as unknown as Prisma.InputJsonValue,
            sessionCount,
            copingStrength,
            engagementPattern: engagement as unknown as Prisma.InputJsonValue,
            contextWindow: contextWindow as unknown as Prisma.InputJsonValue,
            computedAt: new Date(),
        },
        update: {
            currentArchetype,
            emotionalTrajectory: trajectory as unknown as Prisma.InputJsonValue,
            sessionCount,
            copingStrength,
            engagementPattern: engagement as unknown as Prisma.InputJsonValue,
            contextWindow: contextWindow as unknown as Prisma.InputJsonValue,
            computedAt: new Date(),
        },
    });

    return state;
}

// ═══════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════

function computeTrajectory(moodLogs: { intensity: number; createdAt: Date }[]): EmotionalTrajectory {
    if (moodLogs.length === 0) {
        return { direction: 'stable', last7: [], average: 5, trend: 0 };
    }

    const intensities = moodLogs.map(m => m.intensity).reverse(); // oldest first
    const average = intensities.reduce((a, b) => a + b, 0) / intensities.length;

    // Linear regression for trend
    let trend = 0;
    if (intensities.length >= 3) {
        const n = intensities.length;
        const xMean = (n - 1) / 2;
        const yMean = average;
        let num = 0, den = 0;
        for (let i = 0; i < n; i++) {
            num += (i - xMean) * (intensities[i] - yMean);
            den += (i - xMean) * (i - xMean);
        }
        trend = den !== 0 ? num / den : 0;
    }

    // Variance for volatility detection
    const variance = intensities.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / intensities.length;
    const isVolatile = variance > 4; // std dev > 2

    let direction: EmotionalTrajectory['direction'];
    if (isVolatile) direction = 'volatile';
    else if (trend > 0.3) direction = 'improving';
    else if (trend < -0.3) direction = 'declining';
    else direction = 'stable';

    return { direction, last7: intensities, average: Math.round(average * 10) / 10, trend: Math.round(trend * 100) / 100 };
}

function computeEngagement(toolUsages: { toolId: string; action: string; moodBefore: number | null; moodAfter: number | null }[]): EngagementPattern {
    const used: Record<string, number> = {};
    const completed: Record<string, number> = {};
    const skipped: Record<string, number> = {};
    const effective: Record<string, { improved: number; total: number }> = {};

    for (const u of toolUsages) {
        used[u.toolId] = (used[u.toolId] || 0) + 1;
        if (u.action === 'completed') {
            completed[u.toolId] = (completed[u.toolId] || 0) + 1;
            if (u.moodBefore != null && u.moodAfter != null) {
                if (!effective[u.toolId]) effective[u.toolId] = { improved: 0, total: 0 };
                effective[u.toolId].total++;
                if (u.moodAfter < u.moodBefore) effective[u.toolId].improved++; // lower intensity = better
            }
        }
        if (u.action === 'skipped') {
            skipped[u.toolId] = (skipped[u.toolId] || 0) + 1;
        }
    }

    const favorites = Object.entries(completed)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => id);

    const effectiveTools = Object.entries(effective)
        .filter(([, v]) => v.total >= 2 && v.improved / v.total >= 0.5)
        .map(([id]) => id);

    return { toolsUsed: used, toolsCompleted: completed, toolsSkipped: skipped, favorites, effectiveTools };
}

function buildContextWindow(
    moodLogs: { mood: string; intensity: number; note: string | null; createdAt: Date }[],
    journals: { content: string; mood: string | null; createdAt: Date }[],
    messages: { role: string; content: string; createdAt: Date }[],
): ContextSummary[] {
    const items: ContextSummary[] = [];

    // Recent moods
    for (const m of moodLogs.slice(0, 2)) {
        items.push({
            timestamp: m.createdAt.toISOString(),
            type: 'mood',
            summary: `Mood: ${m.mood} (intensity ${m.intensity}/10)${m.note ? ` — "${m.note.slice(0, 80)}"` : ''}`,
        });
    }

    // Recent journals (truncated)
    for (const j of journals.slice(0, 2)) {
        items.push({
            timestamp: j.createdAt.toISOString(),
            type: 'journal',
            summary: `Journal entry${j.mood ? ` (mood: ${j.mood})` : ''}: "${j.content.slice(0, 120)}..."`,
        });
    }

    // Recent user messages
    const userMsgs = messages.filter(m => m.role === 'user').slice(0, 3);
    if (userMsgs.length > 0) {
        items.push({
            timestamp: userMsgs[0].createdAt.toISOString(),
            type: 'chat',
            summary: `Recent chat topics: ${userMsgs.map(m => `"${m.content.slice(0, 60)}"`).join(', ')}`,
        });
    }

    return items
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
}

function computeCopingStrength(
    trajectory: EmotionalTrajectory,
    engagement: EngagementPattern
): number {
    let score = 0.5; // baseline

    // Trajectory factor
    if (trajectory.direction === 'improving') score += 0.15;
    if (trajectory.direction === 'declining') score -= 0.15;
    if (trajectory.direction === 'volatile') score -= 0.1;

    // Average mood factor (lower intensity = better coping)
    if (trajectory.average <= 3) score += 0.1;
    if (trajectory.average >= 7) score -= 0.15;

    // Engagement factor (completing tools = better coping)
    const totalCompleted = Object.values(engagement.toolsCompleted).reduce((a, b) => a + b, 0);
    if (totalCompleted >= 5) score += 0.1;
    if (engagement.effectiveTools.length >= 2) score += 0.1;

    // Clamp 0–1
    return Math.max(0, Math.min(1, Math.round(score * 100) / 100));
}

function adjustArchetype(base: string, trajectory: EmotionalTrajectory, copingStrength: number): string {
    // If trajectory is improving and coping is strong, shift toward lighter archetypes
    if (trajectory.direction === 'improving' && copingStrength >= 0.65) {
        if (base.includes('Wired') || base.includes('Burning') || base.includes('Storm')) {
            return 'The Steady Path'; // graduated from high stress
        }
        if (base.includes('Heavy') || base.includes('Hollow') || base.includes('Collapsed')) {
            return 'The Seeking Path'; // graduated from low energy
        }
    }

    // If declining, shift toward more supportive archetypes
    if (trajectory.direction === 'declining' && copingStrength <= 0.35) {
        if (base.includes('Steady') || base.includes('Seeking')) {
            return 'The Slow Burn'; // needs more active support
        }
    }

    return base; // no shift needed
}

// ═══════════════════════════════════════════════
// DYNAMIC SYSTEM PROMPT GENERATION
// ═══════════════════════════════════════════════

export function generateDynamicSystemPrompt(
    state: ComputedUserState,
    wellnessProfile: {
        profile: Record<string, unknown>;
        energy: string;
        concern: string;
        aiInsight: string;
    } | null,
): string {
    const profile = wellnessProfile?.profile || {};
    const aiPersonality = profile.aiPersonality as Record<string, unknown> | undefined;

    // Base personality from onboarding
    const baseTone = (aiPersonality?.tone as string) || 'warm, empathetic, and understanding';
    const baseStyle = (aiPersonality?.style as string) || 'Validate feelings, then offer gentle guidance.';
    const avoidTopics = (aiPersonality?.avoidTopics as string[]) || [];

    // Time-of-day awareness
    const timeGreeting = {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening',
        night: "It's late",
    }[state.timeOfDay];

    // Session familiarity
    let familiarityNote = '';
    if (state.sessionCount === 1) {
        familiarityNote = 'This is their FIRST session. Be extra welcoming and gentle. Introduce yourself warmly.';
    } else if (state.sessionCount <= 3) {
        familiarityNote = `This is session #${state.sessionCount}. They are still new. Be warm but remember they have some context.`;
    } else if (state.sessionCount <= 10) {
        familiarityNote = `Session #${state.sessionCount}. You know them somewhat. You can reference patterns you notice.`;
    } else {
        familiarityNote = `Session #${state.sessionCount}. You know them well. Be familiar, reference their journey, celebrate growth.`;
    }

    // Returning user awareness
    let returningNote = '';
    if (state.isReturningUser) {
        if (state.daysSinceLastSession === 0) {
            returningNote = 'They were here earlier today. Acknowledge that without being intrusive.';
        } else if (state.daysSinceLastSession <= 2) {
            returningNote = `They were here ${state.daysSinceLastSession} day(s) ago. Welcome them back briefly.`;
        } else if (state.daysSinceLastSession >= 7) {
            returningNote = `It has been ${state.daysSinceLastSession} days since their last visit. Gently acknowledge the gap — "It's good to see you again."`;
        }
    }

    // Emotional trajectory awareness
    let trajectoryNote = '';
    switch (state.emotionalTrajectory.direction) {
        case 'improving':
            trajectoryNote = `POSITIVE SIGNAL: Their mood has been improving recently (trend: +${state.emotionalTrajectory.trend}). Gently acknowledge progress without being dismissive of current feelings.`;
            break;
        case 'declining':
            trajectoryNote = `IMPORTANT: Their mood has been declining recently (trend: ${state.emotionalTrajectory.trend}). Be extra attentive and proactive about support. Do NOT ignore this.`;
            break;
        case 'volatile':
            trajectoryNote = `NOTE: Their emotional state has been volatile — swinging between highs and lows. Prioritize stability and grounding.`;
            break;
        case 'stable':
            trajectoryNote = `Their mood has been stable. Follow their lead.`;
            break;
    }

    // Coping strength awareness
    let copingNote = '';
    if (state.copingStrength >= 0.7) {
        copingNote = 'Their coping ability is strong right now. You can be more collaborative and exploratory.';
    } else if (state.copingStrength <= 0.3) {
        copingNote = 'Their coping ability is low. Keep things simple, short, and supportive. Less is more.';
    }

    // Tool preferences
    let toolNote = '';
    if (state.engagementPattern.favorites.length > 0) {
        const favNames = state.engagementPattern.favorites.join(', ');
        toolNote = `Their preferred tools are: ${favNames}. Suggest these when appropriate.`;
    }
    if (state.engagementPattern.effectiveTools.length > 0) {
        const effNames = state.engagementPattern.effectiveTools.join(', ');
        toolNote += ` Tools that measurably improve their mood: ${effNames}.`;
    }

    // Recent context
    let contextNote = '';
    if (state.contextWindow.length > 0) {
        contextNote = 'RECENT CONTEXT (use subtly, do NOT recite back to user):\n' +
            state.contextWindow.map(c => `  - [${c.type}] ${c.summary}`).join('\n');
    }

    // Crisis history
    let crisisNote = '';
    if (state.lastCrisisFlag) {
        const daysSinceCrisis = Math.floor(
            (Date.now() - new Date(state.lastCrisisFlag).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCrisis <= 3) {
            crisisNote = `SENSITIVE: A crisis flag was triggered ${daysSinceCrisis} day(s) ago. Be extra gentle. Check in naturally about how they are feeling.`;
        }
    }

    return `You are Silent Help — a compassionate, intelligent AI wellness companion.

CURRENT USER PROFILE:
- Archetype: ${state.currentArchetype}
- Energy baseline: ${wellnessProfile?.energy || 'unknown'}
- Primary concern: ${wellnessProfile?.concern || 'general wellness'}
- Coping strength: ${state.copingStrength}/1.0
- Mood trajectory: ${state.emotionalTrajectory.direction} (avg: ${state.emotionalTrajectory.average}/10)

YOUR PERSONALITY FOR THIS USER:
- Tone: ${baseTone}
- Style: ${baseStyle}
${avoidTopics.length > 0 ? `- AVOID: ${avoidTopics.join(', ')}` : ''}

SESSION CONTEXT:
- ${timeGreeting}. ${familiarityNote}
${returningNote ? `- ${returningNote}` : ''}
${trajectoryNote ? `- ${trajectoryNote}` : ''}
${copingNote ? `- ${copingNote}` : ''}
${toolNote ? `- ${toolNote}` : ''}

${contextNote ? contextNote + '\n' : ''}${crisisNote ? crisisNote + '\n' : ''}
CORE GUIDELINES:
1. You are NOT a therapist. Never diagnose or prescribe.
2. Match response length to their coping strength. Low coping = shorter, simpler responses.
3. Always validate feelings BEFORE offering suggestions.
4. Be genuine. No toxic positivity. No "just think positive."
5. If they mention harm, ALWAYS provide crisis resources.
6. Reference their patterns and progress subtly — don't lecture.
7. Their wellbeing matters more than any conversation goal.

${getCrisisSystemPrompt()}`;
}

// ═══════════════════════════════════════════════
// GENERATE DYNAMIC OPENING MESSAGE
// ═══════════════════════════════════════════════

export function generateOpeningContext(state: ComputedUserState): string {
    const { timeOfDay, isReturningUser, daysSinceLastSession, emotionalTrajectory, sessionCount } = state;

    if (!isReturningUser || sessionCount === 1) {
        return ''; // Let the AI personality handle the first opening
    }

    const parts: string[] = [];

    // Time awareness
    if (timeOfDay === 'night') {
        parts.push('I notice it is late');
    }

    // Gap awareness
    if (daysSinceLastSession >= 7) {
        parts.push(`it has been a while since we last talked`);
    }

    // Trajectory awareness
    if (emotionalTrajectory.direction === 'improving' && emotionalTrajectory.last7.length >= 3) {
        parts.push('your mood seems to have been trending upward');
    } else if (emotionalTrajectory.direction === 'declining' && emotionalTrajectory.last7.length >= 3) {
        parts.push('things seem to have been a bit harder lately');
    }

    if (parts.length === 0) return '';

    return `[CONTEXT FOR OPENING: ${parts.join(', ')}. Weave this into your greeting naturally — do not recite it verbatim.]`;
}
