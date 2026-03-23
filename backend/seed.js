const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing assessment questions...');
    await prisma.assessmentQuestion.deleteMany({});

    console.log('Seeding 13 master assessment questions...');

    const questions = [
        // Step 1 - Current intensity
        {
            stepNumber: 1,
            routeGroup: 'shared',
            questionText: 'How are you feeling right now?',
            answerAText: 'A bit tense, but manageable',
            meaningA: 'Mild/passing stress',
            nextRouteA: 'R1',
            scoreDimA: 'intensity',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'Quite stressed and hard to focus',
            meaningB: 'Moderate/affecting function',
            nextRouteB: 'R3',
            scoreDimB: 'intensity',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'Very overwhelmed and hard to settle',
            meaningC: 'High/hard to control',
            nextRouteC: 'R4',
            scoreDimC: 'intensity',
            scoreValC: 3,
            safetyFlagC: 'none',
        },
        // Step 2 - If R1
        {
            stepNumber: 2,
            routeGroup: 'R1',
            questionText: 'Does this feel like a small one-off stress or something that keeps coming back?',
            answerAText: 'Just a small stress right now',
            meaningA: 'Small one-off',
            nextRouteA: 'R1',
            scoreDimA: 'impact',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'It comes back sometimes',
            meaningB: 'Repeating mild',
            nextRouteB: 'R2',
            scoreDimB: 'impact',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'It happens often',
            meaningC: 'Frequent tension',
            nextRouteC: 'R3',
            scoreDimC: 'impact',
            scoreValC: 3,
            safetyFlagC: 'none',
        },
        // Step 2 - If R3
        {
            stepNumber: 2,
            routeGroup: 'R3',
            questionText: 'How much is this stress affecting what you need to do today?',
            answerAText: 'Only a little',
            meaningA: 'Low disruption',
            nextRouteA: 'R2',
            scoreDimA: 'impact',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'It is affecting some tasks',
            meaningB: 'Moderate disruption',
            nextRouteB: 'R3',
            scoreDimB: 'impact',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'It is making normal tasks difficult',
            meaningC: 'High disruption',
            nextRouteC: 'R4',
            scoreDimC: 'impact',
            scoreValC: 3,
            safetyFlagC: 'none',
        },
        // Step 2 - If R4
        {
            stepNumber: 2,
            routeGroup: 'R4',
            questionText: 'Does this feel in control or out of control right now?',
            answerAText: 'I still have some control',
            meaningA: 'Managed high stress',
            nextRouteA: 'R3',
            scoreDimA: 'control',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'It is getting hard to manage',
            meaningB: 'Struggling to manage',
            nextRouteB: 'R4',
            scoreDimB: 'control',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'It feels out of control',
            meaningC: 'Loss of control',
            nextRouteC: 'R5',
            scoreDimC: 'control',
            scoreValC: 3,
            safetyFlagC: 'medium',
        },
        // Step 3 - If R1 or R2 -> create one for each for explicit querying, or one for 'R1, R2'.
        // Since DB routeGroup is a varchar, let's create two exact copies for R1 and R2 but with the correct logic as specified.
        ...['R1', 'R2'].map(r => ({
            stepNumber: 3,
            routeGroup: r,
            questionText: 'How long have you been feeling like this?',
            answerAText: 'Just today',
            meaningA: 'Acute short',
            nextRouteA: r, // Keep current route (R1 -> R1, R2 -> R2)
            scoreDimA: 'duration',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'A few days',
            meaningB: 'Several days',
            nextRouteB: 'R2', // "if R1 then R2, if R2 then stay R2" -> both go to R2
            scoreDimB: 'duration',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'More than a week',
            meaningC: 'Prolonged',
            nextRouteC: 'R3',
            scoreDimC: 'duration',
            scoreValC: 3,
            safetyFlagC: 'none',
        })),
        // Step 3 - If R3
        {
            stepNumber: 3,
            routeGroup: 'R3',
            questionText: 'Has this stress been building up over time?',
            answerAText: 'No, it is recent',
            meaningA: 'Recent onset',
            nextRouteA: 'R3',
            scoreDimA: 'duration',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'Yes, over several days',
            meaningB: 'Building',
            nextRouteB: 'R3',
            scoreDimB: 'duration',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'Yes, for quite a while',
            meaningC: 'Long term buildup',
            nextRouteC: 'R4',
            scoreDimC: 'duration',
            scoreValC: 3,
            safetyFlagC: 'none',
        },
        // Step 3 - If R4 or R5 -> create for R4 and R5
        ...['R4', 'R5'].map(r => ({
            stepNumber: 3,
            routeGroup: r,
            questionText: 'Has this intense feeling stayed with you for a while?',
            answerAText: 'No, it hit suddenly',
            meaningA: 'Acute spike',
            nextRouteA: r, // "stay high but note acute spike" -> meaning stay R4 or R5
            scoreDimA: 'duration',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'Yes, for a few days',
            meaningB: 'Sustained high',
            nextRouteB: r === 'R5' ? 'R5' : 'R4', // "stay R4" (if R5 already, stay R5 makes sense)
            scoreDimB: 'duration',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'Yes, for a long time',
            meaningC: 'Prolonged severe',
            nextRouteC: 'R5',
            scoreDimC: 'duration',
            scoreValC: 3,
            safetyFlagC: 'none',
        })),
        // Step 4 - If R1 or R2
        ...['R1', 'R2'].map(r => ({
            stepNumber: 4,
            routeGroup: r,
            questionText: 'What feels most true for you right now?',
            answerAText: 'I just feel a bit tense',
            meaningA: 'Mental tension only',
            nextRouteA: r, // keep route
            scoreDimA: 'symptoms',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'My mind feels busy',
            meaningB: 'Busy mind',
            nextRouteB: 'R2', // push toward R2
            scoreDimB: 'symptoms',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'My body and mind both feel strained',
            meaningC: 'Physical & mental tension',
            nextRouteC: 'R3', // move to R3
            scoreDimC: 'symptoms',
            scoreValC: 3,
            safetyFlagC: 'none',
        })),
        // Step 4 - If R3
        {
            stepNumber: 4,
            routeGroup: 'R3',
            questionText: 'What is bothering you most?',
            answerAText: 'I feel mentally distracted',
            meaningA: 'Cognitive load',
            nextRouteA: 'R3',
            scoreDimA: 'symptoms',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'I feel physically tense and uneasy',
            meaningB: 'Somatic anxiety',
            nextRouteB: 'R3',
            scoreDimB: 'symptoms',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'I feel overloaded in both mind and body',
            meaningC: 'System overload',
            nextRouteC: 'R4', // move to R4
            scoreDimC: 'symptoms',
            scoreValC: 3,
            safetyFlagC: 'none',
        },
        // Step 4 - If R4 or R5
        ...['R4', 'R5'].map(r => ({
            stepNumber: 4,
            routeGroup: r,
            questionText: 'Which sounds closest to how you feel?',
            answerAText: 'Very stressed, but still able to answer clearly',
            meaningA: 'High distress, functioning',
            nextRouteA: r === 'R5' ? 'R5' : 'R4', // stay R4
            scoreDimA: 'symptoms',
            scoreValA: 1,
            safetyFlagA: 'none',

            answerBText: 'Very distressed and struggling to settle',
            meaningB: 'Agitated',
            nextRouteB: r === 'R5' ? 'R5' : 'R4', // stay R4
            scoreDimB: 'symptoms',
            scoreValB: 2,
            safetyFlagB: 'none',

            answerCText: 'I feel close to breaking point',
            meaningC: 'Overwhelmed',
            nextRouteC: 'R5', // R5
            scoreDimC: 'symptoms',
            scoreValC: 3,
            safetyFlagC: 'medium',
        })),
        // Step 5 - Coping (same for all)
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

                answerBText: 'I am struggling to manage it properly',
                meaningB: 'Struggling',
                nextRouteB: r,
                scoreDimB: 'coping',
                scoreValB: 2,
                safetyFlagB: 'none',

                answerCText: 'I do not feel able to cope right now',
                meaningC: 'Overwhelmed coping',
                nextRouteC: upshift,
                scoreDimC: 'coping',
                scoreValC: 3,
                safetyFlagC: r === 'R5' ? 'medium' : 'none',
            };
        }),
        // Step 6 - Safety (R1-R4)
        ...['R1', 'R2', 'R3', 'R4'].map(r => ({
            stepNumber: 6,
            routeGroup: r,
            questionText: 'Do you feel safe right now?',
            answerAText: 'Yes, I feel safe',
            meaningA: 'Safe',
            nextRouteA: 'finish', // normal finish
            scoreDimA: 'safety',
            scoreValA: 0,
            safetyFlagA: 'none',

            answerBText: 'I feel very distressed and may need extra support',
            meaningB: 'Distressed',
            nextRouteB: 'finish_high_support', // high-support finish
            scoreDimB: 'safety',
            scoreValB: 2,
            safetyFlagB: 'soft',

            answerCText: 'I do not feel safe right now',
            meaningC: 'Danger',
            nextRouteC: 'R5', // urgent
            scoreDimC: 'safety',
            scoreValC: 3,
            safetyFlagC: 'hard',
        })),
        // Step 6 - Safety (R5)
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

            answerBText: 'Maybe, but stay with me',
            meaningB: 'Needs holding',
            nextRouteB: 'finish_high_support',
            scoreDimB: 'safety',
            scoreValB: 2,
            safetyFlagB: 'medium',

            answerCText: 'I need urgent help now',
            meaningC: 'Active crisis',
            nextRouteC: 'trigger_safety_ui',
            scoreDimC: 'safety',
            scoreValC: 3,
            safetyFlagC: 'hard',
        }
    ];

    for (const q of questions) {
        await prisma.assessmentQuestion.create({ data: q });
    }

    console.log(`Successfully seeded ${questions.length} questions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
