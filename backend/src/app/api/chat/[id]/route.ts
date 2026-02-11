import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * GET /api/chat/[id] — Get conversation with messages
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;

    try {
        const conversation = await prisma.conversation.findFirst({
            where: { id, userId: payload.userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!conversation) {
            return Response.json({ error: 'Conversation not found' }, { status: 404 });
        }

        return Response.json({ conversation });
    } catch (error) {
        console.error('Get conversation error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/chat/[id] — Delete a conversation
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;

    try {
        const conversation = await prisma.conversation.findFirst({
            where: { id, userId: payload.userId },
        });

        if (!conversation) {
            return Response.json({ error: 'Conversation not found' }, { status: 404 });
        }

        await prisma.conversation.delete({ where: { id } });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Delete conversation error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
