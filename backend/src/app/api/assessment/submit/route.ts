import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWellnessProfile, buildAIAnalysisPrompt } from '@/lib/recommendations';
import OpenAI from 'openai';

function getOpenAI() {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
}

/* ─── v2.2 Types ─── */
type SupportType = 'overwhelmed' | 'anxious' | 'frustrated' | 'sad' | 'pressure';
type IntensityLevel = 'light' | 'elevated' | 'intense' | 'urgent';

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
    selectedOption: string;   // 'A' | 'B' | 'C' | 'D' | 'E'
    answerText: string;
    meaning: string;
    scoreDimension: string;
    scoreValue: number;
    safetyFlag: string;
    emotionSignals?: EmotionBreakdown;
}

interface AssessmentResultV22 {
    primaryType: SupportType;
    secondaryType?: SupportType;
    level: IntensityLevel;
    supportPath: string;
    intensityAverage: number;
    riskFlags: string[];
    shouldShowSafetyBar: boolean;
}

/* ─── Risk flag categories ─── */
const OVERRIDE_TO_INTENSE = new Set([
    'high_physical_activation',
    'conflict_escalation',
    'social_withdrawal',
    'shutdown_state',
    'high_stakes_strain',
]);

const OVERRIDE_TO_URGENT = new Set([
    'panic_like_state',
    'loss_of_control',
    'hopelessness_marker',
    'severe_withdrawal',
    'burnout_marker',
]);

/* ─── Support path mapping ─── */
const SUPPORT_PATHS: Record<SupportType, string> = {
    overwhelmed: 'overwhelm_support',
    anxious: 'anxiety_support',
    frustrated: 'frustration_support',
    sad: 'emotional_support',
    pressure: 'performance_support',
};

/* ─── Determine intensity level from average + risk flags ─── */
function determineLevel(intensityAvg: number, riskFlags: string[]): IntensityLevel {
    // Start from the average
    let level: IntensityLevel;
    if (intensityAvg <= 1.5) level = 'light';
    else if (intensityAvg <= 2.5) level = 'elevated';
    else if (intensityAvg <= 3.4) level = 'intense';
    else level = 'urgent';

    // Risk flag overrides — only upgrade, never downgrade
    for (const flag of riskFlags) {
        if (OVERRIDE_TO_URGENT.has(flag)) {
            level = 'urgent';
            break; // urgent is max, no need to check further
        }
        if (OVERRIDE_TO_INTENSE.has(flag) && (level === 'light' || level === 'elevated')) {
            level = 'intense';
        }
    }

    return level;
}

/* ─── Determine emotional profile ─── */
function determineEmotionalProfile(
    emotions: EmotionBreakdown,
    level: IntensityLevel,
): { concern: string; context: string; primaryType: SupportType; secondaryType?: SupportType } {
    // Sort emotions by score
    const entries: [SupportType, number][] = [
        ['overwhelmed', emotions.overwhelmed],
        ['anxious', emotions.anxious],
        ['frustrated', emotions.frustrated],
        ['sad', emotions.sad],
        ['pressure', emotions.pressure],
    ];
    entries.sort((a, b) => b[1] - a[1]);
    const primaryType = entries[0][0];
    const secondaryType = entries[1][1] > 0 ? entries[1][0] : undefined;

    // Map to archetype concern/context
    const emotionToConcern: Record<SupportType, { concern: string; context: string }> = {
        overwhelmed: { concern: 'racing_thoughts', context: 'circular' },
        anxious:     { concern: 'anxiety',         context: 'future' },
        frustrated:  { concern: 'anger',           context: 'boundaries' },
        sad:         { concern: 'sad',             context: 'grief' },
        pressure:    { concern: 'stress',          context: 'tasks' },
    };

    // Severity refinements
    if (level === 'urgent') {
        if (primaryType === 'sad') return { concern: 'hopeless', context: 'no_way_out', primaryType, secondaryType };
        if (primaryType === 'anxious') return { concern: 'panic', context: 'full_body', primaryType, secondaryType };
        if (primaryType === 'overwhelmed') return { concern: 'panic', context: 'everything', primaryType, secondaryType };
    }

    if (level === 'intense') {
        if (primaryType === 'sad') return { concern: 'hopeless', context: 'days', primaryType, secondaryType };
        if (primaryType === 'overwhelmed' && secondaryType === 'anxious') return { concern: 'panic', context: 'full_body', primaryType, secondaryType };
    }

    const result = emotionToConcern[primaryType] || { concern: 'stress', context: 'tasks' };
    return { ...result, primaryType, secondaryType };
}

/* ─── Map v2.2 level to legacy stressLevel for backward compat ─── */
function mapToLegacyStressLevel(level: IntensityLevel): string {
    switch (level) {
        case 'light': return 'low';
        case 'elevated': return 'mid-low';
        case 'intense': return 'mid-high';
        case 'urgent': return 'high';
    }
}

/* ─── POST handler ─── */
export async function POST(req: NextRequest) {
    try {
        const payload = getUserFromRequest(req);

        const body = await req.json();
        const { answerDetails } = body;

        if (!answerDetails || !Array.isArray(answerDetails) || answerDetails.length === 0) {
            return NextResponse.json({ error: 'Missing answerDetails' }, { status: 400 });
        }

        // Accumulate emotion scores and collect intensity values + risk flags
        const emotionScores: EmotionBreakdown = {
            overwhelmed: 0, anxious: 0, frustrated: 0, sad: 0, pressure: 0,
        };
        const intensityValues: number[] = [];
        const riskFlags: string[] = [];

        for (const detail of answerDetails as AnswerDetail[]) {
            // Accumulate emotion signals
            if (detail.emotionSignals) {
                const es = detail.emotionSignals;
                emotionScores.overwhelmed += (es.overwhelmed || 0);
                emotionScores.anxious += (es.anxious || 0);
                emotionScores.frustrated += (es.frustrated || 0);
                emotionScores.sad += (es.sad || 0);
                emotionScores.pressure += (es.pressure || 0);
            }

            // Collect intensity values from Q2 and Q3 (step 2 and 3)
            if (detail.scoreDimension === 'intensity' && detail.scoreValue > 0) {
                intensityValues.push(detail.scoreValue);
            }

            // Collect risk flags
            if (detail.safetyFlag && detail.safetyFlag !== 'none') {
                riskFlags.push(detail.safetyFlag);
            }
        }

        // Calculate intensity average (Q2 + Q3) / 2
        const intensityAverage = intensityValues.length > 0
            ? intensityValues.reduce((a, b) => a + b, 0) / intensityValues.length
            : 1;

        // Determine final level with risk overrides
        const level = determineLevel(intensityAverage, riskFlags);

        // Determine emotional profile
        const emotionalProfile = determineEmotionalProfile(emotionScores, level);

        // Build the v2.2 result object
        const supportPath = SUPPORT_PATHS[emotionalProfile.primaryType] || 'overwhelm_support';
        const shouldShowSafetyBar = level === 'urgent' || riskFlags.some(f => OVERRIDE_TO_URGENT.has(f));

        const result: AssessmentResultV22 = {
            primaryType: emotionalProfile.primaryType,
            secondaryType: emotionalProfile.secondaryType,
            level,
            supportPath,
            intensityAverage,
            riskFlags,
            shouldShowSafetyBar,
        };

        // Map to legacy energy field
        const energyMap: Record<IntensityLevel, string> = {
            light: 'low',
            elevated: 'moderate',
            intense: 'high',
            urgent: 'high',
        };

        const answers = {
            energy: energyMap[level],
            concern: emotionalProfile.concern,
            context: emotionalProfile.context,
            approach: level === 'urgent' ? 'immediate safety' : level === 'intense' ? 'calm_first' : 'calm_body',
            support_style: shouldShowSafetyBar ? 'enhanced empathetic' : 'empathetic',
            time: level === 'light' ? '1' : level === 'elevated' ? '5' : '10',
        };

        const profile = generateWellnessProfile(answers);

        // AI insight
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
            if (level === 'urgent') {
                aiInsight = 'We noticed you are experiencing intense distress right now. Please know you are not alone; immediate support options are available below.';
            } else {
                aiInsight = `Based on your assessment, we have matched you with a ${profile.archetype} wellness profile. Let us help you find balance.`;
            }
        }

        // Save if registered user
        if (payload) {
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
                        version: 4,
                        system: '2.2',
                        result,
                        emotionScores,
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
                        version: 4,
                        system: '2.2',
                        result,
                        emotionScores,
                        answerDetails: answerDetails || [],
                    },
                },
            });
        }

        const stressLevel = mapToLegacyStressLevel(level);

        return NextResponse.json({
            success: true,
            outcome: {
                level,
                stressLevel,
                intensityAverage,
                primaryType: result.primaryType,
                secondaryType: result.secondaryType,
                supportPath,
                riskFlags,
                shouldShowSafetyBar,
                emotionScores,
                emotionalProfile: result.primaryType,
            },
            profile: { ...profile, aiInsight, stressLevel: level, emotionalProfile: result.primaryType },
        });
    } catch (error) {
        console.error('Submit assessment error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
