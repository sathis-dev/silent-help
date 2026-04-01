import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWellnessProfile, buildAIAnalysisPrompt } from '@/lib/recommendations';
import OpenAI from 'openai';

function getOpenAI() {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
}

/* ─── Types ─── */
interface ScoreBreakdown {
    [key: string]: number;
    intensity: number;
    impact: number;
    control: number;
    duration: number;
    symptoms: number;
    coping: number;
    safety: number;
}

interface EmotionBreakdown {
    [key: string]: number;
    overwhelmed: number;
    anxious: number;
    frustrated: number;
    sad: number;
    pressure: number;
}

interface AnswerDetail {
    questionId: string;
    stepNumber: number;
    selectedOption: string;   // 'A' | 'B' | 'C'
    answerText: string;
    meaning: string;
    scoreDimension: string;
    scoreValue: number;
    safetyFlag: string;
    emotionSignals?: EmotionBreakdown;
}

/* ─── Step weights as per the blueprint ─── */
const STEP_WEIGHTS: Record<number, number> = {
    1: 2, // intensity
    2: 2, // impact/control
    3: 1, // duration
    4: 1, // symptoms
    5: 2, // coping
    6: 1, // safety (override-first, score-second)
};

/* ─── Outcome determination ─── */
function determineOutcome(
    finalRoute: string,
    scores: ScoreBreakdown,
    maxSafetyFlag: string,
): {
    level: 'low' | 'mid' | 'high' | 'urgent';
    enhanced: boolean;
    weightedTotal: number;
} {
    // 1. Safety override always wins
    if (maxSafetyFlag === 'hard' || finalRoute === 'URGENT' || finalRoute === 'URGENT_EMERGENCY' || finalRoute === 'URGENT_CALM') {
        return { level: 'urgent', enhanced: false, weightedTotal: 99 };
    }

    // 2. Check enhanced support flag
    const enhanced = finalRoute.includes('_ENHANCED');

    // 3. Route-based mapping
    if (finalRoute.startsWith('FINISH_LOW'))  return { level: 'low',  enhanced, weightedTotal: calculateWeightedTotal(scores) };
    if (finalRoute.startsWith('FINISH_MID'))  return { level: 'mid',  enhanced, weightedTotal: calculateWeightedTotal(scores) };
    if (finalRoute.startsWith('FINISH_HIGH')) return { level: 'high', enhanced, weightedTotal: calculateWeightedTotal(scores) };

    // Fallback: use weighted score
    const total = calculateWeightedTotal(scores);
    if (total <= 12) return { level: 'low',  enhanced, weightedTotal: total };
    if (total <= 20) return { level: 'mid',  enhanced, weightedTotal: total };
    return { level: 'high', enhanced, weightedTotal: total };
}

/* ─── Compute 4-tier stress level for dashboard ─── */
function computeStressLevel(outcome: { level: string; weightedTotal: number }): 'low' | 'mid-low' | 'mid-high' | 'high' {
    if (outcome.level === 'urgent' || outcome.level === 'high') return 'high';
    if (outcome.level === 'low') return 'low';
    if (outcome.weightedTotal <= 16) return 'mid-low';
    return 'mid-high';
}

function calculateWeightedTotal(scores: ScoreBreakdown): number {
    return (
        scores.intensity * STEP_WEIGHTS[1] +
        (scores.impact + scores.control) * STEP_WEIGHTS[2] +
        scores.duration * STEP_WEIGHTS[3] +
        scores.symptoms * STEP_WEIGHTS[4] +
        scores.coping * STEP_WEIGHTS[5] +
        scores.safety * STEP_WEIGHTS[6]
    );
}

/* ─── Determine emotional profile from accumulated emotion signals ─── */
function determineEmotionalProfile(
    emotions: EmotionBreakdown,
    outcome: { level: string },
): { concern: string; context: string; dominantEmotion: string } {
    // Find the dominant emotion
    const entries: [string, number][] = [
        ['overwhelmed', emotions.overwhelmed],
        ['anxious', emotions.anxious],
        ['frustrated', emotions.frustrated],
        ['sad', emotions.sad],
        ['pressure', emotions.pressure],
    ];
    entries.sort((a, b) => b[1] - a[1]);
    const dominant = entries[0][0];
    const secondary = entries[1][0];

    // Map dominant emotion → archetype system concern + context
    const emotionToConcern: Record<string, { concern: string; context: string }> = {
        overwhelmed: { concern: 'racing_thoughts', context: 'circular' },
        anxious:     { concern: 'anxiety',         context: 'future' },
        frustrated:  { concern: 'anger',           context: 'boundaries' },
        sad:         { concern: 'sad',             context: 'grief' },
        pressure:    { concern: 'stress',          context: 'tasks' },
    };

    // Refine based on severity level
    if (outcome.level === 'urgent') {
        if (dominant === 'sad') return { concern: 'hopeless', context: 'no_way_out', dominantEmotion: dominant };
        if (dominant === 'anxious') return { concern: 'panic', context: 'full_body', dominantEmotion: dominant };
        if (dominant === 'overwhelmed') return { concern: 'panic', context: 'everything', dominantEmotion: dominant };
    }

    if (outcome.level === 'high') {
        if (dominant === 'sad') return { concern: 'hopeless', context: 'days', dominantEmotion: dominant };
        if (dominant === 'overwhelmed' && secondary === 'anxious') return { concern: 'panic', context: 'full_body', dominantEmotion: dominant };
    }

    // Low energy mapping for sad/overwhelmed
    if (dominant === 'sad' && emotions.sad > 6) return { concern: 'empty', context: 'disconnected', dominantEmotion: dominant };
    if (dominant === 'overwhelmed' && emotions.overwhelmed > 8) return { concern: 'emotional', context: 'everything', dominantEmotion: dominant };

    const result = emotionToConcern[dominant] || { concern: 'stress', context: 'tasks' };
    return { ...result, dominantEmotion: dominant };
}

/* ─── POST handler ─── */
export async function POST(req: NextRequest) {
    try {
        const payload = getUserFromRequest(req);


        const body = await req.json();
        const { finalRoute, answerLog, answerDetails } = body;
        // finalRoute: 'FINISH_LOW' | 'FINISH_MID' | 'FINISH_HIGH' | 'FINISH_*_ENHANCED' | 'URGENT' | 'URGENT_CALM' | 'URGENT_EMERGENCY'
        // answerLog: Record<questionId, answerText> (simple log)
        // answerDetails: AnswerDetail[] (rich scoring data from frontend)

        if (!finalRoute) return NextResponse.json({ error: 'Missing finalRoute' }, { status: 400 });

        // Build score breakdown from answer details
        const scores: ScoreBreakdown = {
            intensity: 0, impact: 0, control: 0,
            duration: 0, symptoms: 0, coping: 0, safety: 0,
        };

        // Build emotion breakdown from answer details
        const emotionScores: EmotionBreakdown = {
            overwhelmed: 0, anxious: 0, frustrated: 0, sad: 0, pressure: 0,
        };

        let maxSafetyFlag = 'none';
        const safetyHierarchy = ['none', 'soft', 'medium', 'hard'];

        if (answerDetails && Array.isArray(answerDetails)) {
            for (const detail of answerDetails as AnswerDetail[]) {
                const dim = detail.scoreDimension as keyof ScoreBreakdown;
                if (dim in scores) {
                    scores[dim] += detail.scoreValue;
                }
                // Accumulate emotion signals
                if (detail.emotionSignals) {
                    const es = detail.emotionSignals;
                    emotionScores.overwhelmed += (es.overwhelmed || 0);
                    emotionScores.anxious += (es.anxious || 0);
                    emotionScores.frustrated += (es.frustrated || 0);
                    emotionScores.sad += (es.sad || 0);
                    emotionScores.pressure += (es.pressure || 0);
                }
                // Track highest safety flag encountered
                if (safetyHierarchy.indexOf(detail.safetyFlag) > safetyHierarchy.indexOf(maxSafetyFlag)) {
                    maxSafetyFlag = detail.safetyFlag;
                }
            }
        }

        // Determine final outcome
        const outcome = determineOutcome(finalRoute, scores, maxSafetyFlag);

        // Determine emotional profile from accumulated signals
        const emotionalProfile = determineEmotionalProfile(emotionScores, outcome);

        // Map to legacy energy field for backward compatibility
        const energyMap = { low: 'low', mid: 'moderate', high: 'high', urgent: 'high' } as const;
        const energy = energyMap[outcome.level];

        // Build answers using emotion-aware concern/context (instead of hardcoded values)
        const answers = {
            energy,
            concern: emotionalProfile.concern,
            context: emotionalProfile.context,
            approach: outcome.level === 'urgent' ? 'immediate safety' : outcome.level === 'high' ? 'calm_first' : 'calm_body',
            support_style: outcome.enhanced ? 'enhanced empathetic' : 'empathetic',
            time: outcome.level === 'low' ? '1' : outcome.level === 'mid' ? '5' : '10',
        };

        const profile = generateWellnessProfile(answers);

        // AI insight generation
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
            if (outcome.level === 'urgent') {
                aiInsight = 'We noticed you are experiencing intense distress right now. Please know you are not alone; immediate support options are available below.';
            } else {
                aiInsight = `Based on your assessment, we have matched you with a ${profile.archetype} wellness profile. Let us help you find balance.`;
            }
        }

        // Save everything if registered user
        if (payload) {
            // Implicitly ensure the user exists in database to satisfy foreign keys
            await prisma.user.upsert({
                where: { id: payload.userId },
                create: {
                    id: payload.userId,
                    email: payload.email || `clerk_${payload.userId.substring(0,8)}@temp.silenthelp.com`,
                    passwordHash: 'clerk-auth',
                    name: 'Silent Help User'
                },
                update: {}
            });

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
                    adaptiveAnswers: {
                        version: 3,
                        finalRoute,
                        outcome: outcome.level,
                        enhanced: outcome.enhanced,
                        weightedTotal: outcome.weightedTotal,
                        maxSafetyFlag,
                        scores,
                        emotionScores,
                        emotionalProfile: emotionalProfile.dominantEmotion,
                        answerLog: answerLog || {},
                        answerDetails: answerDetails || [],
                    },
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
                    adaptiveAnswers: {
                        version: 3,
                        finalRoute,
                        outcome: outcome.level,
                        enhanced: outcome.enhanced,
                        weightedTotal: outcome.weightedTotal,
                        maxSafetyFlag,
                        scores,
                        emotionScores,
                        emotionalProfile: emotionalProfile.dominantEmotion,
                        answerLog: answerLog || {},
                        answerDetails: answerDetails || [],
                    },
                },
            });
        }

        const stressLevel = computeStressLevel(outcome);

        return NextResponse.json({
            success: true,
            outcome: {
                level: outcome.level,
                enhanced: outcome.enhanced,
                weightedTotal: outcome.weightedTotal,
                stressLevel,
                scores,
                emotionScores,
                emotionalProfile: emotionalProfile.dominantEmotion,
            },
            profile: { ...profile, aiInsight, stressLevel },
            finalRoute,
        });
    } catch (error) {
        console.error('Submit assessment error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
