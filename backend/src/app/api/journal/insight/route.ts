import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * POST /api/journal/insight — Generate AI insight from recent journal entries
 */
export async function POST(req: NextRequest) {
    const payload = getUserFromRequest(req);
    if (!payload) return unauthorizedResponse();

    try {
        // Get last 7 journal entries
        const entries = await prisma.journalEntry.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
            take: 7,
        });

        if (entries.length < 2) {
            return Response.json({
                insight: null,
                message: 'Write at least 2 journal entries to unlock AI insights.',
            });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return Response.json({
                insight: 'AI insights are currently unavailable. Please configure the Gemini API key.',
                message: 'API key missing',
            });
        }

        const ai = new GoogleGenAI({ apiKey });

        const journalText = entries
            .reverse()
            .map((e, i) => {
                const date = new Date(e.createdAt).toLocaleDateString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short',
                });
                return `Entry ${i + 1} (${date})${e.mood ? ` [Mood: ${e.mood}]` : ''}:\n${e.content}`;
            })
            .join('\n\n---\n\n');

        const prompt = `You are a compassionate wellness companion analyzing someone's private journal entries. Your goal is to identify emotional patterns, hidden stressors, and positive moments they might not have noticed themselves.

Here are their most recent journal entries (oldest to newest):

${journalText}

Please provide a brief, warm, insightful analysis (3-4 paragraphs max) that:
1. Identifies any emotional patterns or recurring themes
2. Highlights positive moments or signs of growth they may have overlooked
3. Gently notes any potential stressors worth being mindful of
4. Ends with one actionable, compassionate suggestion

Important: Be warm and encouraging, not clinical. Write as a caring friend, not a therapist. Do NOT diagnose anything. Use "I notice" language rather than definitive statements.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        const insight = response.text || 'Unable to generate insight at this time.';

        return Response.json({ insight, entryCount: entries.length });
    } catch (error) {
        console.error('Journal insight error:', error);
        return Response.json({ error: 'Failed to generate insight' }, { status: 500 });
    }
}
