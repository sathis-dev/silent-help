/**
 * Crisis Detection — Keyword Gate
 * 
 * Fast, deterministic crisis keyword detection.
 * Every user message passes through this before AI processing.
 * If triggered, the AI response includes crisis resources.
 */

const CRISIS_KEYWORDS = [
    // Direct harm
    'kill myself', 'end my life', 'want to die', 'suicide',
    'suicidal', 'self harm', 'self-harm', 'cut myself',
    'hurt myself', 'end it all', 'no reason to live',
    'better off dead', 'can\'t go on', 'give up on life',
    // Ideation
    'don\'t want to be here', 'wish i was dead', 'not worth living',
    'no point in living', 'life is pointless', 'nothing matters anymore',
];

const UK_CRISIS_RESOURCES = {
    emergency: { name: 'Emergency Services', number: '999', description: 'For immediate danger' },
    samaritans: { name: 'Samaritans', number: '116 123', description: '24/7 emotional support, free to call' },
    shout: { name: 'Shout', number: 'Text SHOUT to 85258', description: 'Free 24/7 text support' },
    nhs: { name: 'NHS 111', number: '111', description: 'Mental health advice' },
    calm: { name: 'CALM', number: '0800 58 58 58', description: 'Campaign Against Living Miserably' },
};

export interface CrisisCheckResult {
    isCrisis: boolean;
    severity: 'none' | 'low' | 'medium' | 'high';
    matchedKeywords: string[];
    resources: typeof UK_CRISIS_RESOURCES | null;
    safetyMessage: string | null;
}

/**
 * Check user message for crisis keywords
 */
export function checkForCrisis(text: string): CrisisCheckResult {
    const lower = text.toLowerCase();
    const matched = CRISIS_KEYWORDS.filter(kw => lower.includes(kw));

    if (matched.length === 0) {
        return {
            isCrisis: false,
            severity: 'none',
            matchedKeywords: [],
            resources: null,
            safetyMessage: null,
        };
    }

    const severity = matched.length >= 3 ? 'high' : matched.length >= 2 ? 'medium' : 'low';

    return {
        isCrisis: true,
        severity,
        matchedKeywords: matched,
        resources: UK_CRISIS_RESOURCES,
        safetyMessage:
            "I hear you, and I want you to know that support is available right now. " +
            "You don't have to face this alone. Please reach out to one of these services — " +
            "they're free, confidential, and available 24/7.",
    };
}

/**
 * Get the crisis-aware system prompt addition
 */
export function getCrisisSystemPrompt(): string {
    return `
CRITICAL SAFETY RULES:
- If a user expresses suicidal thoughts, self-harm ideation, or is in crisis, ALWAYS provide UK crisis resources.
- Never dismiss or minimize someone's pain.
- Never provide medical diagnoses or prescribe treatments.
- Always encourage professional help for serious mental health concerns.
- If you detect crisis language, lead with empathy, then provide resources:
  • Samaritans: 116 123 (free, 24/7)
  • Shout: Text SHOUT to 85258 (free, 24/7)  
  • NHS 111 for mental health advice
  • 999 for immediate danger
- You are a supportive companion, NOT a therapist or medical professional.
`.trim();
}
