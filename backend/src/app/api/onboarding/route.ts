import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWellnessProfile, buildAIAnalysisPrompt, type OnboardingAnswers } from '@/lib/recommendations';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Valid energy values (step 1 is always fixed)
const VALID_ENERGY = ['high', 'moderate', 'low'];

/**
 * POST /api/onboarding
 * Process 6-step dynamic onboarding and generate personalized wellness profile.
 * Steps 2-6 are dynamically generated so we validate loosely — trust the frontend engine.
 */
export async function POST(req: NextRequest) {
    try {
        const payload = getUserFromRequest(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { energy, concern, context, approach, support_style, time } = body;

        // Validate required fields exist
        if (!VALID_ENERGY.includes(energy)) return NextResponse.json({ error: 'Invalid energy value' }, { status: 400 });
        if (!concern || typeof concern !== 'string') return NextResponse.json({ error: 'Missing concern' }, { status: 400 });
        if (!context || typeof context !== 'string') return NextResponse.json({ error: 'Missing context' }, { status: 400 });
        if (!approach || typeof approach !== 'string') return NextResponse.json({ error: 'Missing approach' }, { status: 400 });
        if (!support_style || typeof support_style !== 'string') return NextResponse.json({ error: 'Missing support_style' }, { status: 400 });
        if (!time || typeof time !== 'string') return NextResponse.json({ error: 'Missing time' }, { status: 400 });

        const answers: OnboardingAnswers = { energy, concern, context, approach, support_style, time };

        // Layer 1: Rule-based recommendation engine
        const profile = generateWellnessProfile(answers);

        // Layer 2: AI-generated personalized insight
        let aiInsight = '';
        try {
            const aiResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'user', content: buildAIAnalysisPrompt(answers, profile.archetype) },
                ],
                max_tokens: 200,
                temperature: 0.8,
            });
            aiInsight = aiResponse.choices[0]?.message?.content?.trim() || '';
        } catch {
            // AI is optional — rule engine always works
            aiInsight = `You're experiencing ${answers.concern} with ${answers.energy} energy. Let's start with what matters most to you — ${answers.approach}.`;
        }

        // Save to database (upsert — overwrite if they redo onboarding)
        await prisma.wellnessProfile.upsert({
            where: { userId: payload.userId },
            create: {
                userId: payload.userId,
                energy: answers.energy,
                concern: answers.concern,
                context: answers.context,
                approach: answers.approach,
                supportStyle: answers.support_style,
                timeAvailable: answers.time,
                profile: JSON.parse(JSON.stringify(profile)),
                aiInsight,
            },
            update: {
                energy: answers.energy,
                concern: answers.concern,
                context: answers.context,
                approach: answers.approach,
                supportStyle: answers.support_style,
                timeAvailable: answers.time,
                profile: JSON.parse(JSON.stringify(profile)),
                aiInsight,
            },
        });

        return NextResponse.json({
            success: true,
            profile: {
                ...profile,
                aiInsight,
            },
        });
    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json({ error: 'Failed to process onboarding' }, { status: 500 });
    }
}

/**
 * GET /api/onboarding
 * Retrieve saved wellness profile for current user
 */
export async function GET(req: NextRequest) {
    try {
        const payload = getUserFromRequest(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const saved = await prisma.wellnessProfile.findUnique({
            where: { userId: payload.userId },
        });

        if (!saved) {
            return NextResponse.json({ hasProfile: false, profile: null });
        }

        return NextResponse.json({
            hasProfile: true,
            profile: {
                ...saved.profile as Record<string, unknown>,
                aiInsight: saved.aiInsight,
                answers: {
                    energy: saved.energy,
                    concern: saved.concern,
                    context: saved.context,
                    approach: saved.approach,
                    support_style: saved.supportStyle,
                    time: saved.timeAvailable,
                },
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
    }
}
