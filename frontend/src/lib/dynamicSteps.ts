/* ═══════════════════════════════════════════════════════════════════════
   Dynamic Step Engine — AI-driven branching onboarding questionnaire
   
   Step 1 is FIXED (energy: high / moderate / low).
   Steps 2-6 are DYNAMICALLY generated based on every previous answer,
   so every user walks a completely unique path.
   
   Total: ~3,840 unique journeys through the questionnaire.
   ═══════════════════════════════════════════════════════════════════════ */

export interface DynamicOption {
    emoji: string;
    label: string;
    value: string;
}

export interface DynamicStep {
    id: string;
    title: string;
    subtitle: string;
    options: DynamicOption[];
}

/* ─────────────────────────────────────────────
   STEP 1 — Fixed (never changes)
   ───────────────────────────────────────────── */

export const STEP_1: DynamicStep = {
    id: 'energy',
    title: 'How is your energy right now?',
    subtitle: 'This helps us understand your current state',
    options: [
        { emoji: '⚡', label: 'High / restless', value: 'high' },
        { emoji: '🔋', label: 'Moderate / steady', value: 'moderate' },
        { emoji: '🪫', label: 'Low / depleted', value: 'low' },
    ],
};

/* ─────────────────────────────────────────────
   STEP 2 — Based on energy (3 variants)
   ───────────────────────────────────────────── */

const STEP_2: Record<string, DynamicStep> = {
    high: {
        id: 'concern',
        title: "What's fueling this energy?",
        subtitle: 'Understanding the source helps us help you',
        options: [
            { emoji: '😰', label: 'Anxiety / worry', value: 'anxiety' },
            { emoji: '😤', label: 'Frustration / anger', value: 'anger' },
            { emoji: '💭', label: "Mind won't stop racing", value: 'racing_thoughts' },
            { emoji: '🫨', label: 'Body feels wired / restless', value: 'restless_body' },
            { emoji: '😱', label: 'Feels like panic', value: 'panic' },
        ],
    },
    moderate: {
        id: 'concern',
        title: 'What brought you here today?',
        subtitle: "There's no wrong answer — you showed up",
        options: [
            { emoji: '😟', label: 'Stress is building up', value: 'stress' },
            { emoji: '💔', label: 'Something happened', value: 'something_happened' },
            { emoji: '🔄', label: "Can't stop overthinking", value: 'overthinking' },
            { emoji: '😢', label: 'Feeling emotional', value: 'emotional' },
            { emoji: '🧘', label: 'Just want to feel better', value: 'reset' },
        ],
    },
    low: {
        id: 'concern',
        title: 'What feels heaviest right now?',
        subtitle: 'When energy is low, naming it matters',
        options: [
            { emoji: '😶', label: 'Empty / numb', value: 'empty' },
            { emoji: '😢', label: 'Sad / tearful', value: 'sad' },
            { emoji: '😞', label: 'Hopeless / stuck', value: 'hopeless' },
            { emoji: '😴', label: 'Completely drained', value: 'exhausted' },
            { emoji: '🌫️', label: "Can't think clearly", value: 'foggy' },
        ],
    },
};

/* ─────────────────────────────────────────────
   STEP 3 — Based on energy + concern (15 variants)
   ───────────────────────────────────────────── */

const STEP_3: Record<string, DynamicStep> = {
    // ── HIGH ENERGY ──
    'high.anxiety': {
        id: 'context',
        title: 'Where do you feel the anxiety most?',
        subtitle: 'Your body is trying to tell you something',
        options: [
            { emoji: '🫀', label: "Tight chest / can't breathe", value: 'chest' },
            { emoji: '🤢', label: 'Stomach in knots', value: 'stomach' },
            { emoji: '💆', label: 'Head pressure / dizzy', value: 'head' },
            { emoji: '🤲', label: 'Whole body tense / shaking', value: 'full_body' },
        ],
    },
    'high.anger': {
        id: 'context',
        title: "What's underneath the anger?",
        subtitle: 'Anger often protects something deeper',
        options: [
            { emoji: '⚖️', label: 'Something unfair happened', value: 'injustice' },
            { emoji: '😤', label: 'Feeling powerless', value: 'powerless' },
            { emoji: '🚧', label: 'Someone crossed a line', value: 'boundaries' },
            { emoji: '😠', label: 'Angry at myself', value: 'self_directed' },
        ],
    },
    'high.racing_thoughts': {
        id: 'context',
        title: 'What are the thoughts mostly about?',
        subtitle: "Let's find the pattern",
        options: [
            { emoji: '🔮', label: 'What could go wrong', value: 'future' },
            { emoji: '⏪', label: 'What already happened', value: 'past' },
            { emoji: '📋', label: 'Everything I need to do', value: 'tasks' },
            { emoji: '🔁', label: 'Same thought on repeat', value: 'circular' },
        ],
    },
    'high.restless_body': {
        id: 'context',
        title: 'What would help your body right now?',
        subtitle: 'Your body is asking for something',
        options: [
            { emoji: '🏃', label: 'I need to move', value: 'movement' },
            { emoji: '🌍', label: 'I need to feel grounded', value: 'grounding' },
            { emoji: '💨', label: 'I need to let something out', value: 'release' },
            { emoji: '🧊', label: 'I need to cool down', value: 'cool_down' },
        ],
    },
    'high.panic': {
        id: 'context',
        title: "Right now, how's your breathing?",
        subtitle: 'This tells us where to start',
        options: [
            { emoji: '😰', label: 'Can barely breathe', value: 'struggling' },
            { emoji: '😮‍💨', label: 'Shallow but present', value: 'shallow' },
            { emoji: '🌬️', label: "I'm managing it", value: 'managing' },
        ],
    },

    // ── MODERATE ENERGY ──
    'moderate.stress': {
        id: 'context',
        title: 'What kind of stress is it?',
        subtitle: 'Different stress needs different tools',
        options: [
            { emoji: '💼', label: 'Work / school pressure', value: 'work' },
            { emoji: '👥', label: 'Relationship tension', value: 'relationships' },
            { emoji: '💰', label: 'Life circumstances', value: 'life' },
            { emoji: '🌀', label: 'Everything at once', value: 'everything' },
        ],
    },
    'moderate.something_happened': {
        id: 'context',
        title: 'How recent was it?',
        subtitle: 'Timing shapes how we process',
        options: [
            { emoji: '⏰', label: 'Just happened', value: 'just_now' },
            { emoji: '📅', label: 'Earlier today', value: 'today' },
            { emoji: '📆', label: 'This week', value: 'this_week' },
            { emoji: '⏳', label: 'Still lingering from before', value: 'lingering' },
        ],
    },
    'moderate.overthinking': {
        id: 'context',
        title: 'What keeps pulling you back in?',
        subtitle: 'Naming the loop helps break it',
        options: [
            { emoji: '🤔', label: "A decision I can't make", value: 'decision' },
            { emoji: '😬', label: 'Something I said or did', value: 'regret' },
            { emoji: '❓', label: 'Uncertainty about the future', value: 'uncertainty' },
            { emoji: '🔄', label: "I don't even know anymore", value: 'unknown' },
        ],
    },
    'moderate.emotional': {
        id: 'context',
        title: "What's the emotion closest to?",
        subtitle: "Emotions aren't problems — they're signals",
        options: [
            { emoji: '😢', label: 'Sadness / grief', value: 'grief' },
            { emoji: '😟', label: 'Worry / fear', value: 'worry' },
            { emoji: '😔', label: 'Loneliness', value: 'lonely' },
            { emoji: '😤', label: 'Irritability', value: 'irritable' },
            { emoji: '🥺', label: 'Vulnerability', value: 'vulnerable' },
        ],
    },
    'moderate.reset': {
        id: 'context',
        title: 'What does a reset look like for you?',
        subtitle: 'Everyone recharges differently',
        options: [
            { emoji: '🧠', label: 'Mental clarity', value: 'clarity' },
            { emoji: '😌', label: 'Emotional calm', value: 'calm' },
            { emoji: '⚡', label: 'Energy boost', value: 'energy_boost' },
            { emoji: '🫂', label: 'Feeling connected', value: 'connection' },
        ],
    },

    // ── LOW ENERGY ──
    'low.empty': {
        id: 'context',
        title: 'How long have you felt this way?',
        subtitle: "There's no judgment here",
        options: [
            { emoji: '🕐', label: 'Just today', value: 'today' },
            { emoji: '📅', label: 'A few days', value: 'days' },
            { emoji: '📆', label: 'Weeks or longer', value: 'weeks' },
            { emoji: '❓', label: "Can't remember when it started", value: 'unknown' },
        ],
    },
    'low.sad': {
        id: 'context',
        title: "What's the sadness connected to?",
        subtitle: "You don't have to carry it alone",
        options: [
            { emoji: '💔', label: 'Loss or grief', value: 'grief' },
            { emoji: '🏠', label: 'Loneliness / isolation', value: 'loneliness' },
            { emoji: '😞', label: 'Disappointment in something', value: 'disappointment' },
            { emoji: '🤷', label: "I'm not sure", value: 'unsure' },
        ],
    },
    'low.hopeless': {
        id: 'context',
        title: 'What feels most stuck?',
        subtitle: 'Even naming it is a step',
        options: [
            { emoji: '🌍', label: 'Everything feels stuck', value: 'everything' },
            { emoji: '📌', label: 'One specific situation', value: 'specific' },
            { emoji: '🧠', label: 'My own mind', value: 'mind' },
            { emoji: '🚪', label: "Can't see a way forward", value: 'no_way_out' },
        ],
    },
    'low.exhausted': {
        id: 'context',
        title: "What's draining you most?",
        subtitle: 'Understanding the drain helps us help you',
        options: [
            { emoji: '😴', label: 'Not sleeping well', value: 'sleep' },
            { emoji: '🏋️', label: 'Carrying too much responsibility', value: 'burden' },
            { emoji: '🔄', label: 'Pushing through for too long', value: 'burnout' },
            { emoji: '🤷', label: 'Nothing specific — just empty', value: 'general' },
        ],
    },
    'low.foggy': {
        id: 'context',
        title: 'What does the fog feel like?',
        subtitle: "Let's find a way through",
        options: [
            { emoji: '🌀', label: "Can't focus on anything", value: 'unfocused' },
            { emoji: '🤯', label: 'Too many things at once', value: 'overwhelmed' },
            { emoji: '😶', label: 'Disconnected from everything', value: 'disconnected' },
            { emoji: '🕳️', label: 'Just... blank', value: 'blank' },
        ],
    },
};

/* ─────────────────────────────────────────────
   STEP 4 — Based on energy + concern (15 variants)
   "What do you need?" — tailored to their path
   ───────────────────────────────────────────── */

const STEP_4: Record<string, DynamicStep> = {
    // ── HIGH ENERGY ──
    'high.anxiety': {
        id: 'approach',
        title: 'What do you need most right now?',
        subtitle: "Let's match you with the right tool",
        options: [
            { emoji: '🌬️', label: 'Help calming my body', value: 'calm_body' },
            { emoji: '🧠', label: 'Break the thought spiral', value: 'break_spiral' },
            { emoji: '💬', label: 'Talk it through with AI', value: 'talk' },
            { emoji: '🎯', label: 'One thing to focus on', value: 'focus_one' },
        ],
    },
    'high.anger': {
        id: 'approach',
        title: 'What would serve you best right now?',
        subtitle: "There's no wrong way to handle this",
        options: [
            { emoji: '💨', label: 'A safe way to release it', value: 'release' },
            { emoji: '🧊', label: 'Something to cool down', value: 'cool_down' },
            { emoji: '🗣️', label: 'Space to be heard', value: 'be_heard' },
            { emoji: '🔍', label: "Understand what's really going on", value: 'understand' },
        ],
    },
    'high.racing_thoughts': {
        id: 'approach',
        title: 'What would help your mind?',
        subtitle: "Let's find your off-switch",
        options: [
            { emoji: '🧹', label: 'Get everything out of my head', value: 'brain_dump' },
            { emoji: '🎯', label: 'Lock onto one thing', value: 'single_focus' },
            { emoji: '🌊', label: 'Slow everything down', value: 'slow_down' },
            { emoji: '💬', label: 'Let AI help me sort it', value: 'ai_sort' },
        ],
    },
    'high.restless_body': {
        id: 'approach',
        title: 'How do you want to channel this energy?',
        subtitle: 'Your body knows what it needs',
        options: [
            { emoji: '🏃', label: 'Something physical / active', value: 'physical' },
            { emoji: '🧘', label: 'Something still but intense', value: 'stillness' },
            { emoji: '🌬️', label: 'Breathing techniques', value: 'breathing' },
            { emoji: '🎵', label: 'Something sensory / immersive', value: 'sensory' },
        ],
    },
    'high.panic': {
        id: 'approach',
        title: "Let's find your anchor right now.",
        subtitle: "One step at a time — you're safe here",
        options: [
            { emoji: '🌬️', label: 'Guide my breathing', value: 'guided_breathing' },
            { emoji: '🌍', label: 'Ground me in the present', value: 'grounding' },
            { emoji: '🧊', label: 'Physical sensation (cold/pressure)', value: 'physical' },
            { emoji: '💬', label: 'Just keep talking to me', value: 'talk' },
        ],
    },

    // ── MODERATE ENERGY ──
    'moderate.stress': {
        id: 'approach',
        title: 'What kind of support sounds right?',
        subtitle: "We'll tailor everything to this",
        options: [
            { emoji: '🧘', label: 'Something calming', value: 'calming' },
            { emoji: '📝', label: 'Help organizing my thoughts', value: 'organize' },
            { emoji: '💬', label: 'Talking about it', value: 'talk' },
            { emoji: '⚡', label: 'A quick reset', value: 'quick_reset' },
        ],
    },
    'moderate.something_happened': {
        id: 'approach',
        title: 'How do you want to process this?',
        subtitle: "There's no rush — your pace",
        options: [
            { emoji: '📝', label: 'Write / journal it out', value: 'write' },
            { emoji: '💬', label: 'Talk to AI about it', value: 'talk' },
            { emoji: '🧘', label: 'Find calm first, process later', value: 'calm_first' },
            { emoji: '🔍', label: 'Help me make sense of it', value: 'make_sense' },
        ],
    },
    'moderate.overthinking': {
        id: 'approach',
        title: 'What would quiet your mind?',
        subtitle: "Let's break the cycle",
        options: [
            { emoji: '🧹', label: 'Brain dump — empty it all out', value: 'dump' },
            { emoji: '🎯', label: 'Something to redirect my focus', value: 'redirect' },
            { emoji: '🌬️', label: 'A body-based calm-down', value: 'body_calm' },
            { emoji: '💬', label: 'Talk it through with AI', value: 'talk_through' },
        ],
    },
    'moderate.emotional': {
        id: 'approach',
        title: 'What do you need emotionally?',
        subtitle: 'Your feelings deserve space',
        options: [
            { emoji: '🫂', label: 'To feel understood', value: 'understood' },
            { emoji: '😌', label: 'To feel calmer', value: 'calm' },
            { emoji: '💪', label: 'To feel stronger', value: 'strength' },
            { emoji: '📝', label: 'To express what I feel', value: 'express' },
        ],
    },
    'moderate.reset': {
        id: 'approach',
        title: 'What kind of reset appeals most?',
        subtitle: "Let's make this count",
        options: [
            { emoji: '🌬️', label: 'A breathing exercise', value: 'breathing' },
            { emoji: '🧘', label: 'A mindful moment', value: 'mindful' },
            { emoji: '🏃', label: 'Something with movement', value: 'movement' },
            { emoji: '📝', label: 'Journaling / reflection', value: 'journal' },
        ],
    },

    // ── LOW ENERGY ──
    'low.empty': {
        id: 'approach',
        title: 'What might help you reconnect?',
        subtitle: 'Even a tiny spark counts',
        options: [
            { emoji: '🫂', label: 'Gentle words / comfort', value: 'comfort' },
            { emoji: '✍️', label: 'Writing something small', value: 'write' },
            { emoji: '🌍', label: 'A grounding exercise', value: 'ground' },
            { emoji: '💬', label: 'Just having someone there', value: 'presence' },
        ],
    },
    'low.sad': {
        id: 'approach',
        title: 'What kind of comfort do you need?',
        subtitle: 'Let us hold some of this with you',
        options: [
            { emoji: '🫂', label: 'Warmth and understanding', value: 'warmth' },
            { emoji: '📝', label: 'Space to express it', value: 'express' },
            { emoji: '🌬️', label: 'Something gentle for my body', value: 'gentle_body' },
            { emoji: '💬', label: 'Someone to listen', value: 'listen' },
        ],
    },
    'low.hopeless': {
        id: 'approach',
        title: 'What might feel possible right now?',
        subtitle: "We'll start impossibly small",
        options: [
            { emoji: '🌱', label: 'The tiniest step forward', value: 'tiny_step' },
            { emoji: '💬', label: "Hearing that it's okay", value: 'reassurance' },
            { emoji: '📝', label: 'Getting it out of my head', value: 'get_it_out' },
            { emoji: '🤲', label: 'Nothing — just be with me', value: 'just_be' },
        ],
    },
    'low.exhausted': {
        id: 'approach',
        title: 'What does rest look like for you?',
        subtitle: "You've earned this pause",
        options: [
            { emoji: '😴', label: 'Permission to do nothing', value: 'permission' },
            { emoji: '🌬️', label: 'Something gentle and effortless', value: 'gentle' },
            { emoji: '💬', label: 'Low-effort connection', value: 'low_effort' },
            { emoji: '🌿', label: 'A tiny moment of peace', value: 'peace' },
        ],
    },
    'low.foggy': {
        id: 'approach',
        title: 'What might bring some clarity?',
        subtitle: 'One clear moment is enough',
        options: [
            { emoji: '🌍', label: 'Something grounding', value: 'grounding' },
            { emoji: '📝', label: 'Writing one thought down', value: 'one_thought' },
            { emoji: '🌬️', label: 'A simple breathing exercise', value: 'simple_breathing' },
            { emoji: '💬', label: 'Let AI help me sort through it', value: 'ai_sort' },
        ],
    },
};

/* ─────────────────────────────────────────────
   STEP 5 — Support style (3 variants by energy)
   How do you want to be guided?
   ───────────────────────────────────────────── */

const STEP_5: Record<string, DynamicStep> = {
    high: {
        id: 'support_style',
        title: 'How do you like to be guided?',
        subtitle: 'This shapes your entire experience',
        options: [
            { emoji: '🎯', label: 'Direct and action-oriented', value: 'direct' },
            { emoji: '🌊', label: 'Gentle and go-with-the-flow', value: 'gentle' },
            { emoji: '🧠', label: 'Explain things so I understand', value: 'analytical' },
            { emoji: '💬', label: 'Just talk to me like a friend', value: 'conversational' },
        ],
    },
    moderate: {
        id: 'support_style',
        title: 'How do you like to be supported?',
        subtitle: 'This personalizes your AI companion',
        options: [
            { emoji: '🗣️', label: 'Warm and conversational', value: 'warm' },
            { emoji: '📋', label: 'Structured and clear', value: 'structured' },
            { emoji: '🤫', label: 'Quiet and minimal', value: 'quiet' },
            { emoji: '💪', label: 'Encouraging and motivating', value: 'motivating' },
        ],
    },
    low: {
        id: 'support_style',
        title: 'How much do you want from us right now?',
        subtitle: "Be honest — we'll match your capacity",
        options: [
            { emoji: '🤫', label: 'Very little — just be here', value: 'minimal' },
            { emoji: '🌊', label: 'Gentle guidance', value: 'gentle_guidance' },
            { emoji: '💬', label: 'I want someone to talk to', value: 'talk' },
            { emoji: '📝', label: 'Give me something easy to do', value: 'easy_task' },
        ],
    },
};

/* ─────────────────────────────────────────────
   STEP 6 — Time / capacity (3 variants by energy)
   Adapted wording per energy level
   ───────────────────────────────────────────── */

const STEP_6: Record<string, DynamicStep> = {
    high: {
        id: 'time',
        title: 'How much time feels right?',
        subtitle: 'Your body is activated — even a short practice helps',
        options: [
            { emoji: '⏱️', label: '60 seconds — just ground me', value: '1' },
            { emoji: '⏱️', label: '2-3 minutes — take the edge off', value: '3' },
            { emoji: '⏱️', label: '5 minutes — let me settle', value: '5' },
            { emoji: '⏱️', label: 'I have more time — go deeper', value: '10' },
        ],
    },
    moderate: {
        id: 'time',
        title: 'How much time do you want to give yourself?',
        subtitle: 'Any amount is a gift to yourself',
        options: [
            { emoji: '⏱️', label: '1 minute — a quick reset', value: '1' },
            { emoji: '⏱️', label: '3 minutes — a solid pause', value: '3' },
            { emoji: '⏱️', label: '5 minutes — a real break', value: '5' },
            { emoji: '⏱️', label: "10+ minutes — I'm all in", value: '10' },
        ],
    },
    low: {
        id: 'time',
        title: 'How much energy do you have for this?',
        subtitle: "We'll make every second count",
        options: [
            { emoji: '⏱️', label: 'Under a minute — bare minimum', value: '1' },
            { emoji: '⏱️', label: '2-3 minutes — I can try', value: '3' },
            { emoji: '⏱️', label: "5 minutes — I'll give it a go", value: '5' },
            { emoji: '⏱️', label: 'Whatever it takes', value: '10' },
        ],
    },
};

/* ─────────────────────────────────────────────
   STEP COLOR ACCENTS (per step number)
   ───────────────────────────────────────────── */

export const STEP_COLORS: string[] = [
    '#fbbf24', // Step 1 — amber
    '#fb7185', // Step 2 — rose
    '#f97316', // Step 3 — orange
    '#2dd4bf', // Step 4 — teal
    '#818cf8', // Step 5 — indigo
    '#38bdf8', // Step 6 — sky
];

/* ─────────────────────────────────────────────
   Main resolver: getStep(stepIndex, answers)
   
   stepIndex: 0-based (0 = step 1, 5 = step 6)
   answers: { energy: '...', concern: '...', ... }
   ───────────────────────────────────────────── */

export function getStep(stepIndex: number, answers: Record<string, string>): DynamicStep {
    switch (stepIndex) {
        case 0:
            return STEP_1;

        case 1: {
            const energy = answers.energy || 'moderate';
            return STEP_2[energy] || STEP_2.moderate;
        }

        case 2: {
            const key = `${answers.energy}.${answers.concern}`;
            return STEP_3[key] || STEP_3[`${answers.energy}.${Object.keys(STEP_3).find(k => k.startsWith(answers.energy + '.'))?.split('.')[1] || 'stress'}`] || STEP_3['moderate.stress'];
        }

        case 3: {
            const key = `${answers.energy}.${answers.concern}`;
            return STEP_4[key] || STEP_4['moderate.stress'];
        }

        case 4: {
            const energy = answers.energy || 'moderate';
            return STEP_5[energy] || STEP_5.moderate;
        }

        case 5: {
            const energy = answers.energy || 'moderate';
            return STEP_6[energy] || STEP_6.moderate;
        }

        default:
            return STEP_1;
    }
}

/* ─────────────────────────────────────────────
   Total steps count
   ───────────────────────────────────────────── */

export const TOTAL_STEPS = 6;
