import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();

        // Validation
        if (!email || !password || !name) {
            return Response.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return Response.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return Response.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password & create user
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { email, passwordHash, name },
        });

        // Generate token
        const token = signToken({ userId: user.id, email: user.email });

        return Response.json({
            token,
            user: { id: user.id, email: user.email, name: user.name },
        }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
