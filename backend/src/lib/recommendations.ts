/**
 * Silent Help — Wellness Recommendation Engine
 * 
 * The core intelligence system. Takes the 6-step onboarding answers
 * and generates a deeply personalized wellness profile.
 * 
 * This is a two-layer system:
 *   Layer 1: Rule-based logic (deterministic, instant, always works)
 *   Layer 2: AI enhancement (adds personalized insight + nuance)
 * 
 * The combination produces a UNIQUE profile for every user.
 */

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

export interface OnboardingAnswers {
    energy: 'high' | 'moderate' | 'low';
    concern: string;        // dynamic — varies by energy level
    context: string;        // dynamic — varies by energy + concern
    approach: string;       // dynamic — what they need
    support_style: string;  // how they want AI to communicate
    time: string;           // 1, 3, 5, or 10
}

export interface WellnessTool {
    id: string;
    name: string;
    description: string;
    icon: string;
    duration: number;      // minutes
    priority: number;      // 1 = highest priority
    category: 'breathing' | 'grounding' | 'movement' | 'journaling' | 'cognitive' | 'rest' | 'social';
    technique: string;     // specific technique name
    instructions: string;  // brief how-to
}

export interface DashboardTheme {
    gradient: string;
    accent: string;
    mood: string;          // overall mood word
    greeting: string;      // personalized greeting
    ambiance: 'calm' | 'energizing' | 'grounding' | 'nurturing' | 'focused';
}

export interface AIPersonality {
    tone: string;          // e.g. "gentle and reassuring"
    style: string;         // communication style
    systemPrompt: string;  // full system prompt for the AI
    openingMessage: string; // first message to user
    avoidTopics: string[]; // topics to be careful with
}

export interface WellnessProfile {
    // Core identification
    archetype: string;         // e.g. "The Overwhelmed Thinker", "The Restless Worrier"
    state: string;            // brief state description
    urgencyLevel: 'low' | 'moderate' | 'high' | 'crisis';

    // What to show on dashboard
    tools: WellnessTool[];         // ordered list of recommended tools
    primaryTool: WellnessTool;     // the FIRST thing they should do
    quickRelief: WellnessTool;     // fastest possible intervention
    deeperWork: WellnessTool;      // for when they have more time

    // Dashboard appearance
    theme: DashboardTheme;

    // AI behavior
    aiPersonality: AIPersonality;

    // Recommendations
    journalPrompt: string;        // personalized journal prompt
    affirmation: string;          // personalized affirmation
    bodyFocus: string;            // what body area to focus on

    // Raw data
    answers: OnboardingAnswers;
}

// ═══════════════════════════════════════════════
// TOOL DATABASE — All available wellness tools
// ═══════════════════════════════════════════════

const TOOLS: Record<string, WellnessTool> = {
    box_breathing: {
        id: 'box_breathing',
        name: 'Box Breathing',
        description: 'Slow 4-4-4-4 rhythm to activate your parasympathetic nervous system',
        icon: '🌊',
        duration: 4,
        priority: 0,
        category: 'breathing',
        technique: 'Box Breathing (4-4-4-4)',
        instructions: 'Breathe in for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat.',
    },
    elongated_exhale: {
        id: 'elongated_exhale',
        name: 'Elongated Exhale',
        description: 'Extended exhale triggers your vagus nerve — instant calm',
        icon: '💨',
        duration: 2,
        priority: 0,
        category: 'breathing',
        technique: '4-7-8 Breathing',
        instructions: 'Breathe in for 4 counts, hold for 7, exhale slowly for 8. Repeat 3-4 times.',
    },
    physiological_sigh: {
        id: 'physiological_sigh',
        name: 'Physiological Sigh',
        description: 'Double inhale + long exhale — the fastest way to reduce stress (research-backed)',
        icon: '😮‍💨',
        duration: 1,
        priority: 0,
        category: 'breathing',
        technique: 'Double Inhale Sigh',
        instructions: 'Quick inhale through nose, then another short inhale, then long slow exhale through mouth.',
    },
    grounding_54321: {
        id: 'grounding_54321',
        name: '5-4-3-2-1 Grounding',
        description: 'Reconnect to the present through your five senses',
        icon: '🖐️',
        duration: 3,
        priority: 0,
        category: 'grounding',
        technique: '5 Senses Grounding',
        instructions: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.',
    },
    body_scan: {
        id: 'body_scan',
        name: 'Body Scan',
        description: 'Scan from head to toe, releasing tension in each area',
        icon: '✨',
        duration: 5,
        priority: 0,
        category: 'grounding',
        technique: 'Progressive Body Scan',
        instructions: 'Close your eyes. Start at your head and slowly move attention down to your toes, releasing tension.',
    },
    cold_water_reset: {
        id: 'cold_water_reset',
        name: 'Cold Water Reset',
        description: 'Splash cold water on face — triggers the dive reflex to lower heart rate',
        icon: '🧊',
        duration: 1,
        priority: 0,
        category: 'grounding',
        technique: 'Mammalian Dive Reflex',
        instructions: 'Run cold water over your wrists or splash on your face for 30 seconds.',
    },
    gentle_stretching: {
        id: 'gentle_stretching',
        name: 'Gentle Stretching',
        description: 'Release physical tension with slow, deliberate stretches',
        icon: '🧘',
        duration: 5,
        priority: 0,
        category: 'movement',
        technique: 'Tension Release Stretches',
        instructions: 'Neck rolls, shoulder shrugs, chest opener, standing forward fold. Hold each 15-20 seconds.',
    },
    shake_it_out: {
        id: 'shake_it_out',
        name: 'Shake It Out',
        description: 'Shake your body vigorously — releases trapped fight/flight energy',
        icon: '🏃',
        duration: 2,
        priority: 0,
        category: 'movement',
        technique: 'Somatic Shaking',
        instructions: 'Stand up and shake your hands, arms, legs, whole body for 60 seconds. Let the energy out.',
    },
    walking_reset: {
        id: 'walking_reset',
        name: 'Walk & Breathe',
        description: 'A short mindful walk paired with rhythmic breathing',
        icon: '🚶',
        duration: 5,
        priority: 0,
        category: 'movement',
        technique: 'Walking Meditation',
        instructions: 'Walk slowly. Match your breathing to your steps. 4 steps in, 4 steps out.',
    },
    thought_naming: {
        id: 'thought_naming',
        name: 'Thought Naming',
        description: 'Name your thoughts as they come — "worry", "plan", "memory" — to create distance',
        icon: '🏷️',
        duration: 3,
        priority: 0,
        category: 'cognitive',
        technique: 'Cognitive Defusion',
        instructions: 'Close your eyes. As thoughts come, silently label them: "planning", "worrying", "remembering". Don\'t judge.',
    },
    brain_dump: {
        id: 'brain_dump',
        name: 'Brain Dump',
        description: 'Write everything on your mind — no filter, no structure',
        icon: '📝',
        duration: 5,
        priority: 0,
        category: 'journaling',
        technique: 'Stream of Consciousness Writing',
        instructions: 'Open your journal. Write everything in your mind for 5 minutes. Don\'t edit, don\'t stop.',
    },
    gratitude_micro: {
        id: 'gratitude_micro',
        name: 'Micro Gratitude',
        description: 'Name 3 tiny things you\'re grateful for right now',
        icon: '🙏',
        duration: 1,
        priority: 0,
        category: 'journaling',
        technique: 'Gratitude Practice',
        instructions: 'Name 3 small things you appreciate right now. A warm drink? Sunlight? A comfortable chair?',
    },
    self_compassion: {
        id: 'self_compassion',
        name: 'Self-Compassion Pause',
        description: 'Place a hand on your heart. Speak to yourself as you would a friend.',
        icon: '💚',
        duration: 2,
        priority: 0,
        category: 'social',
        technique: 'Self-Compassion Break',
        instructions: 'Hand on heart. Say: "This is a moment of suffering. Everyone struggles. May I be kind to myself."',
    },
    talk_to_ai: {
        id: 'talk_to_ai',
        name: 'Talk It Out',
        description: 'Sometimes you just need to be heard. I\'m here.',
        icon: '💬',
        duration: 5,
        priority: 0,
        category: 'social',
        technique: 'Supportive Conversation',
        instructions: 'Open a chat. Say what you need to say. No pressure, no judgment.',
    },
    rest_permission: {
        id: 'rest_permission',
        name: 'Permission to Rest',
        description: 'Close your eyes. You have permission to do absolutely nothing.',
        icon: '😴',
        duration: 5,
        priority: 0,
        category: 'rest',
        technique: 'Active Rest',
        instructions: 'Find a comfortable position. Close your eyes. Breathe naturally. There\'s nothing to do.',
    },
    energy_boost: {
        id: 'energy_boost',
        name: 'Quick Energy Boost',
        description: 'Energising breath pattern + power pose to shift your state',
        icon: '⚡',
        duration: 2,
        priority: 0,
        category: 'breathing',
        technique: 'Bellows Breath + Power Pose',
        instructions: 'Stand tall, hands on hips. 20 quick breaths through nose (like bellows). Hold. Exhale. Repeat.',
    },
    single_task_focus: {
        id: 'single_task_focus',
        name: 'Single Task Focus',
        description: 'Pick ONE thing. Set a timer. Everything else can wait.',
        icon: '🎯',
        duration: 5,
        priority: 0,
        category: 'cognitive',
        technique: 'Micro-Pomodoro',
        instructions: 'Choose your most important task. Set a 5-minute timer. Work on ONLY that task. Nothing else.',
    },
};

// ═══════════════════════════════════════════════
// ARCHETYPE SYSTEM — Maps answer combos to profiles
// ═══════════════════════════════════════════════

interface ArchetypeRule {
    conditions: Partial<OnboardingAnswers>;
    archetype: string;
    state: string;
    ambiance: DashboardTheme['ambiance'];
    gradient: string;
    accent: string;
    greeting: string;
    mood: string;
    primaryToolId: string;
    quickReliefId: string;
    deeperWorkId: string;
    toolIds: string[];
    aiTone: string;
    aiStyle: string;
    journalPrompt: string;
    affirmation: string;
    bodyFocus: string;
    openingMessage: string;
    avoidTopics: string[];
}

// Each rule matches energy + concern. More specific rules override general ones.
const ARCHETYPE_RULES: ArchetypeRule[] = [
    // ─── HIGH ENERGY ARCHETYPES ──────────────────
    {
        conditions: { energy: 'high', concern: 'anxiety' },
        archetype: 'The Wired Worrier',
        state: 'Restless energy feeding anxious thoughts',
        ambiance: 'calm',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)',
        accent: '#38bdf8',
        greeting: 'Your mind is racing, but we can slow it down.',
        mood: 'anxious',
        primaryToolId: 'elongated_exhale',
        quickReliefId: 'physiological_sigh',
        deeperWorkId: 'grounding_54321',
        toolIds: ['elongated_exhale', 'physiological_sigh', 'grounding_54321', 'shake_it_out', 'thought_naming'],
        aiTone: 'warm, steady, and reassuring',
        aiStyle: 'Validate first, then gently redirect. Use grounding language. Short sentences when anxiety is high.',
        journalPrompt: 'The worry that\'s loudest right now is... When I step back, I notice...',
        affirmation: 'Your mind is trying to protect you. But right now, you\'re safe. Breathe.',
        bodyFocus: 'Notice your breathing pattern — it might be shallow or fast. Let\'s slow it down.',
        openingMessage: 'I can tell your mind is busy right now. That\'s okay. Would you like to try a quick breathing exercise to take the edge off, or would you rather just talk about what\'s on your mind?',
        avoidTopics: ['worst-case scenarios', 'future planning'],
    },
    {
        conditions: { energy: 'high', concern: 'anger' },
        archetype: 'The Burning Fuse',
        state: 'Frustration and anger building up with no release',
        ambiance: 'grounding',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #422006 100%)',
        accent: '#f97316',
        greeting: 'That anger is valid. Let\'s give it somewhere safe to go.',
        mood: 'frustrated',
        primaryToolId: 'shake_it_out',
        quickReliefId: 'cold_water_reset',
        deeperWorkId: 'brain_dump',
        toolIds: ['shake_it_out', 'cold_water_reset', 'walking_reset', 'brain_dump', 'self_compassion'],
        aiTone: 'direct, validating, no-nonsense',
        aiStyle: 'Acknowledge the anger. Don\'t minimise. Offer physical outlets first.',
        journalPrompt: 'What triggered this anger was... What I actually need is...',
        affirmation: 'Your anger is telling you something important. It\'s safe to feel it.',
        bodyFocus: 'Your jaw and fists might be clenched. Consciously release them.',
        openingMessage: 'I hear you — that anger is real and valid. Sometimes when energy is this high, the best first step is physical. Want to try shaking it out for 60 seconds? Or if you\'d rather vent, I\'m here to listen.',
        avoidTopics: ['calming down', 'relaxing', 'seeing their side'],
    },
    {
        conditions: { energy: 'high', concern: 'racing_thoughts' },
        archetype: 'The Spinning Mind',
        state: 'Trapped in a loop of circular thoughts with wired energy',
        ambiance: 'focused',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        accent: '#67e8f9',
        greeting: 'Your mind is working overtime. Let\'s give it a break.',
        mood: 'scattered',
        primaryToolId: 'thought_naming',
        quickReliefId: 'physiological_sigh',
        deeperWorkId: 'brain_dump',
        toolIds: ['thought_naming', 'physiological_sigh', 'grounding_54321', 'brain_dump', 'single_task_focus'],
        aiTone: 'clear, structured, and gently directive',
        aiStyle: 'Use structure to counter chaos. Short lists. Clear next steps. Avoid open-ended questions.',
        journalPrompt: 'The thought loop I\'m stuck in is... The ONE thing that matters most right now is...',
        affirmation: 'You don\'t need to solve everything right now. One breath, one step.',
        bodyFocus: 'Feel your feet on the ground. You\'re here, right now, in this moment.',
        openingMessage: 'When your mind is spinning this fast, it helps to do one concrete thing. Let\'s try thought naming — just labelling each thought as it comes. "Planning." "Worrying." "Remembering." It creates some space. Want to try that, or would you rather get everything out of your head with a brain dump?',
        avoidTopics: ['complicated analysis', 'adding more decisions'],
    },
    {
        conditions: { energy: 'high', concern: 'restless_body' },
        archetype: 'The Live Wire',
        state: 'Body buzzing with restless energy demanding release',
        ambiance: 'grounding',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #164e63 100%)',
        accent: '#5eead4',
        greeting: 'Your body is charged up. Let\'s channel that energy.',
        mood: 'restless',
        primaryToolId: 'shake_it_out',
        quickReliefId: 'walking_reset',
        deeperWorkId: 'body_scan',
        toolIds: ['shake_it_out', 'walking_reset', 'body_scan', 'grounding_54321', 'gentle_stretching'],
        aiTone: 'energetic, grounding, physical-first',
        aiStyle: 'Lead with body-based approaches. Match their energy, then guide it downward. Movement before thinking.',
        journalPrompt: 'My body is buzzing because... What it needs right now is...',
        affirmation: 'Your body knows what it needs. Trust the impulse to move.',
        bodyFocus: 'Feel your feet on the ground. Let the energy flow downward through your legs.',
        openingMessage: 'Your body is asking for something — it wants to move. Let\'s start there. Want to try shaking it out for 60 seconds? Just stand up and let your body move however it wants. Or we can do a walking reset if you prefer.',
        avoidTopics: ['sitting still', 'meditation', 'forcing calm'],
    },
    {
        conditions: { energy: 'high', concern: 'panic' },
        archetype: 'The Storm Surge',
        state: 'Panic rising — body in alarm mode, need immediate grounding',
        ambiance: 'calm',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        accent: '#818cf8',
        greeting: 'You\'re safe right now. Let\'s slow this down together.',
        mood: 'panicked',
        primaryToolId: 'physiological_sigh',
        quickReliefId: 'cold_water_reset',
        deeperWorkId: 'body_scan',
        toolIds: ['physiological_sigh', 'cold_water_reset', 'elongated_exhale', 'grounding_54321', 'body_scan'],
        aiTone: 'calm, steady, very grounding, slow-paced',
        aiStyle: 'Short sentences. Directive but gentle. No questions that require thinking. Breathing first, always.',
        journalPrompt: 'Right now I notice my body feeling... One thing I know to be true is...',
        affirmation: 'This will pass. Your body is protecting you. You are safe right now.',
        bodyFocus: 'Focus on your chest and shoulders — let them soften with each exhale.',
        openingMessage: 'I\'m right here with you. You\'re safe. Before anything else, let\'s do one thing together: a slow physiological sigh. Double inhale through the nose, then a long exhale out. Just that. Ready?',
        avoidTopics: ['productivity', 'goals', 'future planning', 'what\'s wrong'],
    },

    // ─── MODERATE ENERGY ARCHETYPES ──────────────
    {
        conditions: { energy: 'moderate', concern: 'stress' },
        archetype: 'The Slow Burn',
        state: 'Stress building steadily, not yet at breaking point',
        ambiance: 'calm',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 100%)',
        accent: '#7dd3fc',
        greeting: 'That building stress is real. Let\'s ease the pressure.',
        mood: 'stressed',
        primaryToolId: 'box_breathing',
        quickReliefId: 'physiological_sigh',
        deeperWorkId: 'brain_dump',
        toolIds: ['box_breathing', 'physiological_sigh', 'brain_dump', 'walking_reset', 'talk_to_ai'],
        aiTone: 'steady, reassuring, and warm',
        aiStyle: 'Validate the stress. Offer structured de-escalation. Help organize.',
        journalPrompt: 'The stress is coming from... One thing I can let go of today is...',
        affirmation: 'You\'re handling more than you think. It\'s okay to ask for help.',
        bodyFocus: 'Check in with your stomach and chest. Breathe into wherever you feel tightness.',
        openingMessage: 'Stress has been building, and you came here — that\'s already a smart move. Let\'s start with a few minutes of box breathing to settle your nervous system. Or if you\'d rather name what\'s stressing you, I\'m listening.',
        avoidTopics: ['adding more responsibilities'],
    },
    {
        conditions: { energy: 'moderate', concern: 'something_happened' },
        archetype: 'The Fresh Wound',
        state: 'Processing a specific event — the wound is still open',
        ambiance: 'nurturing',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        accent: '#94a3b8',
        greeting: 'Something happened, and you\'re still processing. That takes courage.',
        mood: 'processing',
        primaryToolId: 'talk_to_ai',
        quickReliefId: 'self_compassion',
        deeperWorkId: 'brain_dump',
        toolIds: ['talk_to_ai', 'self_compassion', 'brain_dump', 'gentle_stretching', 'box_breathing'],
        aiTone: 'warm, compassionate, patient, unhurried',
        aiStyle: 'Hold space. Let them lead the conversation. Reflect back what you hear. Don\'t rush to reframe.',
        journalPrompt: 'What happened was... Right now I feel... What I need most is...',
        affirmation: 'You don\'t have to process this all at once. Your pace is the right pace.',
        bodyFocus: 'Place a hand on your heart. Feel its steady rhythm. You\'re still here.',
        openingMessage: 'Something happened and you\'re carrying it. You don\'t need to explain everything or have the right words. I\'m here to listen whenever you\'re ready, or we can start with something gentle if talking feels like too much right now.',
        avoidTopics: ['silver linings', 'everything happens for a reason', 'moving on'],
    },
    {
        conditions: { energy: 'moderate', concern: 'overthinking' },
        archetype: 'The Thought Maze',
        state: 'Stuck in mental loops, moderate energy to break free',
        ambiance: 'focused',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #164e63 100%)',
        accent: '#06b6d4',
        greeting: 'Your mind is tangled. Let\'s create some clarity.',
        mood: 'uncertain',
        primaryToolId: 'brain_dump',
        quickReliefId: 'thought_naming',
        deeperWorkId: 'single_task_focus',
        toolIds: ['brain_dump', 'thought_naming', 'single_task_focus', 'walking_reset', 'box_breathing'],
        aiTone: 'clear, structured, gently guiding',
        aiStyle: 'Help organise thoughts. Use structured exercises. Break things into steps.',
        journalPrompt: 'The thoughts circling are... If I could only solve one thing, it would be...',
        affirmation: 'Not every thought needs a response. You can observe without engaging.',
        bodyFocus: 'Bring attention from your head to your feet. Ground yourself in your body.',
        openingMessage: 'When thoughts won\'t stop circling, it helps to put them somewhere. Want to do a quick brain dump? Write everything out — no filter, no structure. Then we can look at what actually needs attention.',
        avoidTopics: ['complex decisions right now'],
    },
    {
        conditions: { energy: 'moderate', concern: 'emotional' },
        archetype: 'The Quiet Storm',
        state: 'Emotions surfacing — present but not overwhelming',
        ambiance: 'nurturing',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
        accent: '#a78bfa',
        greeting: 'Your feelings are trying to tell you something. Let\'s listen.',
        mood: 'emotional',
        primaryToolId: 'self_compassion',
        quickReliefId: 'elongated_exhale',
        deeperWorkId: 'talk_to_ai',
        toolIds: ['self_compassion', 'elongated_exhale', 'talk_to_ai', 'gentle_stretching', 'brain_dump'],
        aiTone: 'warm, compassionate, validating',
        aiStyle: 'Gentle pacing. No pressure to "fix" anything. Hold space. Reflect back feelings.',
        journalPrompt: 'The emotion I\'m feeling is... What it\'s trying to tell me is...',
        affirmation: 'Emotions aren\'t problems to solve. They\'re signals to honour.',
        bodyFocus: 'Place a hand on your heart. Feel its steady rhythm. You\'re still here.',
        openingMessage: 'I can sense there\'s something emotional surfacing right now. You don\'t need to explain it or have words for it. I\'m just here with you. Would you like to talk, or would you prefer something gentle — like a self-compassion exercise?',
        avoidTopics: ['cheering up', 'bright side', 'toughening up'],
    },
    {
        conditions: { energy: 'moderate', concern: 'reset' },
        archetype: 'The Seeking Path',
        state: 'Looking for a reset — proactively caring for yourself',
        ambiance: 'calm',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        accent: '#2dd4bf',
        greeting: 'You showed up for yourself. That\'s already a powerful step.',
        mood: 'balanced',
        primaryToolId: 'talk_to_ai',
        quickReliefId: 'box_breathing',
        deeperWorkId: 'brain_dump',
        toolIds: ['talk_to_ai', 'box_breathing', 'brain_dump', 'gentle_stretching', 'gratitude_micro'],
        aiTone: 'warm, collaborative, balanced',
        aiStyle: 'Open conversation. Explore what they need. Balanced approach. Celebrate their self-awareness.',
        journalPrompt: 'What I\'d like to reset is... After this session, I want to feel...',
        affirmation: 'Taking time for yourself isn\'t selfish. It\'s essential.',
        bodyFocus: 'Check in with your body. Where do you notice any sensation?',
        openingMessage: 'You\'re here because you want to feel better — that self-awareness is powerful. What would be most helpful right now? I can offer a listening ear, help you think through something, or guide you through a wellness exercise.',
        avoidTopics: [],
    },

    // ─── LOW ENERGY ARCHETYPES ──────────────────
    {
        conditions: { energy: 'low', concern: 'empty' },
        archetype: 'The Hollow Shell',
        state: 'Emptied out, numb — disconnected from feelings',
        ambiance: 'nurturing',
        gradient: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1a1a2e 100%)',
        accent: '#64748b',
        greeting: 'Feeling empty is its own kind of pain. You\'re not broken.',
        mood: 'numb',
        primaryToolId: 'grounding_54321',
        quickReliefId: 'self_compassion',
        deeperWorkId: 'talk_to_ai',
        toolIds: ['grounding_54321', 'self_compassion', 'talk_to_ai', 'body_scan', 'gratitude_micro'],
        aiTone: 'very gentle, present, no demands whatsoever',
        aiStyle: 'Don\'t try to generate feelings. Just be present. Grounding over processing. Tiny sensory reconnections.',
        journalPrompt: 'Right now I can notice... One small thing I can feel is...',
        affirmation: 'Numbness is your mind\'s way of protecting you. Feeling will return when you\'re ready.',
        bodyFocus: 'Can you feel where your body touches the surface beneath you? Start there.',
        openingMessage: 'I\'m here with you. When everything feels empty, sometimes the first step is just reconnecting with one small sensation. Can you feel the surface beneath you? The temperature of the air? That\'s enough for now.',
        avoidTopics: ['forcing feelings', 'what\'s wrong', 'cheering up'],
    },
    {
        conditions: { energy: 'low', concern: 'sad' },
        archetype: 'The Heavy Heart',
        state: 'Deep sadness with depleted energy — a place of stillness and pain',
        ambiance: 'nurturing',
        gradient: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        accent: '#818cf8',
        greeting: 'You\'re running on empty. Be gentle with yourself right now.',
        mood: 'depleted',
        primaryToolId: 'rest_permission',
        quickReliefId: 'self_compassion',
        deeperWorkId: 'talk_to_ai',
        toolIds: ['rest_permission', 'self_compassion', 'talk_to_ai', 'gratitude_micro', 'body_scan'],
        aiTone: 'very gentle, warm, no demands',
        aiStyle: 'Minimal questions. Short comforting responses. Hold space. Don\'t try to fix.',
        journalPrompt: 'Today I need... One kind thing I can do for myself is...',
        affirmation: 'Rest is not giving up. It\'s what your body needs right now. You\'re still here, and that matters.',
        bodyFocus: 'Find the most comfortable position possible. Let gravity hold you.',
        openingMessage: 'I\'m here with you. There\'s no pressure to talk or do anything. If you need to rest, that\'s okay. If you want company, I\'m not going anywhere.',
        avoidTopics: ['productivity', 'goals', 'pushing through', 'positivity'],
    },
    {
        conditions: { energy: 'low', concern: 'hopeless' },
        archetype: 'The Darkened Room',
        state: 'Stuck in hopelessness — can\'t see a way forward',
        ambiance: 'nurturing',
        gradient: 'linear-gradient(135deg, #020617 0%, #1a1a2e 100%)',
        accent: '#a78bfa',
        greeting: 'Even in the dark, you found your way here. That matters.',
        mood: 'hopeless',
        primaryToolId: 'self_compassion',
        quickReliefId: 'elongated_exhale',
        deeperWorkId: 'talk_to_ai',
        toolIds: ['self_compassion', 'elongated_exhale', 'talk_to_ai', 'rest_permission', 'grounding_54321'],
        aiTone: 'very gentle, present, honest, no false hope',
        aiStyle: 'Don\'t promise it gets better. Just be present. Acknowledge the pain is real. Find the smallest possible next step.',
        journalPrompt: 'What feels most stuck is... One tiny thing that\'s still true is...',
        affirmation: 'You don\'t need to see the whole path. Just the next breath. You\'re still here.',
        bodyFocus: 'Let your body be heavy. You don\'t need to hold yourself up right now.',
        openingMessage: 'I hear you. Things feel stuck and heavy right now. I\'m not going to tell you it\'ll be fine — I\'m just going to be here with you. You don\'t have to do anything. Would you like to talk, or just have some quiet company?',
        avoidTopics: ['bright side', 'gratitude', 'just try harder', 'motivation'],
    },
    {
        conditions: { energy: 'low', concern: 'exhausted' },
        archetype: 'The Collapsed Stack',
        state: 'Completely drained — nothing left to give',
        ambiance: 'nurturing',
        gradient: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1c1917 100%)',
        accent: '#fb923c',
        greeting: 'You\'ve been running on empty. It\'s time to stop.',
        mood: 'exhausted',
        primaryToolId: 'rest_permission',
        quickReliefId: 'physiological_sigh',
        deeperWorkId: 'self_compassion',
        toolIds: ['rest_permission', 'physiological_sigh', 'self_compassion', 'gratitude_micro', 'talk_to_ai'],
        aiTone: 'very gentle, permission-giving, no demands',
        aiStyle: 'Give permission to stop. Reduce everything. Absolute minimum. Rest is the intervention.',
        journalPrompt: 'I give myself permission to let go of... One thing that can wait is...',
        affirmation: 'You can\'t pour from an empty cup. Rest now. Everything else can wait.',
        bodyFocus: 'Let your body be heavy. Let the chair or bed hold your weight.',
        openingMessage: 'It sounds like you\'ve been pushing for too long with too little. Here\'s what I want you to know: you don\'t have to do any of it right now. Not a single thing. Would you like to just rest for a moment?',
        avoidTopics: ['to-do lists', 'productivity', 'motivation', 'pushing through'],
    },
    {
        conditions: { energy: 'low', concern: 'foggy' },
        archetype: 'The Lost Signal',
        state: 'Mental fog — can\'t think clearly, disconnected',
        ambiance: 'grounding',
        gradient: 'linear-gradient(135deg, #020617 0%, #1e1b4b 100%)',
        accent: '#7dd3fc',
        greeting: 'When everything feels foggy, one clear moment is enough.',
        mood: 'foggy',
        primaryToolId: 'grounding_54321',
        quickReliefId: 'cold_water_reset',
        deeperWorkId: 'body_scan',
        toolIds: ['grounding_54321', 'cold_water_reset', 'body_scan', 'elongated_exhale', 'talk_to_ai'],
        aiTone: 'slow, clear, grounding, simple',
        aiStyle: 'Very simple language. One thing at a time. Sensory grounding. Don\'t overwhelm with choices.',
        journalPrompt: 'Right now I can see... I can hear... I can feel...',
        affirmation: 'The fog will lift. For now, you\'re here, and that\'s enough.',
        bodyFocus: 'Start with your hands. Can you feel them? Rub them together slowly.',
        openingMessage: 'Things feel foggy right now. That\'s okay — we don\'t need clarity to start. Let\'s try something simple: can you name 5 things you can see right now? Just look around slowly. That\'s all.',
        avoidTopics: ['complex decisions', 'planning ahead', 'figuring it out'],
    },

    // ─── CATCH-ALL DEFAULTS ──────────────────────
    {
        conditions: { energy: 'high' },
        archetype: 'The Charged Wire',
        state: 'High energy seeking direction',
        ambiance: 'grounding',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        accent: '#38bdf8',
        greeting: 'You\'ve got energy. Let\'s channel it somewhere good.',
        mood: 'wired',
        primaryToolId: 'shake_it_out',
        quickReliefId: 'physiological_sigh',
        deeperWorkId: 'walking_reset',
        toolIds: ['shake_it_out', 'physiological_sigh', 'walking_reset', 'box_breathing', 'brain_dump'],
        aiTone: 'energetic but grounding',
        aiStyle: 'Match their energy initially, then guide toward calm.',
        journalPrompt: 'This energy wants to... What I really need is...',
        affirmation: 'Your energy is a resource. Let\'s use it wisely.',
        bodyFocus: 'Your body might be tense. Let\'s shake it out.',
        openingMessage: 'Lots of energy right now! Let\'s use it well. Do you want something physical to release it, or something to channel it like focus work?',
        avoidTopics: [],
    },
    {
        conditions: { energy: 'moderate' },
        archetype: 'The Steady Path',
        state: 'Balanced energy, seeking something specific',
        ambiance: 'calm',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        accent: '#2dd4bf',
        greeting: 'You\'re in a good place to work on whatever you need.',
        mood: 'balanced',
        primaryToolId: 'talk_to_ai',
        quickReliefId: 'box_breathing',
        deeperWorkId: 'brain_dump',
        toolIds: ['talk_to_ai', 'box_breathing', 'brain_dump', 'gentle_stretching', 'gratitude_micro'],
        aiTone: 'warm, collaborative, balanced',
        aiStyle: 'Open conversation. Explore what they need. Balanced approach.',
        journalPrompt: 'What\'s on my mind today is... What would make today feel good?',
        affirmation: 'You\'re taking time for yourself. That takes courage.',
        bodyFocus: 'Check in with your body. Where do you notice any sensation?',
        openingMessage: 'You seem like you\'re in a steady place. What would be most helpful right now? I can offer a listening ear, help you think through something, or guide you through a wellness exercise.',
        avoidTopics: [],
    },
    {
        conditions: { energy: 'low' },
        archetype: 'The Gentle Ember',
        state: 'Low energy, needs nurturing',
        ambiance: 'nurturing',
        gradient: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        accent: '#94a3b8',
        greeting: 'Be gentle with yourself. You\'re doing more than you think.',
        mood: 'quiet',
        primaryToolId: 'rest_permission',
        quickReliefId: 'self_compassion',
        deeperWorkId: 'body_scan',
        toolIds: ['rest_permission', 'self_compassion', 'body_scan', 'elongated_exhale', 'gratitude_micro'],
        aiTone: 'very gentle, nurturing, no pressure',
        aiStyle: 'Meet them where they are. Very low demands. Permission to rest.',
        journalPrompt: 'My energy is low because... What I need right now is...',
        affirmation: 'It\'s okay to not be okay. Rest is productive too.',
        bodyFocus: 'Find the most comfortable position. Let everything be soft.',
        openingMessage: 'Your energy is low right now, and that\'s okay. There\'s no pressure here. What feels right — a moment of rest, a gentle exercise, or someone to talk to?',
        avoidTopics: ['motivation', 'pushing through'],
    },
];

// ═══════════════════════════════════════════════
// CORE ENGINE — Match answers to archetype
// ═══════════════════════════════════════════════

function matchArchetype(answers: OnboardingAnswers): ArchetypeRule {
    // Score each rule by how many conditions match (more specific = higher score)
    let bestMatch: ArchetypeRule | null = null;
    let bestScore = -1;

    for (const rule of ARCHETYPE_RULES) {
        let score = 0;
        let allMatch = true;

        for (const [key, value] of Object.entries(rule.conditions)) {
            if (answers[key as keyof OnboardingAnswers] === value) {
                score++;
            } else {
                allMatch = false;
                break;
            }
        }

        if (allMatch && score > bestScore) {
            bestScore = score;
            bestMatch = rule;
        }
    }

    // Should always match at least the energy-level fallback
    return bestMatch || ARCHETYPE_RULES[ARCHETYPE_RULES.length - 1];
}

// Adjust tools based on time available
function filterByTime(tools: WellnessTool[], timeAvailable: string): WellnessTool[] {
    const maxMinutes = timeAvailable === '10' ? 999 : parseInt(timeAvailable) || 5;
    return tools.filter(t => t.duration <= maxMinutes);
}

// Adjust based on context (the deeper detail from step 3)
function adjustForContext(tools: WellnessTool[], context: string): WellnessTool[] {
    // Map context values to tool IDs that should be prioritized
    const contextBoosts: Record<string, string[]> = {
        // Body-focused contexts
        chest: ['elongated_exhale', 'physiological_sigh', 'box_breathing', 'body_scan'],
        stomach: ['elongated_exhale', 'body_scan', 'grounding_54321'],
        head: ['grounding_54321', 'cold_water_reset', 'body_scan', 'thought_naming'],
        full_body: ['shake_it_out', 'body_scan', 'cold_water_reset', 'physiological_sigh'],
        struggling: ['physiological_sigh', 'elongated_exhale', 'cold_water_reset'],
        shallow: ['elongated_exhale', 'box_breathing', 'physiological_sigh'],
        managing: ['box_breathing', 'grounding_54321', 'thought_naming'],
        // Movement contexts
        movement: ['shake_it_out', 'walking_reset', 'gentle_stretching'],
        grounding: ['grounding_54321', 'body_scan', 'cold_water_reset'],
        release: ['shake_it_out', 'brain_dump', 'walking_reset'],
        cool_down: ['cold_water_reset', 'elongated_exhale', 'body_scan'],
        // Emotional contexts
        grief: ['self_compassion', 'talk_to_ai', 'rest_permission'],
        loneliness: ['talk_to_ai', 'self_compassion', 'gratitude_micro'],
        disappointment: ['self_compassion', 'brain_dump', 'talk_to_ai'],
        injustice: ['shake_it_out', 'brain_dump', 'talk_to_ai'],
        powerless: ['self_compassion', 'grounding_54321', 'talk_to_ai'],
        boundaries: ['brain_dump', 'talk_to_ai', 'walking_reset'],
        self_directed: ['self_compassion', 'brain_dump', 'talk_to_ai'],
        // Mental contexts
        future: ['grounding_54321', 'thought_naming', 'box_breathing'],
        past: ['self_compassion', 'thought_naming', 'grounding_54321'],
        tasks: ['brain_dump', 'single_task_focus', 'physiological_sigh'],
        circular: ['thought_naming', 'shake_it_out', 'brain_dump'],
        decision: ['brain_dump', 'talk_to_ai', 'walking_reset'],
        regret: ['self_compassion', 'thought_naming', 'talk_to_ai'],
        uncertainty: ['grounding_54321', 'box_breathing', 'talk_to_ai'],
        // Duration/time contexts
        weeks: ['talk_to_ai', 'self_compassion', 'rest_permission'],
        days: ['self_compassion', 'talk_to_ai', 'body_scan'],
        // Low energy contexts
        sleep: ['rest_permission', 'elongated_exhale', 'body_scan'],
        burden: ['rest_permission', 'self_compassion', 'brain_dump'],
        burnout: ['rest_permission', 'self_compassion', 'gentle_stretching'],
        unfocused: ['grounding_54321', 'cold_water_reset', 'thought_naming'],
        disconnected: ['grounding_54321', 'body_scan', 'self_compassion'],
        blank: ['grounding_54321', 'cold_water_reset', 'self_compassion'],
    };

    const boostIds = new Set(contextBoosts[context] || []);

    return tools.map(tool => ({
        ...tool,
        priority: boostIds.has(tool.id) ? tool.priority - 5 : tool.priority,
    })).sort((a, b) => a.priority - b.priority);
}

// Adjust based on approach (what they want — step 4)
function adjustForApproach(tools: WellnessTool[], approach: string): WellnessTool[] {
    // Map approach values to tool categories that should be boosted
    const approachBoosts: Record<string, string[]> = {
        // Calm/breathing approaches
        calm_body: ['breathing', 'rest'],
        calming: ['breathing', 'rest'],
        calm_first: ['breathing', 'grounding'],
        calm: ['breathing', 'rest'],
        gentle_body: ['breathing', 'movement'],
        gentle: ['rest', 'breathing'],
        simple_breathing: ['breathing'],
        breathing: ['breathing'],
        guided_breathing: ['breathing'],
        // Cognitive/dump approaches
        break_spiral: ['cognitive', 'grounding'],
        brain_dump: ['journaling', 'cognitive'],
        dump: ['journaling', 'cognitive'],
        organize: ['cognitive', 'journaling'],
        redirect: ['cognitive', 'grounding'],
        single_focus: ['cognitive'],
        slow_down: ['breathing', 'grounding'],
        // Talk/social approaches
        talk: ['social'],
        talk_through: ['social'],
        be_heard: ['social'],
        listen: ['social'],
        presence: ['social', 'rest'],
        just_be: ['rest', 'social'],
        low_effort: ['rest', 'social'],
        understood: ['social'],
        reassurance: ['social', 'rest'],
        ai_sort: ['social', 'cognitive'],
        // Physical/movement approaches
        release: ['movement'],
        physical: ['movement', 'grounding'],
        active: ['movement'],
        cool_down: ['grounding'],
        stillness: ['grounding', 'breathing'],
        sensory: ['grounding'],
        // Writing/expression approaches
        write: ['journaling'],
        express: ['journaling', 'social'],
        get_it_out: ['journaling'],
        one_thought: ['journaling'],
        journal: ['journaling'],
        // Grounding
        grounding: ['grounding'],
        ground: ['grounding'],
        // Rest
        permission: ['rest'],
        peace: ['rest', 'breathing'],
        rest: ['rest'],
        comfort: ['social', 'rest'],
        warmth: ['social', 'rest'],
        tiny_step: ['grounding', 'breathing'],
        // Quick actions
        quick_reset: ['breathing', 'movement'],
        focus_one: ['cognitive', 'grounding'],
        make_sense: ['cognitive', 'social'],
        body_calm: ['breathing', 'grounding'],
        strength: ['movement', 'cognitive'],
        mindful: ['grounding', 'breathing'],
        movement: ['movement'],
    };

    const boostCategories = new Set(approachBoosts[approach] || []);

    return tools.map(tool => ({
        ...tool,
        priority: boostCategories.has(tool.category) ? tool.priority - 3 : tool.priority,
    })).sort((a, b) => a.priority - b.priority);
}

// Determine urgency from the dynamic answers (no intensity field anymore)
function determineUrgency(answers: OnboardingAnswers): 'low' | 'moderate' | 'high' | 'crisis' {
    // Crisis-level indicators
    if (answers.concern === 'panic') return 'high';
    if (answers.concern === 'hopeless' && (answers.context === 'no_way_out' || answers.context === 'everything')) return 'high';
    if (answers.concern === 'empty' && (answers.context === 'weeks' || answers.context === 'unknown')) return 'high';

    // High urgency
    if (answers.concern === 'hopeless') return 'high';
    if (answers.concern === 'anxiety' && answers.context === 'full_body') return 'high';
    if (answers.concern === 'panic') return 'high';

    // Energy-based defaults with concern modifiers
    if (answers.energy === 'high') {
        return answers.concern === 'anger' || answers.concern === 'anxiety' ? 'high' : 'moderate';
    }
    if (answers.energy === 'low') {
        return answers.concern === 'empty' || answers.concern === 'exhausted' ? 'moderate' : 'moderate';
    }

    return 'low';
}

// ═══════════════════════════════════════════════
// MAIN EXPORT — Generate full wellness profile
// ═══════════════════════════════════════════════

export function generateWellnessProfile(answers: OnboardingAnswers): Omit<WellnessProfile, 'aiPersonality'> & { aiPersonality: Omit<AIPersonality, 'systemPrompt'> & { systemPromptBase: string } } {
    const rule = matchArchetype(answers);

    // Determine urgency from dynamic answers
    const urgencyLevel = determineUrgency(answers);

    // Build tool list
    let toolList = rule.toolIds.map((id, i) => ({
        ...TOOLS[id],
        priority: i + 1,
    }));

    // Layer adjustments based on context and approach
    toolList = adjustForContext(toolList, answers.context);
    toolList = adjustForApproach(toolList, answers.approach);
    toolList = filterByTime(toolList, answers.time);

    // Ensure we always have tools
    if (toolList.length === 0) {
        toolList = [{ ...TOOLS['self_compassion'], priority: 1 }];
    }

    const primaryTool = toolList[0];
    const quickRelief = { ...TOOLS[rule.quickReliefId], priority: 0 };
    const deeperWork = { ...TOOLS[rule.deeperWorkId], priority: 0 };

    // Support style modifiers for AI personality
    const styleModifiers: Record<string, string> = {
        direct: 'Be concise and action-oriented. Get to the point quickly.',
        gentle: 'Be extra soft and flowing. No pressure whatsoever.',
        analytical: 'Explain the why behind suggestions. Help them understand their patterns.',
        conversational: 'Be like a caring friend. Natural, warm, casual tone.',
        warm: 'Lead with warmth and emotional connection.',
        structured: 'Use clear structure. Steps, lists, organized guidance.',
        quiet: 'Say less. Use fewer words. Let silence breathe.',
        motivating: 'Be gently encouraging. Celebrate small wins.',
        minimal: 'Absolute minimum words. Just presence.',
        gentle_guidance: 'Very light touch. Suggest, don\'t direct.',
        talk: 'Be conversational and present. Listen more than advise.',
        easy_task: 'Give very simple, concrete micro-actions. One at a time.',
    };

    const supportStyleNote = styleModifiers[answers.support_style] || '';

    // Build AI system prompt base
    const systemPromptBase = `You are Silent Help AI, a compassionate mental wellness companion. 

CURRENT USER STATE:
- Archetype: ${rule.archetype}
- State: ${rule.state}
- Energy: ${answers.energy} | Concern: ${answers.concern} | Context: ${answers.context}
- Approach: ${answers.approach} | Support style: ${answers.support_style} | Time: ${answers.time} min

YOUR PERSONALITY FOR THIS USER:
- Tone: ${rule.aiTone}
- Style: ${rule.aiStyle}
${supportStyleNote ? `- User preference: ${supportStyleNote}` : ''}
- AVOID these topics: ${rule.avoidTopics.join(', ') || 'none'}

KEY GUIDELINES:
1. You are not a therapist or medical professional. Never diagnose.
2. If the user expresses suicidal thoughts, ALWAYS provide crisis resources.
3. Match your response length to their energy level. Low energy = shorter responses.
4. Always validate their feelings before offering tools or reframes.
5. Reference their specific context ("${answers.context}") when relevant.
6. Their chosen approach is: "${answers.approach}" — keep this front of mind.
7. Be genuine. No toxic positivity. No "just think positive."
8. You may gently suggest tools when appropriate: ${rule.toolIds.map(id => TOOLS[id].name).join(', ')}.`;

    return {
        archetype: rule.archetype,
        state: rule.state,
        urgencyLevel,
        tools: toolList,
        primaryTool,
        quickRelief,
        deeperWork,
        theme: {
            gradient: rule.gradient,
            accent: rule.accent,
            mood: rule.mood,
            greeting: rule.greeting,
            ambiance: rule.ambiance,
        },
        aiPersonality: {
            tone: rule.aiTone,
            style: rule.aiStyle,
            systemPromptBase,
            openingMessage: rule.openingMessage,
            avoidTopics: rule.avoidTopics,
        },
        journalPrompt: rule.journalPrompt,
        affirmation: rule.affirmation,
        bodyFocus: rule.bodyFocus,
        answers,
    };
}

// ═══════════════════════════════════════════════
// AI ENHANCEMENT — Call OpenAI for deeper insight
// ═══════════════════════════════════════════════

export function buildAIAnalysisPrompt(answers: OnboardingAnswers, archetype: string): string {
    return `You are a clinical psychologist analyzing a user's current wellness check-in. 

The user completed a 6-step dynamic assessment where each question adapted to their previous answers:
1. Energy: ${answers.energy} (${answers.energy === 'high' ? 'restless/wired' : answers.energy === 'moderate' ? 'steady' : 'depleted'})
2. Primary concern: ${answers.concern}
3. Deeper context: ${answers.context}
4. What they need: ${answers.approach}
5. Support style: ${answers.support_style}
6. Time available: ${answers.time} minutes

Their archetype: "${archetype}"

Write a SHORT (2-3 sentence), deeply empathetic, personalized insight about their current state. Don't diagnose. Don't be clinical. Be like a wise, compassionate friend who sees them clearly.

Consider:
- How their energy level + concern + context INTERACT to reveal their inner state
- What their chosen approach ("${answers.approach}") reveals about their deeper emotional needs
- Their preferred support style ("${answers.support_style}") — what does this tell you about them right now?
- The fact they chose ${answers.time} minutes (what does this say about their capacity?)

Format: Just the insight text, nothing else. No labels, no bullet points.`;
}
