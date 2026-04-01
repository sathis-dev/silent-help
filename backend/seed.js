const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Emotion signal helper — shorthand for creating emotion weights.
 * Each answer option carries weights for 5 emotional dimensions:
 *   overwhelmed, anxious, frustrated, sad, pressure
 * Values range from 0 (no signal) to 3 (strong signal).
 */
function emo(overwhelmed = 0, anxious = 0, frustrated = 0, sad = 0, pressure = 0) {
    return { overwhelmed, anxious, frustrated, sad, pressure };
}

async function main() {
    console.log('Clearing existing assessment questions...');
    await prisma.assessmentQuestion.deleteMany({});

    console.log('Seeding emotion-aware assessment questions (v3)...');

    const questions = [
        // ══════════════════════════════════════════════════════════
        // STEP 1 — Current Emotional State (shared entry point)
        // ══════════════════════════════════════════════════════════
        {
            stepNumber: 1,
            routeGroup: 'shared',
            questionText: 'How are you feeling right now?',
            
            answerAText: 'A bit tense, but I can manage',
            meaningA: 'Mild/manageable tension',
            nextRouteA: 'R1',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 1, 0, 0, 1),   // hints at anxiety + pressure

            answerBText: 'Stressed and struggling to focus',
            meaningB: 'Moderate/affecting function',
            nextRouteB: 'R3',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(1, 1, 0, 0, 2),   // pressure dominant, some overwhelm

            answerCText: 'Overwhelmed and finding it hard to settle',
            meaningC: 'High/hard to control',
            nextRouteC: 'R4',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(3, 1, 0, 0, 1),   // strong overwhelm signal
        },

        // ══════════════════════════════════════════════════════════
        // STEP 2 — Emotional Identification (the KEY new step)
        // This is where we directly surface the user's dominant emotion.
        // ══════════════════════════════════════════════════════════

        // Step 2 — R1 (low intensity branch)
        {
            stepNumber: 2,
            routeGroup: 'R1',
            questionText: 'Which word describes your stress best right now?',

            answerAText: 'Worried — my mind keeps running ahead',
            meaningA: 'Anxious rumination',
            nextRouteA: 'R1',
            scoreDimA: 'impact',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 3, 0, 0, 0),   // strong anxious

            answerBText: 'Pressured — too much to do, not enough time',
            meaningB: 'External pressure',
            nextRouteB: 'R2',
            scoreDimB: 'impact',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(1, 0, 0, 0, 3),   // strong pressure

            answerCText: 'Low — heavy or unmotivated',
            meaningC: 'Sadness / low mood',
            nextRouteC: 'R2',
            scoreDimC: 'impact',
            scoreValC: 2,
            safetyFlagC: 'none',
            emotionSignalsC: emo(0, 0, 0, 3, 0),   // strong sad
        },

        // Step 2 — R3 (moderate intensity branch)
        {
            stepNumber: 2,
            routeGroup: 'R3',
            questionText: 'What is the strongest feeling underneath your stress?',

            answerAText: 'Anxious — I can\'t stop worrying about things',
            meaningA: 'Anxiety-dominant',
            nextRouteA: 'R2',
            scoreDimA: 'impact',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 3, 0, 0, 0),   // strong anxious

            answerBText: 'Frustrated — nothing is going right',
            meaningB: 'Frustration-dominant',
            nextRouteB: 'R3',
            scoreDimB: 'impact',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 3, 0, 1),   // strong frustrated

            answerCText: 'Overwhelmed — everything feels like too much',
            meaningC: 'Overwhelm-dominant',
            nextRouteC: 'R4',
            scoreDimC: 'impact',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(3, 0, 0, 0, 1),   // strong overwhelmed
        },

        // Step 2 — R4 (high intensity branch)
        {
            stepNumber: 2,
            routeGroup: 'R4',
            questionText: 'When the stress is at its worst, it feels most like:',

            answerAText: 'Panic — my body is reacting and I can\'t calm down',
            meaningA: 'Panic / acute anxiety',
            nextRouteA: 'R3',
            scoreDimA: 'control',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(1, 3, 0, 0, 0),   // peak anxious

            answerBText: 'Anger — I feel like I could explode',
            meaningB: 'Rage / frustration peak',
            nextRouteB: 'R4',
            scoreDimB: 'control',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 3, 0, 1),   // peak frustrated

            answerCText: 'Hopeless — I don\'t see a way out',
            meaningC: 'Despair / deep sadness',
            nextRouteC: 'R5',
            scoreDimC: 'control',
            scoreValC: 3,
            safetyFlagC: 'medium',
            emotionSignalsC: emo(1, 0, 0, 3, 0),   // peak sad
        },

        // ══════════════════════════════════════════════════════════
        // STEP 3 — Duration (reinforces emotion with duration context)
        // ══════════════════════════════════════════════════════════

        // Step 3 — R1 and R2
        ...['R1', 'R2'].map(r => ({
            stepNumber: 3,
            routeGroup: r,
            questionText: 'How long have you been feeling like this?',

            answerAText: 'Just today — it\'s recent',
            meaningA: 'Acute short',
            nextRouteA: r,
            scoreDimA: 'duration',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 1, 0, 0, 0),  // brief = likely anxious

            answerBText: 'A few days now',
            meaningB: 'Several days',
            nextRouteB: 'R2',
            scoreDimB: 'duration',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(1, 0, 0, 0, 1),  // building = pressure + overwhelm

            answerCText: 'More than a week',
            meaningC: 'Prolonged',
            nextRouteC: 'R3',
            scoreDimC: 'duration',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(1, 0, 0, 1, 1),  // long-running = sad + overwhelm + pressure
        })),

        // Step 3 — R3
        {
            stepNumber: 3,
            routeGroup: 'R3',
            questionText: 'Has this stress been building up over time?',

            answerAText: 'No, it hit me suddenly',
            meaningA: 'Recent onset',
            nextRouteA: 'R3',
            scoreDimA: 'duration',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 2, 0, 0, 0),  // sudden = often anxious

            answerBText: 'Yes, over several days',
            meaningB: 'Building',
            nextRouteB: 'R3',
            scoreDimB: 'duration',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(1, 0, 1, 0, 1),  // building = frustrated/overwhelm/pressure

            answerCText: 'Yes, for quite a while now',
            meaningC: 'Chronic buildup',
            nextRouteC: 'R4',
            scoreDimC: 'duration',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(2, 0, 0, 1, 1),  // chronic = overwhelm + sad
        },

        // Step 3 — R4 and R5
        ...['R4', 'R5'].map(r => ({
            stepNumber: 3,
            routeGroup: r,
            questionText: 'Has this intense feeling stayed with you for a while?',

            answerAText: 'No, it hit me suddenly',
            meaningA: 'Acute spike',
            nextRouteA: r,
            scoreDimA: 'duration',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 2, 1, 0, 0),  // sudden intense = anxious/frustrated

            answerBText: 'Yes, for a few days',
            meaningB: 'Sustained high',
            nextRouteB: r === 'R5' ? 'R5' : 'R4',
            scoreDimB: 'duration',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(1, 0, 1, 0, 1),  // sustained = overwhelm/frustrated/pressure

            answerCText: 'Yes, for a long time now',
            meaningC: 'Prolonged severe',
            nextRouteC: 'R5',
            scoreDimC: 'duration',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(2, 0, 0, 2, 0),  // prolonged severe = overwhelm + sad
        })),

        // ══════════════════════════════════════════════════════════
        // STEP 4 — Symptom Profile (maps body/mind symptoms → emotions)
        // ══════════════════════════════════════════════════════════

        // Step 4 — R1 and R2
        ...['R1', 'R2'].map(r => ({
            stepNumber: 4,
            routeGroup: r,
            questionText: 'What feels most true for you right now?',

            answerAText: 'My mind keeps racing with worries',
            meaningA: 'Cognitive anxiety',
            nextRouteA: r,
            scoreDimA: 'symptoms',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 3, 0, 0, 0),  // racing mind = anxious

            answerBText: 'I feel irritable and on edge',
            meaningB: 'Agitation / frustration',
            nextRouteB: 'R2',
            scoreDimB: 'symptoms',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 3, 0, 1),  // irritable = frustrated + pressure

            answerCText: 'I feel drained — no energy for anything',
            meaningC: 'Depletion / sadness',
            nextRouteC: 'R3',
            scoreDimC: 'symptoms',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(1, 0, 0, 3, 0),  // drained = sad + overwhelm
        })),

        // Step 4 — R3
        {
            stepNumber: 4,
            routeGroup: 'R3',
            questionText: 'What is bothering you most?',

            answerAText: 'I can\'t stop my thoughts — they loop endlessly',
            meaningA: 'Rumination / anxiety',
            nextRouteA: 'R3',
            scoreDimA: 'symptoms',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(1, 3, 0, 0, 0),  // thought loops = anxious + overwhelm

            answerBText: 'I feel trapped or stuck with no good options',
            meaningB: 'Stuck / pressure',
            nextRouteB: 'R3',
            scoreDimB: 'symptoms',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(2, 0, 1, 0, 2),  // trapped = overwhelmed + pressure + frustrated

            answerCText: 'My body and mind both feel completely overloaded',
            meaningC: 'System overload',
            nextRouteC: 'R4',
            scoreDimC: 'symptoms',
            scoreValC: 3,
            safetyFlagC: 'none',
            emotionSignalsC: emo(3, 0, 0, 0, 2),  // overloaded = overwhelmed + pressure
        },

        // Step 4 — R4 and R5
        ...['R4', 'R5'].map(r => ({
            stepNumber: 4,
            routeGroup: r,
            questionText: 'Which sounds closest to how you feel right now?',

            answerAText: 'Very stressed, but still answering and thinking clearly',
            meaningA: 'High distress, functioning',
            nextRouteA: r === 'R5' ? 'R5' : 'R4',
            scoreDimA: 'symptoms',
            scoreValA: 1,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 0, 0, 0, 3),  // functioning under stress = pressure

            answerBText: 'I feel angry, agitated, and struggling to settle',
            meaningB: 'Agitated / frustrated',
            nextRouteB: r === 'R5' ? 'R5' : 'R4',
            scoreDimB: 'symptoms',
            scoreValB: 2,
            safetyFlagB: 'none',
            emotionSignalsB: emo(0, 0, 3, 0, 1),  // agitated = frustrated + pressure

            answerCText: 'I feel close to breaking point',
            meaningC: 'Overwhelmed / near crisis',
            nextRouteC: 'R5',
            scoreDimC: 'symptoms',
            scoreValC: 3,
            safetyFlagC: 'medium',
            emotionSignalsC: emo(3, 1, 0, 1, 0),  // breaking = overwhelm + anxious + sad
        })),

        // ══════════════════════════════════════════════════════════
        // STEP 5 — Coping Ability
        // ══════════════════════════════════════════════════════════
        ...['R1', 'R2', 'R3', 'R4', 'R5'].map(r => {
            const downshift = r === 'R1' ? 'R1' : r === 'R2' ? 'R1' : r === 'R3' ? 'R2' : r === 'R4' ? 'R3' : 'R4';
            const upshift = r === 'R1' ? 'R2' : r === 'R2' ? 'R3' : r === 'R3' ? 'R4' : 'R5';

            return {
                stepNumber: 5,
                routeGroup: r,
                questionText: 'How able do you feel to cope with this right now?',

                answerAText: 'I can handle it with a little support',
                meaningA: 'Adequate coping',
                nextRouteA: downshift,
                scoreDimA: 'coping',
                scoreValA: 1,
                safetyFlagA: 'none',
                emotionSignalsA: emo(0, 0, 0, 0, 1),  // coping = mild pressure only

                answerBText: 'I\'m struggling to manage it properly',
                meaningB: 'Struggling',
                nextRouteB: r,
                scoreDimB: 'coping',
                scoreValB: 2,
                safetyFlagB: 'none',
                emotionSignalsB: emo(1, 1, 0, 0, 1),  // struggling = overwhelm + anxious + pressure

                answerCText: 'I don\'t feel able to cope right now',
                meaningC: 'Overwhelmed coping',
                nextRouteC: upshift,
                scoreDimC: 'coping',
                scoreValC: 3,
                safetyFlagC: r === 'R5' ? 'medium' : 'none',
                emotionSignalsC: emo(3, 1, 0, 1, 0),  // can't cope = strong overwhelm + sad
            };
        }),

        // ══════════════════════════════════════════════════════════
        // STEP 6 — Safety Check (unchanged logic, emotion signals added)
        // ══════════════════════════════════════════════════════════
        ...['R1', 'R2', 'R3', 'R4'].map(r => ({
            stepNumber: 6,
            routeGroup: r,
            questionText: 'Do you feel safe right now?',

            answerAText: 'Yes, I feel safe',
            meaningA: 'Safe',
            nextRouteA: 'finish',
            scoreDimA: 'safety',
            scoreValA: 0,
            safetyFlagA: 'none',
            emotionSignalsA: emo(0, 0, 0, 0, 0),  // safe = no additional emotion signal

            answerBText: 'I feel very distressed and may need extra support',
            meaningB: 'Distressed',
            nextRouteB: 'finish_high_support',
            scoreDimB: 'safety',
            scoreValB: 2,
            safetyFlagB: 'soft',
            emotionSignalsB: emo(2, 1, 0, 1, 0),  // distressed = overwhelm + sad

            answerCText: 'I do not feel safe right now',
            meaningC: 'Danger',
            nextRouteC: 'R5',
            scoreDimC: 'safety',
            scoreValC: 3,
            safetyFlagC: 'hard',
            emotionSignalsC: emo(2, 2, 0, 2, 0),  // unsafe = overwhelm + anxious + sad
        })),

        // Step 6 — R5 (urgent path)
        {
            stepNumber: 6,
            routeGroup: 'R5',
            questionText: 'Would it help to show urgent support options right now?',

            answerAText: 'Yes, show them now',
            meaningA: 'Accepting urgent help',
            nextRouteA: 'trigger_safety_ui',
            scoreDimA: 'safety',
            scoreValA: 3,
            safetyFlagA: 'hard',
            emotionSignalsA: emo(2, 2, 0, 2, 0),

            answerBText: 'Maybe, but stay with me',
            meaningB: 'Needs holding',
            nextRouteB: 'finish_high_support',
            scoreDimB: 'safety',
            scoreValB: 2,
            safetyFlagB: 'medium',
            emotionSignalsB: emo(2, 1, 0, 2, 0),

            answerCText: 'I need urgent help now',
            meaningC: 'Active crisis',
            nextRouteC: 'trigger_safety_ui',
            scoreDimC: 'safety',
            scoreValC: 3,
            safetyFlagC: 'hard',
            emotionSignalsC: emo(3, 2, 0, 2, 0),
        }
    ];

    for (const q of questions) {
        await prisma.assessmentQuestion.create({ data: q });
    }

    console.log(`Successfully seeded ${questions.length} emotion-aware questions (v3).`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
