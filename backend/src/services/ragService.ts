/**
 * Retrieval-Augmented Generation — pulls the most relevant slices of a user's
 * history (memories, past journal entries, past chat turns) and formats them
 * as a compact context block to inject into a system prompt.
 *
 * Never retrieves more than N tokens worth — we keep chat prompts lean.
 */
import prisma from '@/lib/prisma';
import { embed, toPgVector } from '@/lib/ai/provider';
import { decryptForUser } from '@/lib/encryption';
import { retrieveRelevantMemories } from '@/services/memoryService';

export interface RagContext {
    block: string;      // rendered text block (empty if nothing useful)
    usedMemoryIds: string[];
    usedJournalIds: string[];
    usedMessageIds: string[];
}

const MAX_JOURNAL = 3;
const MAX_MESSAGES = 3;
const MAX_MEMORIES = 4;
const MAX_CHARS = 2400;

export async function buildRagContext(userId: string, query: string): Promise<RagContext> {
    const { vector } = await embed(query);
    const literal = toPgVector(vector);

    const [memories, journals, messages] = await Promise.all([
        retrieveRelevantMemories(userId, query, MAX_MEMORIES),
        prisma.$queryRaw<{
            id: string;
            content: string;
            cipher_text: string | null;
            mood: string | null;
            created_at: Date;
            similarity: number;
        }[]>`
            SELECT id, content, cipher_text, mood, created_at,
                   1 - (embedding <=> ${literal}::vector) AS similarity
            FROM journal_entries
            WHERE user_id = ${userId}::uuid
              AND embedding IS NOT NULL
            ORDER BY embedding <=> ${literal}::vector
            LIMIT ${MAX_JOURNAL}
        `,
        prisma.$queryRaw<{
            id: string;
            content: string;
            created_at: Date;
            similarity: number;
        }[]>`
            SELECT m.id, m.content, m.created_at,
                   1 - (m.embedding <=> ${literal}::vector) AS similarity
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.user_id = ${userId}::uuid
              AND m.role = 'user'
              AND m.embedding IS NOT NULL
            ORDER BY m.embedding <=> ${literal}::vector
            LIMIT ${MAX_MESSAGES}
        `,
    ]);

    const pieces: string[] = [];
    const usedMemoryIds: string[] = [];
    const usedJournalIds: string[] = [];
    const usedMessageIds: string[] = [];

    if (memories.length > 0) {
        pieces.push('Known about the user (they asked you to remember):');
        for (const m of memories) {
            usedMemoryIds.push(m.id);
            pieces.push(`• [${m.kind}] ${truncate(m.content, 180)}`);
        }
    }

    if (journals.length > 0) {
        pieces.push('');
        pieces.push('Related past journal entries:');
        for (const j of journals) {
            const plaintext = decryptForUser(userId, j.cipher_text, j.content);
            usedJournalIds.push(j.id);
            const when = formatWhen(j.created_at);
            const moodTag = j.mood ? ` (mood: ${j.mood})` : '';
            pieces.push(`• ${when}${moodTag}: "${truncate(plaintext, 180)}"`);
        }
    }

    if (messages.length > 0) {
        pieces.push('');
        pieces.push('Related things they said to you before:');
        for (const msg of messages) {
            usedMessageIds.push(msg.id);
            pieces.push(`• ${formatWhen(msg.created_at)}: "${truncate(msg.content, 160)}"`);
        }
    }

    let block = pieces.join('\n').trim();
    if (block.length > MAX_CHARS) block = block.slice(0, MAX_CHARS - 1) + '…';

    return { block, usedMemoryIds, usedJournalIds, usedMessageIds };
}

function truncate(s: string, n: number): string {
    if (!s) return '';
    const flat = s.replace(/\s+/g, ' ').trim();
    return flat.length <= n ? flat : flat.slice(0, n - 1) + '…';
}

function formatWhen(d: Date): string {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'earlier today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
}
