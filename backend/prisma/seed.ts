import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Master Assessment Blueprint...');
  await prisma.assessmentQuestion.deleteMany({});

  const questions = [
    // ═══════════════════════════════════════════════════════════════
    // STEP 1 — Current intensity (shared, weight x2)
    // ═══════════════════════════════════════════════════════════════
    {
      stepNumber: 1, routeGroup: 'shared',
      questionText: 'How are you feeling right now?',
      answerAText: 'A bit tense, but manageable',
      meaningA: 'mild current stress', nextRouteA: 'R1', scoreDimA: 'intensity', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'Quite stressed and hard to focus',
      meaningB: 'moderate current stress', nextRouteB: 'R3', scoreDimB: 'intensity', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'Very overwhelmed and hard to settle',
      meaningC: 'high current stress', nextRouteC: 'R4', scoreDimC: 'intensity', scoreValC: 3, safetyFlagC: 'none',
    },

    // ═══════════════════════════════════════════════════════════════
    // STEP 2A — For R1 users (weight x2)
    // ═══════════════════════════════════════════════════════════════
    {
      stepNumber: 2, routeGroup: 'R1',
      questionText: 'Does this feel like a small one-off stress or something that keeps coming back?',
      answerAText: 'Just a small stress right now',
      meaningA: 'passing stress', nextRouteA: 'R1', scoreDimA: 'impact', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'It comes back sometimes',
      meaningB: 'mild recurring stress', nextRouteB: 'R2', scoreDimB: 'impact', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'It happens often',
      meaningC: 'becoming more persistent', nextRouteC: 'R3', scoreDimC: 'impact', scoreValC: 3, safetyFlagC: 'none',
    },

    // STEP 2B — For R3 users
    {
      stepNumber: 2, routeGroup: 'R3',
      questionText: 'How much is this stress affecting what you need to do today?',
      answerAText: 'Only a little',
      meaningA: 'moderate feeling, low interference', nextRouteA: 'R2', scoreDimA: 'impact', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'It is affecting some tasks',
      meaningB: 'moderate interference', nextRouteB: 'R3', scoreDimB: 'impact', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'It is making normal tasks difficult',
      meaningC: 'strong functional impact', nextRouteC: 'R4', scoreDimC: 'impact', scoreValC: 3, safetyFlagC: 'none',
    },

    // STEP 2C — For R4 users
    {
      stepNumber: 2, routeGroup: 'R4',
      questionText: 'Does this feel in control or out of control right now?',
      answerAText: 'I still have some control',
      meaningA: 'high stress but partly manageable', nextRouteA: 'R3', scoreDimA: 'control', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'It is getting hard to manage',
      meaningB: 'high stress and unstable control', nextRouteB: 'R4', scoreDimB: 'control', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'It feels out of control',
      meaningC: 'severe distress', nextRouteC: 'R5', scoreDimC: 'control', scoreValC: 3, safetyFlagC: 'soft',
    },

    // ═══════════════════════════════════════════════════════════════
    // STEP 3A — For R1 or R2 (weight x1)
    // ═══════════════════════════════════════════════════════════════
    {
      stepNumber: 3, routeGroup: 'R1',
      questionText: 'How long have you been feeling like this?',
      answerAText: 'Just today',
      meaningA: 'very recent', nextRouteA: 'R1', scoreDimA: 'duration', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'A few days',
      meaningB: 'short ongoing stress', nextRouteB: 'R2', scoreDimB: 'duration', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'More than a week',
      meaningC: 'persistent stress', nextRouteC: 'R3', scoreDimC: 'duration', scoreValC: 3, safetyFlagC: 'none',
    },
    {
      stepNumber: 3, routeGroup: 'R2',
      questionText: 'How long have you been feeling like this?',
      answerAText: 'Just today',
      meaningA: 'very recent', nextRouteA: 'R2', scoreDimA: 'duration', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'A few days',
      meaningB: 'short ongoing stress', nextRouteB: 'R2', scoreDimB: 'duration', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'More than a week',
      meaningC: 'persistent stress', nextRouteC: 'R3', scoreDimC: 'duration', scoreValC: 3, safetyFlagC: 'none',
    },

    // STEP 3B — For R3
    {
      stepNumber: 3, routeGroup: 'R3',
      questionText: 'Has this stress been building up over time?',
      answerAText: 'No, it is recent',
      meaningA: 'moderate but recent', nextRouteA: 'R3', scoreDimA: 'duration', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'Yes, over several days',
      meaningB: 'moderate ongoing stress', nextRouteB: 'R3', scoreDimB: 'duration', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'Yes, for quite a while',
      meaningC: 'long-standing strain', nextRouteC: 'R4', scoreDimC: 'duration', scoreValC: 3, safetyFlagC: 'none',
    },

    // STEP 3C — For R4 or R5
    {
      stepNumber: 3, routeGroup: 'R4',
      questionText: 'Has this intense feeling stayed with you for a while?',
      answerAText: 'No, it hit suddenly',
      meaningA: 'acute spike', nextRouteA: 'R4', scoreDimA: 'duration', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'Yes, for a few days',
      meaningB: 'short-term high stress', nextRouteB: 'R4', scoreDimB: 'duration', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'Yes, for a long time',
      meaningC: 'sustained high distress', nextRouteC: 'R5', scoreDimC: 'duration', scoreValC: 3, safetyFlagC: 'soft',
    },
    {
      stepNumber: 3, routeGroup: 'R5',
      questionText: 'Has this intense feeling stayed with you for a while?',
      answerAText: 'No, it hit suddenly',
      meaningA: 'acute spike', nextRouteA: 'R5', scoreDimA: 'duration', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'Yes, for a few days',
      meaningB: 'short-term high stress', nextRouteB: 'R5', scoreDimB: 'duration', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'Yes, for a long time',
      meaningC: 'sustained high distress', nextRouteC: 'R5', scoreDimC: 'duration', scoreValC: 3, safetyFlagC: 'soft',
    },

    // ═══════════════════════════════════════════════════════════════
    // STEP 4A — For R1 or R2 (weight x1)
    // ═══════════════════════════════════════════════════════════════
    {
      stepNumber: 4, routeGroup: 'R1',
      questionText: 'What feels most true for you right now?',
      answerAText: 'I just feel a bit tense',
      meaningA: 'mainly light physical stress', nextRouteA: 'R1', scoreDimA: 'symptoms', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'My mind feels busy',
      meaningB: 'mental strain increasing', nextRouteB: 'R2', scoreDimB: 'symptoms', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'My body and mind both feel strained',
      meaningC: 'stronger combined symptoms', nextRouteC: 'R3', scoreDimC: 'symptoms', scoreValC: 3, safetyFlagC: 'none',
    },
    {
      stepNumber: 4, routeGroup: 'R2',
      questionText: 'What feels most true for you right now?',
      answerAText: 'I just feel a bit tense',
      meaningA: 'mainly light physical stress', nextRouteA: 'R2', scoreDimA: 'symptoms', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'My mind feels busy',
      meaningB: 'mental strain increasing', nextRouteB: 'R2', scoreDimB: 'symptoms', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'My body and mind both feel strained',
      meaningC: 'stronger combined symptoms', nextRouteC: 'R3', scoreDimC: 'symptoms', scoreValC: 3, safetyFlagC: 'none',
    },

    // STEP 4B — For R3
    {
      stepNumber: 4, routeGroup: 'R3',
      questionText: 'What is bothering you most?',
      answerAText: 'I feel mentally distracted',
      meaningA: 'cognitive stress', nextRouteA: 'R3', scoreDimA: 'symptoms', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'I feel physically tense and uneasy',
      meaningB: 'moderate physical stress load', nextRouteB: 'R3', scoreDimB: 'symptoms', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'I feel overloaded in both mind and body',
      meaningC: 'strong combined stress load', nextRouteC: 'R4', scoreDimC: 'symptoms', scoreValC: 3, safetyFlagC: 'none',
    },

    // STEP 4C — For R4 or R5
    {
      stepNumber: 4, routeGroup: 'R4',
      questionText: 'Which sounds closest to how you feel?',
      answerAText: 'Very stressed, but still able to answer clearly',
      meaningA: 'high stress but still grounded', nextRouteA: 'R4', scoreDimA: 'symptoms', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'Very distressed and struggling to settle',
      meaningB: 'high distress', nextRouteB: 'R4', scoreDimB: 'symptoms', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'I feel close to breaking point',
      meaningC: 'severe distress', nextRouteC: 'R5', scoreDimC: 'symptoms', scoreValC: 3, safetyFlagC: 'soft',
    },
    {
      stepNumber: 4, routeGroup: 'R5',
      questionText: 'Which sounds closest to how you feel?',
      answerAText: 'Very stressed, but still able to answer clearly',
      meaningA: 'high stress but still grounded', nextRouteA: 'R5', scoreDimA: 'symptoms', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'Very distressed and struggling to settle',
      meaningB: 'high distress', nextRouteB: 'R5', scoreDimB: 'symptoms', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'I feel close to breaking point',
      meaningC: 'severe distress', nextRouteC: 'R5', scoreDimC: 'symptoms', scoreValC: 3, safetyFlagC: 'soft',
    },

    // ═══════════════════════════════════════════════════════════════
    // STEP 5 — Coping ability (shared, weight x2)
    // ═══════════════════════════════════════════════════════════════
    {
      stepNumber: 5, routeGroup: 'R1',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      meaningA: 'coping mostly intact', nextRouteA: 'R1', scoreDimA: 'coping', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'I am struggling to manage it properly',
      meaningB: 'coping reduced', nextRouteB: 'R1', scoreDimB: 'coping', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'I do not feel able to cope right now',
      meaningC: 'coping very low', nextRouteC: 'R2', scoreDimC: 'coping', scoreValC: 3, safetyFlagC: 'soft',
    },
    {
      stepNumber: 5, routeGroup: 'R2',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      meaningA: 'coping mostly intact', nextRouteA: 'R1', scoreDimA: 'coping', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'I am struggling to manage it properly',
      meaningB: 'coping reduced', nextRouteB: 'R2', scoreDimB: 'coping', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'I do not feel able to cope right now',
      meaningC: 'coping very low', nextRouteC: 'R3', scoreDimC: 'coping', scoreValC: 3, safetyFlagC: 'soft',
    },
    {
      stepNumber: 5, routeGroup: 'R3',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      meaningA: 'coping mostly intact', nextRouteA: 'R2', scoreDimA: 'coping', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'I am struggling to manage it properly',
      meaningB: 'coping reduced', nextRouteB: 'R3', scoreDimB: 'coping', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'I do not feel able to cope right now',
      meaningC: 'coping very low', nextRouteC: 'R4', scoreDimC: 'coping', scoreValC: 3, safetyFlagC: 'soft',
    },
    {
      stepNumber: 5, routeGroup: 'R4',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      meaningA: 'coping mostly intact', nextRouteA: 'R4', scoreDimA: 'coping', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'I am struggling to manage it properly',
      meaningB: 'coping reduced', nextRouteB: 'R4', scoreDimB: 'coping', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'I do not feel able to cope right now',
      meaningC: 'coping very low', nextRouteC: 'R5', scoreDimC: 'coping', scoreValC: 3, safetyFlagC: 'soft',
    },
    {
      stepNumber: 5, routeGroup: 'R5',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      meaningA: 'coping mostly intact', nextRouteA: 'R5', scoreDimA: 'coping', scoreValA: 1, safetyFlagA: 'none',
      answerBText: 'I am struggling to manage it properly',
      meaningB: 'coping reduced', nextRouteB: 'R5', scoreDimB: 'coping', scoreValB: 2, safetyFlagB: 'none',
      answerCText: 'I do not feel able to cope right now',
      meaningC: 'coping very low', nextRouteC: 'R5', scoreDimC: 'coping', scoreValC: 3, safetyFlagC: 'soft',
    },

    // ═══════════════════════════════════════════════════════════════
    // STEP 6A — Safety check for R1–R4 (override first, score second)
    // ═══════════════════════════════════════════════════════════════
    {
      stepNumber: 6, routeGroup: 'R1',
      questionText: 'Do you feel safe right now?',
      answerAText: 'Yes, I feel safe',
      meaningA: 'no immediate safety concern', nextRouteA: 'FINISH_LOW', scoreDimA: 'safety', scoreValA: 0, safetyFlagA: 'none',
      answerBText: 'I feel very distressed and may need extra support',
      meaningB: 'high support need', nextRouteB: 'FINISH_LOW_ENHANCED', scoreDimB: 'safety', scoreValB: 2, safetyFlagB: 'medium',
      answerCText: 'I do not feel safe right now',
      meaningC: 'urgent concern', nextRouteC: 'URGENT', scoreDimC: 'safety', scoreValC: 3, safetyFlagC: 'hard',
    },
    {
      stepNumber: 6, routeGroup: 'R2',
      questionText: 'Do you feel safe right now?',
      answerAText: 'Yes, I feel safe',
      meaningA: 'no immediate safety concern', nextRouteA: 'FINISH_LOW', scoreDimA: 'safety', scoreValA: 0, safetyFlagA: 'none',
      answerBText: 'I feel very distressed and may need extra support',
      meaningB: 'high support need', nextRouteB: 'FINISH_LOW_ENHANCED', scoreDimB: 'safety', scoreValB: 2, safetyFlagB: 'medium',
      answerCText: 'I do not feel safe right now',
      meaningC: 'urgent concern', nextRouteC: 'URGENT', scoreDimC: 'safety', scoreValC: 3, safetyFlagC: 'hard',
    },
    {
      stepNumber: 6, routeGroup: 'R3',
      questionText: 'Do you feel safe right now?',
      answerAText: 'Yes, I feel safe',
      meaningA: 'no immediate safety concern', nextRouteA: 'FINISH_MID', scoreDimA: 'safety', scoreValA: 0, safetyFlagA: 'none',
      answerBText: 'I feel very distressed and may need extra support',
      meaningB: 'high support need', nextRouteB: 'FINISH_MID_ENHANCED', scoreDimB: 'safety', scoreValB: 2, safetyFlagB: 'medium',
      answerCText: 'I do not feel safe right now',
      meaningC: 'urgent concern', nextRouteC: 'URGENT', scoreDimC: 'safety', scoreValC: 3, safetyFlagC: 'hard',
    },
    {
      stepNumber: 6, routeGroup: 'R4',
      questionText: 'Do you feel safe right now?',
      answerAText: 'Yes, I feel safe',
      meaningA: 'no immediate safety concern', nextRouteA: 'FINISH_HIGH', scoreDimA: 'safety', scoreValA: 0, safetyFlagA: 'none',
      answerBText: 'I feel very distressed and may need extra support',
      meaningB: 'high support need', nextRouteB: 'FINISH_HIGH_ENHANCED', scoreDimB: 'safety', scoreValB: 2, safetyFlagB: 'medium',
      answerCText: 'I do not feel safe right now',
      meaningC: 'urgent concern', nextRouteC: 'URGENT', scoreDimC: 'safety', scoreValC: 3, safetyFlagC: 'hard',
    },

    // STEP 6B — If already R5
    {
      stepNumber: 6, routeGroup: 'R5',
      questionText: 'Would it help to show urgent support options right now?',
      answerAText: 'Yes, show them now',
      meaningA: 'urgent help panel', nextRouteA: 'URGENT', scoreDimA: 'safety', scoreValA: 3, safetyFlagA: 'hard',
      answerBText: 'Maybe, but stay with me',
      meaningB: 'urgent panel + calming guidance', nextRouteB: 'URGENT_CALM', scoreDimB: 'safety', scoreValB: 3, safetyFlagB: 'hard',
      answerCText: 'I need urgent help now',
      meaningC: 'emergency-first panel', nextRouteC: 'URGENT_EMERGENCY', scoreDimC: 'safety', scoreValC: 3, safetyFlagC: 'hard',
    },
  ];

  for (const q of questions) {
    await prisma.assessmentQuestion.create({ data: q });
  }

  console.log(`Successfully seeded ${questions.length} assessment nodes with scoring data!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
