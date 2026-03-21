import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWellnessProfile, buildAIAnalysisPrompt } from '@/lib/recommendations';
import OpenAI from 'openai';

function getOpenAI() {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
}

export async function POST(req: NextRequest) {
    try {
        const payload = getUserFromRequest(req);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { finalRoute, answerLog } = body; 
        // finalRoute: 'FINISH_LOW' | 'FINISH_MID' | 'FINISH_HIGH' | 'URGENT'
        // answerLog: Object linking step -> route -> answer chosen

        if (!finalRoute) return NextResponse.json({ error: 'Missing finalRoute' }, { status: 400 });

        // Map the new adaptive route roughly back into the legacy energy field for the recommendation engine
        let energy = 'moderate';
        if (finalRoute === 'FINISH_LOW') energy = 'low';
        if (finalRoute === 'FINISH_HIGH' || finalRoute === 'URGENT') energy = 'high';

        // Provide sensible defaults for the legacy engine
        const answers = {
            energy,
            concern: finalRoute === 'URGENT' ? 'acute distress' : 'daily stress',
            context: 'adaptive assessment',
            approach: 'immediate relief',
            support_style: 'empathetic',
            time: '5'
        };

        const profile = generateWellnessProfile(answers);
        
        let aiInsight = '';
        try {
            const aiResponse = await getOpenAI().chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: buildAIAnalysisPrompt(answers, profile.archetype) }],
                max_tokens: 200,
                temperature: 0.8,
            });
            aiInsight = aiResponse.choices[0]?.message?.content?.trim() || '';
        } catch {
            aiInsight = `You've completed the adaptive assessment. We matched you with a ${profile.archetype} profile to bring balance.`;
            if (finalRoute === 'URGENT') {
                aiInsight = "We noticed you are experiencing intense distress right now. Please know you are not alone; immediate support options are available below.";
            }
        }

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
                adaptiveAnswers: answerLog || {}
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
                adaptiveAnswers: answerLog || {}
            },
        });

        return NextResponse.json({ success: true, profile: { ...profile, aiInsight }, finalRoute });
    } catch (error) {
        console.error('Submit assessment error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
