import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * POST /api/chat — Create a new conversation
 */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    try {
        const body = await req.json().catch(() => ({}));
        const title = body.title || null;

        const conversation = await prisma.conversation.create({
            data: {
                userId: payload.userId,
                title,
            },
        });

        return Response.json({ conversation }, { status: 201 });
    } catch (error) {
        console.error('Create conversation error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
