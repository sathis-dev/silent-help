import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const questions = await prisma.assessmentQuestion.findMany({
            orderBy: [
                { stepNumber: 'asc' },
                { routeGroup: 'asc' }
            ]
        });
        
        // Group them by step and route to make it ultra easy for the frontend React components
        // e.g., tree[1]['shared'] gives the first question
        const tree: Record<number, Record<string, any>> = {};
        for (const q of questions) {
            if (!tree[q.stepNumber]) tree[q.stepNumber] = {};
            tree[q.stepNumber][q.routeGroup] = q;
        }

        return NextResponse.json({ success: true, questions, tree });
    } catch (error) {
        console.error('Fetch questions error:', error);
        return NextResponse.json({ error: 'Failed to fetch assessment questions' }, { status: 500 });
    }
}
