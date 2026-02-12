import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * GET /api/conversations — List all conversations for the current user
 */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    try {
        const conversations = await prisma.conversation.findMany({
            where: { userId: payload.userId },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { content: true, role: true, createdAt: true },
                },
            },
        });

        // Format: include last message preview
        const formatted = conversations.map(c => ({
            id: c.id,
            title: c.title || 'New conversation',
            lastMessage: c.messages[0]?.content?.slice(0, 100) || null,
            lastMessageRole: c.messages[0]?.role || null,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        }));

        return Response.json({ conversations: formatted });
    } catch (error) {
        console.error('List conversations error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
