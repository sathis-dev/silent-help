import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
        });

        if (!user) return unauthorizedResponse('User not found');

        return Response.json({ user });
    } catch (error) {
        console.error('Auth/me error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
