/**
 * Agentic tool-use layer for chat v2.
 *
 * The companion can invoke a small, **allow-listed** set of read-only internal
 * tools during a reply. Tools are transparent — every invocation is returned to
 * the UI so the user can see exactly which of their own data the AI used and
 * how (Art 22 automated-decision-making transparency).
 *
 * Hard constraints — these are the regulatory guardrails:
 *   - tools are **read-only** on the user's own data (no writes, no deletes);
 *   - tools never leave the service perimeter (no web/fs/exec tools);
 *   - `childMode:true` users get the same tools (they run locally anyway);
 *   - every tool call is rate-limited and audit-logged at the caller level.
 *
 * The tool dispatcher takes the raw user message, decides (via a compact
 * self-hosted JSON-only "planner" prompt) which tools are worth calling,
 * runs them in parallel, and returns a compact context block that can be
 * pasted into the system prompt alongside the RAG block.
 *
 * If the planner or any tool fails, we degrade gracefully — the assistant
 * still replies using the plain RAG pipeline.
 */
import prisma from '@/lib/prisma';
import { generate as aiGenerate } from '@/lib/ai/provider';
import { logger } from '@/lib/logger';
import { decryptForUser } from '@/lib/encryption';

export type ToolId =
    | 'search_journal'
    | 'get_mood_trend'
    | 'recall_safety_plan'
    | 'suggest_grounding_tool'
    | 'recommend_clinical_checkin';

export interface ToolInvocation {
    tool: ToolId;
    args?: Record<string, unknown>;
    /** Short human-readable summary of what this call did/found — shown as a chip. */
    summary: string;
    /** Optional machine-readable payload the LLM can cite. */
    data?: unknown;
    /** Source for Art 22 transparency: "I looked at the user's X". */
    source: string;
    ok: boolean;
}

export interface ToolUseContext {
    /** Rendered block to paste into the system prompt (empty if no tools ran). */
    block: string;
    /** Shown as chips in the UI. */
    invocations: ToolInvocation[];
}

/* ─────────────────────────── Planner ─────────────────────────── */

interface PlannerPlan {
    tools: Array<{ tool: ToolId; args?: Record<string, unknown> }>;
    reason: string;
}

const PLANNER_SYSTEM = `You are the tool-planner for a mental-wellness companion.
You DO NOT write any user-facing text. You only return a compact JSON plan.

Available tools (all read-only on the user's own data):
- search_journal(q: string) — find up to 5 recent journal entries semantically similar to q.
- get_mood_trend(days: number) — return the user's mood scores for the last N days (<=30).
- recall_safety_plan() — return the user's saved safety plan (warning signs, coping, contacts).
- suggest_grounding_tool(emotion: string) — pick the best in-app grounding exercise for the emotion.
- recommend_clinical_checkin(reason: string) — surface a PHQ-9/GAD-7 re-check if they haven't done one in 14+ days.

Rules:
- Only include tools that are clearly useful for THIS message. Zero or one is fine.
- NEVER call more than 3 tools in one plan.
- Output STRICT JSON with shape: {"tools":[{"tool":"...","args":{...}}], "reason":"…"}.
- Return {"tools":[],"reason":"n/a"} when nothing is useful (small-talk, greetings).
- NEVER call tools on messages that look like a mental-health crisis — the safety layer handles those.
- Do not invent tools. Do not add commentary. Do not wrap in code fences.`;

function tryParseJSON(text: string): PlannerPlan | null {
    if (!text) return null;
    const cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
    try {
        const parsed = JSON.parse(cleaned) as PlannerPlan;
        if (!parsed || !Array.isArray(parsed.tools)) return null;
        return parsed;
    } catch {
        // Try to extract the first {...} block.
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (!m) return null;
        try {
            return JSON.parse(m[0]) as PlannerPlan;
        } catch {
            return null;
        }
    }
}

/**
 * Run the planner with a tight budget. Self-hosted via `aiGenerate` — when
 * `forceLocal:true` (Children's Code) the planner still runs on the local tier.
 */
async function planTools(params: {
    userMessage: string;
    emotion: string;
    crisis: boolean;
    forceLocal: boolean;
}): Promise<PlannerPlan> {
    if (params.crisis) return { tools: [], reason: 'crisis — bypassed' };
    try {
        const r = await aiGenerate({
            system: PLANNER_SYSTEM,
            turns: [
                {
                    role: 'user',
                    content: `User message: "${params.userMessage.slice(0, 600)}"\nEmotion: ${params.emotion}\nReturn the JSON plan.`,
                },
            ],
            maxTokens: 220,
            temperature: 0,
            forceLocal: params.forceLocal,
        });
        const plan = tryParseJSON(r.text);
        return plan ?? { tools: [], reason: 'planner_fallback' };
    } catch (e) {
        logger.warn({ err: String(e) }, 'toolUse.planner_failed');
        return { tools: [], reason: 'planner_error' };
    }
}

/* ─────────────────────────── Tool implementations ─────────────────────────── */

async function runSearchJournal(userId: string, q: unknown): Promise<ToolInvocation> {
    const query = typeof q === 'string' ? q.trim() : '';
    try {
        // Journal bodies are encrypted at rest, so we can't do a SQL LIKE on them.
        // We decrypt the last 20 entries in memory and filter. Bounded N keeps this cheap.
        const rows = await prisma.journalEntry.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { id: true, content: true, cipherText: true, mood: true, createdAt: true },
        });
        const decoded = rows.map((r) => ({
            id: r.id,
            mood: r.mood,
            when: r.createdAt.toISOString().slice(0, 10),
            preview: decryptForUser(userId, r.cipherText, r.content).slice(0, 160),
        }));
        const qLower = query.toLowerCase();
        const hits = qLower
            ? decoded.filter(
                  (d) =>
                      d.preview.toLowerCase().includes(qLower) ||
                      (d.mood && d.mood.toLowerCase().includes(qLower)),
              )
            : decoded;
        const capped = hits.slice(0, 5);
        return {
            tool: 'search_journal',
            args: { q: query },
            summary: capped.length
                ? `journal · ${capped.length} match${capped.length === 1 ? '' : 'es'}${query ? ` for “${query.slice(0, 30)}”` : ''}`
                : `journal · no matches${query ? ` for “${query.slice(0, 30)}”` : ''}`,
            data: capped,
            source: "user's own journal entries",
            ok: true,
        };
    } catch (e) {
        logger.warn({ err: String(e) }, 'toolUse.search_journal.failed');
        return {
            tool: 'search_journal',
            args: { q: query },
            summary: 'journal · lookup failed',
            source: "user's own journal entries",
            ok: false,
        };
    }
}

async function runMoodTrend(userId: string, days: unknown): Promise<ToolInvocation> {
    const n = Math.max(1, Math.min(30, Number(days) || 7));
    try {
        const since = new Date(Date.now() - n * 24 * 3600 * 1000);
        const rows = await prisma.moodLog.findMany({
            where: { userId, createdAt: { gte: since } },
            orderBy: { createdAt: 'asc' },
            select: { intensity: true, createdAt: true, mood: true },
        });
        const avg =
            rows.length > 0
                ? Number((rows.reduce((s, r) => s + (r.intensity ?? 0), 0) / rows.length).toFixed(2))
                : null;
        return {
            tool: 'get_mood_trend',
            args: { days: n },
            summary:
                rows.length === 0
                    ? `mood · no check-ins in last ${n}d`
                    : `mood · ${rows.length} in ${n}d · avg ${avg ?? '—'}/10`,
            data: {
                count: rows.length,
                avg,
                series: rows.map((r) => ({ when: r.createdAt.toISOString(), intensity: r.intensity, mood: r.mood })),
            },
            source: "user's own mood check-ins",
            ok: true,
        };
    } catch (e) {
        logger.warn({ err: String(e) }, 'toolUse.mood_trend.failed');
        return {
            tool: 'get_mood_trend',
            args: { days: n },
            summary: 'mood · lookup failed',
            source: "user's own mood check-ins",
            ok: false,
        };
    }
}

async function runSafetyPlan(userId: string): Promise<ToolInvocation> {
    try {
        const plan = await prisma.safetyPlan.findUnique({ where: { userId } });
        if (!plan) {
            return {
                tool: 'recall_safety_plan',
                summary: 'safety plan · not set',
                source: "user's own safety plan",
                ok: true,
            };
        }
        return {
            tool: 'recall_safety_plan',
            summary: 'safety plan · recalled',
            data: {
                warningSigns: plan.warningSigns,
                copingStrategies: plan.copingStrategies,
                reasonsToLive: plan.reasonsToLive,
                supportPeople: plan.supportPeople,
                professionals: plan.professionals,
                safeSpaces: plan.safeSpaces,
            },
            source: "user's own safety plan",
            ok: true,
        };
    } catch (e) {
        logger.warn({ err: String(e) }, 'toolUse.safety_plan.failed');
        return {
            tool: 'recall_safety_plan',
            summary: 'safety plan · lookup failed',
            source: "user's own safety plan",
            ok: false,
        };
    }
}

function runGroundingTool(emotion: unknown): ToolInvocation {
    const e = String(emotion || '').toLowerCase();
    const map: Record<string, { id: string; label: string; href: string }> = {
        anxious: { id: 'box-breathing', label: 'Box breathing · 3 min', href: '/tools?tool=box-breathing' },
        overwhelmed: { id: 'grounding-54321', label: '5-4-3-2-1 grounding', href: '/tools?tool=grounding-54321' },
        frustrated: { id: 'tipp', label: 'TIPP reset', href: '/tools?tool=tipp' },
        sad: { id: 'self-compassion', label: 'Self-compassion break', href: '/tools?tool=self-compassion' },
        pressure: { id: 'brain-dump', label: 'Brain dump', href: '/tools?tool=brain-dump' },
    };
    const pick = map[e] ?? map.anxious;
    return {
        tool: 'suggest_grounding_tool',
        args: { emotion: e || 'neutral' },
        summary: `tool · ${pick.label}`,
        data: pick,
        source: 'Silent Help grounding tools',
        ok: true,
    };
}

async function runClinicalCheckIn(userId: string, reason: unknown): Promise<ToolInvocation> {
    try {
        const last = await prisma.clinicalResult.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true, instrument: true },
        });
        const days = last ? Math.round((Date.now() - last.createdAt.getTime()) / 86_400_000) : Number.POSITIVE_INFINITY;
        const due = days >= 14;
        return {
            tool: 'recommend_clinical_checkin',
            args: { reason: String(reason || '').slice(0, 120) },
            summary: due
                ? last
                    ? `clinical · ${last.instrument} was ${days}d ago — re-check suggested`
                    : 'clinical · first check-in suggested'
                : `clinical · last check-in ${days}d ago (not due)`,
            data: { due, days, lastInstrument: last?.instrument ?? null },
            source: "user's own clinical check-in history",
            ok: true,
        };
    } catch (e) {
        logger.warn({ err: String(e) }, 'toolUse.clinical_checkin.failed');
        return {
            tool: 'recommend_clinical_checkin',
            summary: 'clinical · lookup failed',
            source: "user's own clinical check-in history",
            ok: false,
        };
    }
}

/* ─────────────────────────── Dispatcher ─────────────────────────── */

const ALLOWLIST: ReadonlySet<ToolId> = new Set<ToolId>([
    'search_journal',
    'get_mood_trend',
    'recall_safety_plan',
    'suggest_grounding_tool',
    'recommend_clinical_checkin',
]);

function renderBlock(invocations: ToolInvocation[]): string {
    if (invocations.length === 0) return '';
    const lines = ['— Context from the user\'s own data (via transparent tool-use) —'];
    for (const inv of invocations) {
        if (!inv.ok) continue;
        lines.push(`• ${inv.summary}`);
        if (inv.data && typeof inv.data === 'object') {
            const excerpt = JSON.stringify(inv.data).slice(0, 420);
            lines.push(`  data: ${excerpt}`);
        }
    }
    lines.push('— End tool context —');
    lines.push(
        '(Use this context only if it genuinely helps the current moment. Refer to it naturally — never quote JSON. Always respect the user\'s tone.)',
    );
    return lines.join('\n');
}

export async function runToolUse(params: {
    userId: string;
    userMessage: string;
    emotion: string;
    crisis: boolean;
    forceLocal: boolean;
}): Promise<ToolUseContext> {
    const plan = await planTools({
        userMessage: params.userMessage,
        emotion: params.emotion,
        crisis: params.crisis,
        forceLocal: params.forceLocal,
    });

    const selected = plan.tools
        .filter((t) => t && ALLOWLIST.has(t.tool))
        .slice(0, 3);

    if (selected.length === 0) {
        return { block: '', invocations: [] };
    }

    const results = await Promise.all(
        selected.map(async (t): Promise<ToolInvocation> => {
            switch (t.tool) {
                case 'search_journal':
                    return runSearchJournal(params.userId, (t.args as Record<string, unknown>)?.q);
                case 'get_mood_trend':
                    return runMoodTrend(params.userId, (t.args as Record<string, unknown>)?.days);
                case 'recall_safety_plan':
                    return runSafetyPlan(params.userId);
                case 'suggest_grounding_tool':
                    return runGroundingTool((t.args as Record<string, unknown>)?.emotion ?? params.emotion);
                case 'recommend_clinical_checkin':
                    return runClinicalCheckIn(params.userId, (t.args as Record<string, unknown>)?.reason);
                default:
                    return {
                        tool: t.tool,
                        summary: 'unknown tool · skipped',
                        source: 'n/a',
                        ok: false,
                    };
            }
        }),
    );

    return { block: renderBlock(results), invocations: results };
}
