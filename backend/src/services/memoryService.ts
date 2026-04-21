/**
 * Memory service — CRUD for user-blessed long-term memories,
 * backed by pgvector for semantic retrieval during chat.
 */
import prisma from '@/lib/prisma';
import { embed, toPgVector } from '@/lib/ai/provider';
import type { MemoryKind } from '@/contracts/schemas';
import { logger } from '@/lib/logger';

export interface MemoryRecord {
    id: string;
    content: string;
    kind: string;
    salience: number;
    source: string;
    createdAt: Date;
    updatedAt: Date;
    lastUsedAt: Date | null;
}

export async function createMemory(params: {
    userId: string;
    content: string;
    kind: MemoryKind;
    source?: 'user' | 'ai';
}): Promise<MemoryRecord> {
    const { userId, content, kind, source = 'user' } = params;

    let vectorLiteral: string | null = null;
    let model: string | null = null;
    try {
        const e = await embed(content);
        vectorLiteral = toPgVector(e.vector);
        model = e.model;
    } catch (err) {
        logger.warn({ err: String(err) }, 'memory.embed_failed');
    }

    const rows = await prisma.$queryRaw<{
        id: string;
        content: string;
        kind: string;
        salience: number;
        source: string;
        created_at: Date;
        updated_at: Date;
        last_used_at: Date | null;
    }[]>`
        INSERT INTO memories (id, user_id, content, kind, salience, source, embedding, embedding_model, created_at, updated_at)
        VALUES (gen_random_uuid(), ${userId}::uuid, ${content}, ${kind}, 1.0, ${source},
                ${vectorLiteral}::vector, ${model}, NOW(), NOW())
        RETURNING id, content, kind, salience, source, created_at, updated_at, last_used_at
    `;
    const r = rows[0];
    return {
        id: r.id,
        content: r.content,
        kind: r.kind,
        salience: r.salience,
        source: r.source,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        lastUsedAt: r.last_used_at,
    };
}

export async function listMemories(userId: string, limit = 100): Promise<MemoryRecord[]> {
    const rows = await prisma.memory.findMany({
        where: { userId },
        orderBy: [{ salience: 'desc' }, { updatedAt: 'desc' }],
        take: limit,
        select: {
            id: true,
            content: true,
            kind: true,
            salience: true,
            source: true,
            createdAt: true,
            updatedAt: true,
            lastUsedAt: true,
        },
    });
    return rows;
}

export async function deleteMemory(userId: string, id: string): Promise<boolean> {
    const r = await prisma.memory.deleteMany({ where: { id, userId } });
    return r.count > 0;
}

/**
 * Find memories most relevant to `text` via cosine similarity.
 * Returns top-K rows, updates lastUsedAt for analytics.
 */
export async function retrieveRelevantMemories(
    userId: string,
    text: string,
    k = 4,
): Promise<MemoryRecord[]> {
    const { vector } = await embed(text);
    const literal = toPgVector(vector);
    const rows = await prisma.$queryRaw<{
        id: string;
        content: string;
        kind: string;
        salience: number;
        source: string;
        created_at: Date;
        updated_at: Date;
        last_used_at: Date | null;
        similarity: number;
    }[]>`
        SELECT id, content, kind, salience, source, created_at, updated_at, last_used_at,
               1 - (embedding <=> ${literal}::vector) AS similarity
        FROM memories
        WHERE user_id = ${userId}::uuid
          AND embedding IS NOT NULL
        ORDER BY embedding <=> ${literal}::vector
        LIMIT ${k}
    `;
    if (rows.length > 0) {
        const ids = rows.map((r) => r.id);
        await prisma.memory.updateMany({
            where: { id: { in: ids } },
            data: { lastUsedAt: new Date() },
        });
    }
    return rows.map((r) => ({
        id: r.id,
        content: r.content,
        kind: r.kind,
        salience: r.salience,
        source: r.source,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        lastUsedAt: r.last_used_at,
    }));
}
