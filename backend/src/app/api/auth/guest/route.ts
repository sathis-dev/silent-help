import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { signToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/auth/guest — Issue a short-lived JWT for an anonymous guest session.
 *
 * The returned token is signed with JWT_SECRET and carries a random UUID as the
 * userId, scoped to a single browser/device. Guests keep it in localStorage and
 * attach it to every API call so journal / mood / chat / onboarding endpoints
 * stop returning 401 when the user has chosen the guest flow instead of Clerk
 * sign-in.
 *
 * We also create a matching row in the User table so foreign-key constraints on
 * JournalEntry / MoodLog / Conversation / Message don't reject writes from the
 * new guest userId.
 */
export async function POST(_req: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
    try {
        const userId = crypto.randomUUID();

        await prisma.user.create({
            data: {
                id: userId,
                email: `guest_${userId.substring(0, 8)}@guest.silenthelp.local`,
                passwordHash: 'guest-session',
                name: 'Guest',
            },
        });

        const token = signToken({ userId, email: '' });

        return Response.json({
            token,
            userId,
        });
    } catch (error) {
        console.error('Guest auth error:', error);
        return Response.json({ error: 'Failed to issue guest token' }, { status: 500 });
    }
}
