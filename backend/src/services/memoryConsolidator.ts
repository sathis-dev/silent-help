/**
 * Long-term memory consolidation for chat v2.
 *
 * After a user has had ~6 exchanges in a conversation, we summarise the
 * conversation into 1–3 durable `Memory` rows. These memories surface in
 * future RAG, so week-6 chat has continuity with week-1 chat without us
 * stuffing 50 past messages into the prompt.
 *
 * Privacy & compliance:
 *  - `childMode:true` users: consolidation runs on the **local** tier only
 *    (`forceLocal:true`) — their data never reaches Gemini/OpenAI.
 *  - Users can disable consolidation via consent withdrawal at `/settings/data`
 *    — we check `users.consented_at` before running.
 *  - Every consolidation writes a row with `source='ai'` and the user can
 *    view/delete them in `/settings/data` (Art 17).
 *  - Consolidation is fire-and-forget from the chat route — failure never
 *    blocks the user's reply.
 */
import prisma from '@/lib/prisma';
import { generate as aiGenerate, embed, toPgVector } from '@/lib/ai/provider';
import { logger } from '@/lib/logger';

const CONSOLIDATE_EVERY_N_EXCHANGES = 6;
const MAX_MEMORIES_PER_CONSOLIDATION = 3;

const CONSOLIDATOR_SYSTEM = `You extract durable, useful memories from a mental-wellness chat transcript.

A "good" memory is:
- A specific, lasting fact about the user that would help a companion recall them later.
- Something the user would be OK with being remembered (preferences, goals, boundaries, relationships, recurring stressors, coping strategies that helped).

Avoid:
- Fleeting moods ("they were sad today"). Only note patterns.
- Medical details that could read as diagnosis.
- Sensitive information the user didn't emphasise (religion, politics, sexual orientation) — only record if they explicitly asked to be remembered.
- Anything inferred about third parties.

Output STRICT JSON: {"memories":[{"content":"…","kind":"context|preference|goal|boundary|relationship|event"}]} — up to 3 items. If none qualify, return {"memories":[]}.
Keep each memory under 180 characters, written as a third-person fact ("The user prefers journaling in the evening.").
No markdown, no code fences, no commentary.`;

interface ConsolidatedMemory {
    content: string;
    kind: 'context' | 'preference' | 'goal' | 'boundary' | 'relationship' | 'event';
}

function tryParseJSON(text: string): ConsolidatedMemory[] {
    if (!text) return [];
    const cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
    try {
        const parsed = JSON.parse(cleaned) as { memories?: ConsolidatedMemory[] };
        if (!Array.isArray(parsed.memories)) return [];
        return parsed.memories.slice(0, MAX_MEMORIES_PER_CONSOLIDATION);
    } catch {
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (!m) return [];
        try {
            const parsed = JSON.parse(m[0]) as { memories?: ConsolidatedMemory[] };
            return Array.isArray(parsed.memories) ? parsed.memories.slice(0, MAX_MEMORIES_PER_CONSOLIDATION) : [];
        } catch {
            return [];
        }
    }
}

export async function maybeConsolidate(params: {
    userId: string;
    conversationId: string;
    forceLocal: boolean;
}): Promise<{ created: number }> {
    const { userId, conversationId, forceLocal } = params;
    try {
        // Only consolidate if the user has given Art 9 explicit consent (they must
        // have a consentedAt for us to persist any inferred mental-health data).
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { consentedAt: true },
        });
        if (!user?.consentedAt) return { created: 0 };

        // Count exchanges so we only consolidate every Nth turn.
        const counts = await prisma.message.groupBy({
            by: ['role'],
            where: { conversationId },
            _count: { _all: true },
        });
        const userCount = counts.find((c) => c.role === 'user')?._count?._all ?? 0;
        if (userCount === 0 || userCount % CONSOLIDATE_EVERY_N_EXCHANGES !== 0) return { created: 0 };

        // Don't duplicate: if we already have an AI-memory derived from this
        // conversation in the last 30 days, skip.
        const lastRecent = await prisma.memory.findFirst({
            where: {
                userId,
                source: 'ai',
                createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (lastRecent && userCount - CONSOLIDATE_EVERY_N_EXCHANGES < CONSOLIDATE_EVERY_N_EXCHANGES) {
            return { created: 0 };
        }

        // Pull the most recent 24 messages of this conversation for the summariser.
        const history = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: 24,
            select: { role: true, content: true },
        });
        const transcript = history
            .reverse()
            .map((m) => `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content.slice(0, 500)}`)
            .join('\n');

        const r = await aiGenerate({
            system: CONSOLIDATOR_SYSTEM,
            turns: [
                {
                    role: 'user',
                    content: `Transcript:\n${transcript}\n\nReturn the JSON memories.`,
                },
            ],
            maxTokens: 320,
            temperature: 0.2,
            forceLocal,
        });
        const memories = tryParseJSON(r.text);
        if (memories.length === 0) return { created: 0 };

        let created = 0;
        for (const mem of memories) {
            const content = (mem.content || '').trim().slice(0, 300);
            if (content.length < 10) continue;
            const kind = ['context', 'preference', 'goal', 'boundary', 'relationship', 'event'].includes(mem.kind)
                ? mem.kind
                : 'context';
            // Compute embedding so the memory can be retrieved by future RAG.
            const vec = await embed(content).catch(() => null);
            const row = await prisma.memory.create({
                data: {
                    userId,
                    content,
                    kind,
                    source: 'ai',
                    embeddingModel: vec?.model ?? null,
                    salience: 0.75,
                },
                select: { id: true },
            });
            if (vec) {
                try {
                    await prisma.$executeRaw`
                        UPDATE memories
                        SET embedding = ${toPgVector(vec.vector)}::vector
                        WHERE id = ${row.id}::uuid
                    `;
                } catch (err) {
                    logger.warn({ err: String(err) }, 'memoryConsolidator.embedding_store_failed');
                }
            }
            created += 1;
        }
        return { created };
    } catch (e) {
        logger.warn({ err: String(e) }, 'memoryConsolidator.failed');
        return { created: 0 };
    }
}
