/**
 * Journal service — encrypted at rest, embedded for semantic search.
 */
import prisma from '@/lib/prisma';
import { encryptForUser, decryptForUser, isEncryptionEnabled } from '@/lib/encryption';
import { embed, toPgVector } from '@/lib/ai/provider';
import { logger } from '@/lib/logger';

export interface JournalDto {
    id: string;
    content: string;
    mood: string | null;
    createdAt: Date;
    updatedAt: Date;
    encrypted: boolean;
}

export async function listJournal(userId: string, limit = 50): Promise<JournalDto[]> {
    const rows = await prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
    return rows.map((r) => ({
        id: r.id,
        content: decryptForUser(userId, r.cipherText, r.content),
        mood: r.mood,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        encrypted: Boolean(r.cipherText),
    }));
}

export async function createJournal(params: {
    userId: string;
    content: string;
    mood: string | null;
}): Promise<JournalDto> {
    const { userId, content, mood } = params;
    const { cipherText, plaintextFallback } = encryptForUser(userId, content);
    const useCipher = cipherText !== null;

    let vectorLiteral: string | null = null;
    let model: string | null = null;
    try {
        const e = await embed(content);
        vectorLiteral = toPgVector(e.vector);
        model = e.model;
    } catch (err) {
        logger.warn({ err: String(err) }, 'journal.embed_failed');
    }

    const rows = await prisma.$queryRaw<{
        id: string;
        content: string;
        cipher_text: string | null;
        mood: string | null;
        created_at: Date;
        updated_at: Date;
    }[]>`
        INSERT INTO journal_entries (id, user_id, content, cipher_text, mood, embedding, embedding_model, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            ${userId}::uuid,
            ${useCipher ? '[encrypted]' : (plaintextFallback ?? content)},
            ${cipherText},
            ${mood},
            ${vectorLiteral}::vector,
            ${model},
            NOW(),
            NOW()
        )
        RETURNING id, content, cipher_text, mood, created_at, updated_at
    `;
    const row = rows[0];
    return {
        id: row.id,
        content: decryptForUser(userId, row.cipher_text, row.content),
        mood: row.mood,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        encrypted: Boolean(row.cipher_text),
    };
}

export async function searchJournalSemantic(userId: string, query: string, limit = 8): Promise<Array<JournalDto & { similarity: number }>> {
    const { vector } = await embed(query);
    const literal = toPgVector(vector);
    const rows = await prisma.$queryRaw<{
        id: string;
        content: string;
        cipher_text: string | null;
        mood: string | null;
        created_at: Date;
        updated_at: Date;
        similarity: number;
    }[]>`
        SELECT id, content, cipher_text, mood, created_at, updated_at,
               1 - (embedding <=> ${literal}::vector) AS similarity
        FROM journal_entries
        WHERE user_id = ${userId}::uuid
          AND embedding IS NOT NULL
        ORDER BY embedding <=> ${literal}::vector
        LIMIT ${limit}
    `;
    return rows.map((r) => ({
        id: r.id,
        content: decryptForUser(userId, r.cipher_text, r.content),
        mood: r.mood,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        encrypted: Boolean(r.cipher_text),
        similarity: r.similarity,
    }));
}

export { isEncryptionEnabled };
