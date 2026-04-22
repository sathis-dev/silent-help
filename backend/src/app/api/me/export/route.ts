import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { decryptForUser } from '@/lib/encryption';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requestLogger } from '@/lib/logger';
import { audit } from '@/lib/audit';

/**
 * GET /api/me/export — GDPR data export. Returns a JSON payload containing
 * every row we have for the current user (journal entries decrypted in-place).
 */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();
    const log = requestLogger(req);

    const rl = await rateLimit({ key: `export:${payload.userId}`, limit: 3, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl);

    try {
        const userId = payload.userId;
        const [user, wellnessProfile, userState, conversations, journalEntries, moodLogs, toolUsage, memories, safetyPlan, reminders] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.wellnessProfile.findUnique({ where: { userId } }),
            prisma.userState.findUnique({ where: { userId } }),
            prisma.conversation.findMany({
                where: { userId },
                include: { messages: { orderBy: { createdAt: 'asc' } } },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
            prisma.moodLog.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
            prisma.toolUsage.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
            prisma.memory.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
            prisma.safetyPlan.findUnique({ where: { userId } }),
            prisma.reminder.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
        ]);

        const safeUser = user ? { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt } : null;
        const journals = journalEntries.map((j) => ({
            id: j.id,
            mood: j.mood,
            content: decryptForUser(userId, j.cipherText, j.content),
            createdAt: j.createdAt,
        }));

        const payloadOut = {
            exportedAt: new Date().toISOString(),
            schemaVersion: 1,
            user: safeUser,
            wellnessProfile,
            userState,
            conversations: conversations.map((c) => ({
                id: c.id,
                title: c.title,
                createdAt: c.createdAt,
                messages: c.messages.map((m) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    createdAt: m.createdAt,
                })),
            })),
            journalEntries: journals,
            moodLogs,
            toolUsage,
            memories: memories.map((m) => ({
                id: m.id,
                kind: m.kind,
                content: m.content,
                createdAt: m.createdAt,
            })),
            safetyPlan,
            reminders,
        };

        await audit({
            req,
            userId,
            action: 'me.export',
            meta: { journalCount: journals.length, conversationCount: conversations.length },
        });

        return new Response(JSON.stringify(payloadOut, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="silent-help-export-${userId.slice(0, 8)}.json"`,
            },
        });
    } catch (e) {
        log.error({ err: String(e) }, 'me.export.failed');
        return Response.json({ error: 'Could not generate export' }, { status: 500 });
    }
}
