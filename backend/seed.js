const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Emotion signal helper — shorthand for creating emotion weights.
 * Values range from 0 (no signal) to 4 (strong signal).
 */
function emo(overwhelmed = 0, anxious = 0, frustrated = 0, sad = 0, pressure = 0) {
    return { overwhelmed, anxious, frustrated, sad, pressure };
}

async function main() {
    console.log('Clearing existing assessment questions...');
    await prisma.assessmentQuestion.deleteMany({});

    console.log('Seeding v2.2 assessment questions (3-question branching system)...');

    const questions = [
        // ══════════════════════════════════════════════════════════
        // Q1 — MAIN QUESTION: Identify stress type (5 options A-E)
        // "What feels strongest for you right now?"
        // ══════════════════════════════════════════════════════════
        {
            stepNumber: 1,
            routeGroup: 'shared',
            questionText: 'What feels strongest for you right now?',

            // A → Overwhelmed
            answerAText: 'I have too many things to handle.',
            meaningA: 'Overwhelmed — too much at once',
            nextRouteA: 'overwhelmed',
            scoreDimA: 'type',
            scoreValA: 0,
            safetyFlagA: 'none',
            emotionSignalsA: emo(3, 0, 0, 0, 0),

            // B → Anxious
            answerBText: "I'm worried something might go wrong.",
            meaningB: 'Anxious — future worry',
            nextRouteB: 'anxious',
            scoreDimB: 'type',
            scoreValB: 0,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 3, 0, 0, 0),

            // C → Frustrated
            answerCText: 'Something is really frustrating me.',
            meaningC: 'Frustrated — anger / irritation',
            nextRouteC: 'frustrated',
            scoreDimC: 'type',
            scoreValC: 0,
            safetyFlagC: 'none',
            emotionSignalsC: emo(0, 0, 3, 0, 0),

            // D → Sad
            answerDText: 'I feel low or emotionally drained.',
            meaningD: 'Sad — low mood / depletion',
            nextRouteD: 'sad',
            scoreDimD: 'type',
            scoreValD: 0,
            safetyFlagD: 'none',
            emotionSignalsD: emo(0, 0, 0, 3, 0),

            // E → Pressure
            answerEText: 'I feel pressure to succeed or perform.',
            meaningE: 'Pressure — external expectations',
            nextRouteE: 'pressure',
            scoreDimE: 'type',
            scoreValE: 0,
            safetyFlagE: 'none',
            emotionSignalsE: emo(0, 0, 0, 0, 3),
        },

        // ══════════════════════════════════════════════════════════
        // Q2 — BRANCH QUESTIONS: Measure intensity + confirm emotion
        // ══════════════════════════════════════════════════════════

        // Q2 — ANXIOUS branch
        {
            stepNumber: 2,
            routeGroup: 'anxious',
            questionText: 'What are your thoughts like?',

            answerAText: 'Slight worrying',
            meaningA: 'Mild anxiety',
            nextRouteA: 'anxious',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 2, 0, 0, 0),

            answerBText: 'Constant "what if" thoughts',
            meaningB: 'Moderate anxiety',
            nextRouteB: 'anxious',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 3, 0, 0, 0),

            answerCText: "Can't stop overthinking",
            meaningC: 'High anxiety + overwhelm',
            nextRouteC: 'anxious',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(1, 3, 0, 0, 0),

            answerDText: 'Feels like panic',
            meaningD: 'Panic-level anxiety',
            nextRouteD: 'anxious',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'panic_like_state',
            emotionSignalsD: emo(0, 4, 0, 0, 0),
        },

        // Q2 — OVERWHELMED branch
        {
            stepNumber: 2,
            routeGroup: 'overwhelmed',
            questionText: 'What situation fits you best?',

            answerAText: 'A few things feel too much',
            meaningA: 'Mild overwhelm',
            nextRouteA: 'overwhelmed',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(2, 0, 0, 0, 0),

            answerBText: 'Many tasks piling up',
            meaningB: 'Moderate overwhelm + pressure',
            nextRouteB: 'overwhelmed',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(3, 0, 0, 0, 1),

            answerCText: 'Too much to handle at once',
            meaningC: 'High overwhelm',
            nextRouteC: 'overwhelmed',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(4, 0, 0, 0, 0),

            answerDText: 'Completely overloaded or shutting down',
            meaningD: 'Shutdown-level overwhelm',
            nextRouteD: 'overwhelmed',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'shutdown_state',
            emotionSignalsD: emo(4, 0, 0, 0, 0),
        },

        // Q2 — FRUSTRATED branch
        {
            stepNumber: 2,
            routeGroup: 'frustrated',
            questionText: 'What triggered this feeling?',

            answerAText: 'Small irritation',
            meaningA: 'Mild frustration',
            nextRouteA: 'frustrated',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 0, 2, 0, 0),

            answerBText: 'Ongoing annoyance',
            meaningB: 'Moderate frustration',
            nextRouteB: 'frustrated',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 3, 0, 0),

            answerCText: 'Strong frustration',
            meaningC: 'High frustration',
            nextRouteC: 'frustrated',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(0, 0, 4, 0, 0),

            answerDText: 'Extremely upset or furious',
            meaningD: 'Anger spike',
            nextRouteD: 'frustrated',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'anger_spike',
            emotionSignalsD: emo(0, 0, 4, 0, 0),
        },

        // Q2 — SAD branch
        {
            stepNumber: 2,
            routeGroup: 'sad',
            questionText: 'How do you feel emotionally?',

            answerAText: 'Slightly low',
            meaningA: 'Mild sadness',
            nextRouteA: 'sad',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 0, 0, 2, 0),

            answerBText: 'Unmotivated',
            meaningB: 'Moderate sadness',
            nextRouteB: 'sad',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 0, 3, 0),

            answerCText: 'Very down',
            meaningC: 'High sadness',
            nextRouteC: 'sad',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(0, 0, 0, 4, 0),

            answerDText: 'Empty or hopeless',
            meaningD: 'Hopelessness marker',
            nextRouteD: 'sad',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'hopelessness_marker',
            emotionSignalsD: emo(0, 0, 0, 4, 0),
        },

        // Q2 — PRESSURE branch
        {
            stepNumber: 2,
            routeGroup: 'pressure',
            questionText: "What's causing the pressure?",

            answerAText: 'Small responsibility',
            meaningA: 'Mild pressure',
            nextRouteA: 'pressure',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 0, 0, 0, 2),

            answerBText: 'Important task',
            meaningB: 'Moderate pressure',
            nextRouteB: 'pressure',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 0, 0, 3),

            answerCText: 'Big expectations',
            meaningC: 'High pressure + anxiety',
            nextRouteC: 'pressure',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(0, 1, 0, 0, 4),

            answerDText: 'High-stakes situation',
            meaningD: 'High-stakes strain',
            nextRouteD: 'pressure',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'high_stakes_strain',
            emotionSignalsD: emo(0, 1, 0, 0, 4),
        },

        // ══════════════════════════════════════════════════════════
        // Q3 — IMPACT QUESTIONS: Measure body/reaction + risk flags
        // ══════════════════════════════════════════════════════════

        // Q3 — ANXIOUS branch
        {
            stepNumber: 3,
            routeGroup: 'anxious',
            questionText: 'How is your body feeling?',

            answerAText: 'A bit uneasy',
            meaningA: 'Mild physical anxiety',
            nextRouteA: 'finish',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 1, 0, 0, 0),

            answerBText: 'Restless or tense',
            meaningB: 'Moderate physical anxiety',
            nextRouteB: 'finish',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 2, 0, 0, 0),

            answerCText: 'Fast heartbeat or sweating',
            meaningC: 'High physical activation',
            nextRouteC: 'finish',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'high_physical_activation',
            emotionSignalsC: emo(0, 3, 0, 0, 0),

            answerDText: "Panic or can't calm down",
            meaningD: 'Panic-level activation',
            nextRouteD: 'finish',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'panic_like_state',
            emotionSignalsD: emo(0, 4, 0, 0, 0),
        },

        // Q3 — OVERWHELMED branch
        {
            stepNumber: 3,
            routeGroup: 'overwhelmed',
            questionText: 'How are you reacting?',

            answerAText: 'Slight delay in tasks',
            meaningA: 'Mild impact',
            nextRouteA: 'finish',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(1, 0, 0, 0, 0),

            answerBText: 'Procrastinating',
            meaningB: 'Moderate impact + pressure',
            nextRouteB: 'finish',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(2, 0, 0, 0, 1),

            answerCText: "Don't know where to start",
            meaningC: 'High overwhelm',
            nextRouteC: 'finish',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(3, 0, 0, 0, 0),

            answerDText: 'Avoiding everything',
            meaningD: 'Functional withdrawal',
            nextRouteD: 'finish',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'functional_withdrawal',
            emotionSignalsD: emo(4, 0, 0, 1, 0),
        },

        // Q3 — FRUSTRATED branch
        {
            stepNumber: 3,
            routeGroup: 'frustrated',
            questionText: 'How do you feel like reacting?',

            answerAText: 'Ignore it',
            meaningA: 'Mild reaction',
            nextRouteA: 'finish',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 0, 1, 0, 0),

            answerBText: 'Complain',
            meaningB: 'Moderate reaction',
            nextRouteB: 'finish',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 2, 0, 0),

            answerCText: 'Argue',
            meaningC: 'Conflict escalation',
            nextRouteC: 'finish',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'conflict_escalation',
            emotionSignalsC: emo(0, 0, 3, 0, 0),

            answerDText: 'Explode or lose control',
            meaningD: 'Loss of control',
            nextRouteD: 'finish',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'loss_of_control',
            emotionSignalsD: emo(0, 0, 4, 0, 0),
        },

        // Q3 — SAD branch
        {
            stepNumber: 3,
            routeGroup: 'sad',
            questionText: 'What are you doing because of this?',

            answerAText: 'Less active',
            meaningA: 'Mild withdrawal',
            nextRouteA: 'finish',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 0, 0, 1, 0),

            answerBText: 'Avoiding people',
            meaningB: 'Moderate withdrawal',
            nextRouteB: 'finish',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 0, 2, 0),

            answerCText: 'Isolating yourself',
            meaningC: 'Social withdrawal',
            nextRouteC: 'finish',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'social_withdrawal',
            emotionSignalsC: emo(0, 0, 0, 3, 0),

            answerDText: 'Completely withdrawn',
            meaningD: 'Severe withdrawal',
            nextRouteD: 'finish',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'severe_withdrawal',
            emotionSignalsD: emo(0, 0, 0, 4, 0),
        },

        // Q3 — PRESSURE branch
        {
            stepNumber: 3,
            routeGroup: 'pressure',
            questionText: 'How are you handling it?',

            answerAText: 'Slight stress but okay',
            meaningA: 'Mild strain',
            nextRouteA: 'finish',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 0, 0, 0, 1),

            answerBText: 'Struggling to keep up',
            meaningB: 'Moderate strain',
            nextRouteB: 'finish',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 0, 0, 2),

            answerCText: 'Very stressed but pushing through',
            meaningC: 'High strain + overwhelm',
            nextRouteC: 'finish',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(1, 0, 0, 0, 3),

            answerDText: 'About to burn out',
            meaningD: 'Burnout marker',
            nextRouteD: 'finish',
            scoreDimD: 'intensity',
            scoreValD: 4,
            safetyFlagD: 'burnout_marker',
            emotionSignalsD: emo(1, 0, 0, 0, 4),
        },
    ];

    for (const q of questions) {
        await prisma.assessmentQuestion.create({ data: q });
    }

    console.log(`Successfully seeded ${questions.length} v2.2 assessment questions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
