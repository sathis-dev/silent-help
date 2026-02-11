import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * GET /api/journal — List journal entries
 */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    try {
        const entries = await prisma.journalEntry.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return Response.json({ entries });
    } catch (error) {
        console.error('List journal error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/journal — Create journal entry
 */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    try {
        const { content, mood } = await req.json();

        if (!content?.trim()) {
            return Response.json({ error: 'Content is required' }, { status: 400 });
        }

        const entry = await prisma.journalEntry.create({
            data: {
                userId: payload.userId,
                content,
                mood: mood || null,
            },
        });

        return Response.json({ entry }, { status: 201 });
    } catch (error) {
        console.error('Create journal error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
