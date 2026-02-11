import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * POST /api/mood — Log a mood entry
 */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    try {
        const { mood, intensity, note } = await req.json();

        if (!mood) {
            return Response.json({ error: 'Mood is required' }, { status: 400 });
        }

        const moodLog = await prisma.moodLog.create({
            data: {
                userId: payload.userId,
                mood,
                intensity: Math.min(10, Math.max(1, intensity || 5)),
                note: note || null,
            },
        });

        return Response.json({ moodLog }, { status: 201 });
    } catch (error) {
        console.error('Log mood error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * GET /api/mood — Get mood history
 */
export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    try {
        const logs = await prisma.moodLog.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });

        return Response.json({ logs });
    } catch (error) {
        console.error('Get mood logs error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
