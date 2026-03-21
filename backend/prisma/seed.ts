import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Assessment Questions...');

  // First clear existing
  await prisma.assessmentQuestion.deleteMany({});

  const questions = [
    // --- STEP 1 ---
    {
      stepNumber: 1,
      routeGroup: 'shared',
      questionText: 'How are you feeling right now?',
      answerAText: 'A bit tense, but manageable',
      nextRouteA: 'R1',
      answerBText: 'Quite stressed and hard to focus',
      nextRouteB: 'R3',
      answerCText: 'Very overwhelmed and hard to settle',
      nextRouteC: 'R4',
    },

    // --- STEP 2 ---
    {
      stepNumber: 2,
      routeGroup: 'R1',
      questionText: 'Does this feel like a small one-off stress or something that keeps coming back?',
      answerAText: 'Just a small stress right now',
      nextRouteA: 'R1',
      answerBText: 'It comes back sometimes',
      nextRouteB: 'R2',
      answerCText: 'It happens often',
      nextRouteC: 'R3',
    },
    {
      stepNumber: 2,
      routeGroup: 'R3',
      questionText: 'How much is this stress affecting what you need to do today?',
      answerAText: 'Only a little',
      nextRouteA: 'R2',
      answerBText: 'It is affecting some tasks',
      nextRouteB: 'R3',
      answerCText: 'It is making normal tasks difficult',
      nextRouteC: 'R4',
    },
    {
      stepNumber: 2,
      routeGroup: 'R4',
      questionText: 'Does this feel in control or out of control right now?',
      answerAText: 'I still have some control',
      nextRouteA: 'R3',
      answerBText: 'It is getting hard to manage',
      nextRouteB: 'R4',
      answerCText: 'It feels out of control',
      nextRouteC: 'R5',
    },

    // --- STEP 3 ---
    {
      stepNumber: 3,
      routeGroup: 'R1',
      questionText: 'How long have you been feeling like this?',
      answerAText: 'Just today',
      nextRouteA: 'R1',
      answerBText: 'A few days',
      nextRouteB: 'R2',
      answerCText: 'More than a week',
      nextRouteC: 'R3',
    },
    {
      stepNumber: 3,
      routeGroup: 'R2',
      questionText: 'How long have you been feeling like this?',
      answerAText: 'Just today',
      nextRouteA: 'R2',
      answerBText: 'A few days',
      nextRouteB: 'R2',
      answerCText: 'More than a week',
      nextRouteC: 'R3',
    },
    {
      stepNumber: 3,
      routeGroup: 'R3',
      questionText: 'Has this stress been building up over time?',
      answerAText: 'No, it is recent',
      nextRouteA: 'R3',
      answerBText: 'Yes, over several days',
      nextRouteB: 'R3',
      answerCText: 'Yes, for quite a while',
      nextRouteC: 'R4',
    },
    {
      stepNumber: 3,
      routeGroup: 'R4',
      questionText: 'Has this intense feeling stayed with you for a while?',
      answerAText: 'No, it hit suddenly',
      nextRouteA: 'R4',
      answerBText: 'Yes, for a few days',
      nextRouteB: 'R4',
      answerCText: 'Yes, for a long time',
      nextRouteC: 'R5',
    },
    {
      stepNumber: 3,
      routeGroup: 'R5',
      questionText: 'Has this intense feeling stayed with you for a while?',
      answerAText: 'No, it hit suddenly',
      nextRouteA: 'R5',
      answerBText: 'Yes, for a few days',
      nextRouteB: 'R5',
      answerCText: 'Yes, for a long time',
      nextRouteC: 'R5',
    },

    // --- STEP 4 ---
    {
      stepNumber: 4,
      routeGroup: 'R1',
      questionText: 'What feels most true for you right now?',
      answerAText: 'I just feel a bit tense',
      nextRouteA: 'R1',
      answerBText: 'My mind feels busy',
      nextRouteB: 'R2',
      answerCText: 'My body and mind both feel strained',
      nextRouteC: 'R3',
    },
    {
      stepNumber: 4,
      routeGroup: 'R2',
      questionText: 'What feels most true for you right now?',
      answerAText: 'I just feel a bit tense',
      nextRouteA: 'R2',
      answerBText: 'My mind feels busy',
      nextRouteB: 'R2',
      answerCText: 'My body and mind both feel strained',
      nextRouteC: 'R3',
    },
    {
      stepNumber: 4,
      routeGroup: 'R3',
      questionText: 'What is bothering you most?',
      answerAText: 'I feel mentally distracted',
      nextRouteA: 'R3',
      answerBText: 'I feel physically tense and uneasy',
      nextRouteB: 'R3',
      answerCText: 'I feel overloaded in both mind and body',
      nextRouteC: 'R4',
    },
    {
      stepNumber: 4,
      routeGroup: 'R4',
      questionText: 'Which sounds closest to how you feel?',
      answerAText: 'Very stressed, but still able to answer clearly',
      nextRouteA: 'R4',
      answerBText: 'Very distressed and struggling to settle',
      nextRouteB: 'R4',
      answerCText: 'I feel close to breaking point',
      nextRouteC: 'R5',
    },
    {
      stepNumber: 4,
      routeGroup: 'R5',
      questionText: 'Which sounds closest to how you feel?',
      answerAText: 'Very stressed, but still able to answer clearly',
      nextRouteA: 'R5',
      answerBText: 'Very distressed and struggling to settle',
      nextRouteB: 'R5',
      answerCText: 'I feel close to breaking point',
      nextRouteC: 'R5',
    },

    // --- STEP 5 ---
    {
      stepNumber: 5,
      routeGroup: 'R1',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      nextRouteA: 'R1',
      answerBText: 'I am struggling to manage it properly',
      nextRouteB: 'R1',
      answerCText: 'I do not feel able to cope right now',
      nextRouteC: 'R2',
    },
    {
      stepNumber: 5,
      routeGroup: 'R2',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      nextRouteA: 'R1', // Downshift 1 level
      answerBText: 'I am struggling to manage it properly',
      nextRouteB: 'R2',
      answerCText: 'I do not feel able to cope right now',
      nextRouteC: 'R3',
    },
    {
      stepNumber: 5,
      routeGroup: 'R3',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      nextRouteA: 'R2', // Downshift 1 level
      answerBText: 'I am struggling to manage it properly',
      nextRouteB: 'R3',
      answerCText: 'I do not feel able to cope right now',
      nextRouteC: 'R4',
    },
    {
      stepNumber: 5,
      routeGroup: 'R4',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      nextRouteA: 'R4', // Does not downshift if already high
      answerBText: 'I am struggling to manage it properly',
      nextRouteB: 'R4',
      answerCText: 'I do not feel able to cope right now',
      nextRouteC: 'R5', // Move to R5 if already high
    },
    {
      stepNumber: 5,
      routeGroup: 'R5',
      questionText: 'How able do you feel to cope with this right now?',
      answerAText: 'I can handle it with a little support',
      nextRouteA: 'R5',
      answerBText: 'I am struggling to manage it properly',
      nextRouteB: 'R5',
      answerCText: 'I do not feel able to cope right now',
      nextRouteC: 'R5',
    },

    // --- STEP 6 ---
    {
      stepNumber: 6,
      routeGroup: 'R1',
      questionText: 'Do you feel safe right now?',
      answerAText: 'Yes, I feel safe',
      nextRouteA: 'FINISH_LOW',
      answerBText: 'I feel very distressed and may need extra support',
      nextRouteB: 'FINISH_MID',
      answerCText: 'I do not feel safe right now',
      nextRouteC: 'URGENT',
      safetyFlagC: true,
    },
    {
      stepNumber: 6,
      routeGroup: 'R2',
      questionText: 'Do you feel safe right now?',
      answerAText: 'Yes, I feel safe',
      nextRouteA: 'FINISH_LOW',
      answerBText: 'I feel very distressed and may need extra support',
      nextRouteB: 'FINISH_MID',
      answerCText: 'I do not feel safe right now',
      nextRouteC: 'URGENT',
      safetyFlagC: true,
    },
    {
      stepNumber: 6,
      routeGroup: 'R3',
      questionText: 'Do you feel safe right now?',
      answerAText: 'Yes, I feel safe',
      nextRouteA: 'FINISH_MID',
      answerBText: 'I feel very distressed and may need extra support',
      nextRouteB: 'FINISH_HIGH',
      answerCText: 'I do not feel safe right now',
      nextRouteC: 'URGENT',
      safetyFlagC: true,
    },
    {
      stepNumber: 6,
      routeGroup: 'R4',
      questionText: 'Do you feel safe right now?',
      answerAText: 'Yes, I feel safe',
      nextRouteA: 'FINISH_HIGH',
      answerBText: 'I feel very distressed and may need extra support',
      nextRouteB: 'FINISH_HIGH',
      answerCText: 'I do not feel safe right now',
      nextRouteC: 'URGENT',
      safetyFlagC: true,
    },
    {
      stepNumber: 6,
      routeGroup: 'R5',
      questionText: 'Would it help to show urgent support options right now?',
      answerAText: 'Yes, show them now',
      nextRouteA: 'URGENT',
      safetyFlagA: true,
      answerBText: 'Maybe, but stay with me',
      nextRouteB: 'URGENT',
      safetyFlagB: true,
      answerCText: 'I need urgent help now',
      nextRouteC: 'URGENT',
      safetyFlagC: true,
    },
  ];

  for (const q of questions) {
    await prisma.assessmentQuestion.create({ data: q });
  }

  console.log('Successfully seeded 24 dynamic assessment nodes!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
