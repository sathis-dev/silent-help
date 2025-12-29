/**
 * AI Safety Guardrails - The "Safety Switch"
 * 
 * Implements a dual-gate safety system:
 * 1. Regex/Keyword Gate: Instant flags for high-risk UK-specific terms
 * 2. LLM Intent Classifier: Low-latency check for self-harm/medical advice intent
 * 
 * When triggered, AI sessions are immediately killed and replaced with
 * a Clinical Safety Card. No exceptions.
 */

import { prisma } from './prisma';
import type { SafetyTriggerType, HazardSeverity } from '@prisma/client';

// ============================================================================
// UK-SPECIFIC CRISIS KEYWORDS
// ============================================================================

// High-risk keywords that trigger immediate intervention
const EMERGENCY_KEYWORDS = [
  // Direct self-harm indicators
  'kill myself', 'end my life', 'want to die', 'suicide', 'suicidal',
  'don\'t want to live', 'can\'t go on', 'no reason to live',
  'better off dead', 'end it all', 'take my life',
  
  // Methods (triggers immediate safety response)
  'overdose', 'hang myself', 'cut myself', 'jump off', 'pills',
  'slit my wrists', 'drown myself',
  
  // Immediate danger
  'going to hurt myself', 'hurt myself now', 'harming myself',
  'self harm', 'self-harm', 'selfharm',
  
  // Crisis state
  'can\'t cope anymore', 'given up', 'no hope left', 'hopeless',
  'worthless', 'burden to everyone', 'everyone hates me',
];

// High-risk but requires context
const HIGH_RISK_KEYWORDS = [
  'want to hurt', 'thinking about death', 'death', 'dying',
  'can\'t take it anymore', 'too much pain', 'unbearable',
  'no point', 'why bother', 'give up', 'giving up',
  'hate myself', 'disgusted with myself', 'failure',
  'alone forever', 'nobody cares', 'no one understands',
  'trapped', 'no way out', 'stuck forever',
];

// Medical advice indicators (should not provide medical advice)
const MEDICAL_ADVICE_KEYWORDS = [
  'should I take', 'what medication', 'dose', 'dosage',
  'prescription', 'side effects', 'stop taking my',
  'overdose on', 'mix with alcohol', 'drug interaction',
  'diagnosis', 'diagnose me', 'do I have',
  'symptoms of', 'is this normal', 'medical advice',
  'see a doctor', 'go to hospital', 'A&E',
];

// UK Crisis Resources
export const UK_CRISIS_RESOURCES = {
  emergency: {
    number: '999',
    name: 'Emergency Services',
    description: 'For immediate danger to life',
  },
  nhs111: {
    number: '111',
    name: 'NHS 111',
    description: 'Urgent medical help when not life-threatening',
  },
  samaritans: {
    number: '116 123',
    name: 'Samaritans',
    description: 'Free 24/7 emotional support',
    email: 'jo@samaritans.org',
  },
  shout: {
    number: '85258',
    name: 'Shout',
    description: 'Free text support - text SHOUT',
    type: 'text',
  },
  papyrus: {
    number: '0800 068 4141',
    name: 'PAPYRUS',
    description: 'Support for young people under 35',
  },
  calm: {
    number: '0800 58 58 58',
    name: 'Campaign Against Living Miserably',
    description: 'Support for men, 5pm-midnight',
  },
  mind: {
    number: '0300 123 3393',
    name: 'Mind Infoline',
    description: 'Mental health information and support',
  },
};

// ============================================================================
// TYPES
// ============================================================================

export interface SafetyCheckResult {
  isSafe: boolean;
  shouldKillSession: boolean;
  triggerType: SafetyTriggerType | null;
  severity: HazardSeverity;
  matchedPatterns: string[];
  confidence: number;
  recommendedResources: typeof UK_CRISIS_RESOURCES[keyof typeof UK_CRISIS_RESOURCES][];
  clinicalCardRequired: boolean;
  requiresHumanReview: boolean;
}

export interface ClinicalSafetyCard {
  title: string;
  message: string;
  tone: 'calm' | 'urgent' | 'emergency';
  primaryResource: typeof UK_CRISIS_RESOURCES[keyof typeof UK_CRISIS_RESOURCES];
  additionalResources: typeof UK_CRISIS_RESOURCES[keyof typeof UK_CRISIS_RESOURCES][];
  selfCareOptions: string[];
}

// ============================================================================
// KEYWORD GATE (Gate 1)
// ============================================================================

/**
 * Performs instant keyword-based safety check.
 * This is the first gate - fast, deterministic, no API calls.
 */
export function keywordSafetyCheck(text: string): SafetyCheckResult {
  const normalizedText = text.toLowerCase();
  const matchedPatterns: string[] = [];
  
  // Check emergency keywords (highest severity)
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      matchedPatterns.push(keyword);
    }
  }
  
  if (matchedPatterns.length > 0) {
    return {
      isSafe: false,
      shouldKillSession: true,
      triggerType: 'KEYWORD_MATCH',
      severity: 'CRITICAL',
      matchedPatterns,
      confidence: 1.0,
      recommendedResources: [
        UK_CRISIS_RESOURCES.samaritans,
        UK_CRISIS_RESOURCES.shout,
        UK_CRISIS_RESOURCES.nhs111,
      ],
      clinicalCardRequired: true,
      requiresHumanReview: true,
    };
  }
  
  // Check high-risk keywords
  const highRiskMatches: string[] = [];
  for (const keyword of HIGH_RISK_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      highRiskMatches.push(keyword);
    }
  }
  
  if (highRiskMatches.length >= 2) {
    // Multiple high-risk indicators
    return {
      isSafe: false,
      shouldKillSession: true,
      triggerType: 'KEYWORD_MATCH',
      severity: 'HIGH',
      matchedPatterns: highRiskMatches,
      confidence: 0.9,
      recommendedResources: [
        UK_CRISIS_RESOURCES.samaritans,
        UK_CRISIS_RESOURCES.shout,
      ],
      clinicalCardRequired: true,
      requiresHumanReview: true,
    };
  } else if (highRiskMatches.length === 1) {
    // Single high-risk indicator - needs LLM verification
    return {
      isSafe: true, // Provisionally safe, needs LLM check
      shouldKillSession: false,
      triggerType: null,
      severity: 'MEDIUM',
      matchedPatterns: highRiskMatches,
      confidence: 0.6,
      recommendedResources: [UK_CRISIS_RESOURCES.samaritans],
      clinicalCardRequired: false,
      requiresHumanReview: false,
    };
  }
  
  // Check medical advice keywords
  const medicalMatches: string[] = [];
  for (const keyword of MEDICAL_ADVICE_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      medicalMatches.push(keyword);
    }
  }
  
  if (medicalMatches.length > 0) {
    return {
      isSafe: true, // Safe but redirect to medical resources
      shouldKillSession: false,
      triggerType: null,
      severity: 'LOW',
      matchedPatterns: medicalMatches,
      confidence: 0.8,
      recommendedResources: [UK_CRISIS_RESOURCES.nhs111],
      clinicalCardRequired: false,
      requiresHumanReview: false,
    };
  }
  
  // No concerning patterns found
  return {
    isSafe: true,
    shouldKillSession: false,
    triggerType: null,
    severity: 'LOW',
    matchedPatterns: [],
    confidence: 1.0,
    recommendedResources: [],
    clinicalCardRequired: false,
    requiresHumanReview: false,
  };
}

// ============================================================================
// LLM INTENT CLASSIFIER (Gate 2)
// ============================================================================

/**
 * Uses LLM to classify intent for borderline cases.
 * Only called when keyword gate is uncertain.
 */
export async function llmIntentCheck(text: string): Promise<SafetyCheckResult> {
  try {
    // Import OpenAI dynamically to avoid issues if not configured
    const { default: OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast, low-latency model for classification
      messages: [
        {
          role: 'system',
          content: `You are a mental health safety classifier. Analyze the user's message and classify the intent.
          
          Respond with ONLY a JSON object in this exact format:
          {
            "intent": "SAFE" | "SELF_HARM" | "MEDICAL_ADVICE" | "CRISIS",
            "confidence": 0.0 to 1.0,
            "reasoning": "brief explanation"
          }
          
          Classifications:
          - SAFE: Normal emotional expression, seeking support
          - SELF_HARM: Expressing thoughts of self-harm or suicide
          - MEDICAL_ADVICE: Seeking medical/medication advice
          - CRISIS: Acute mental health crisis requiring immediate support
          
          Be cautious but not over-sensitive. Many people express difficult emotions without being in crisis.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: 150,
      temperature: 0, // Deterministic for safety
    });
    
    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    if (result.intent === 'SELF_HARM' || result.intent === 'CRISIS') {
      return {
        isSafe: false,
        shouldKillSession: true,
        triggerType: 'LLM_INTENT',
        severity: result.intent === 'CRISIS' ? 'CRITICAL' : 'HIGH',
        matchedPatterns: [result.intent],
        confidence: result.confidence || 0.8,
        recommendedResources: [
          UK_CRISIS_RESOURCES.samaritans,
          UK_CRISIS_RESOURCES.shout,
        ],
        clinicalCardRequired: true,
        requiresHumanReview: true,
      };
    }
    
    if (result.intent === 'MEDICAL_ADVICE') {
      return {
        isSafe: true,
        shouldKillSession: false,
        triggerType: null,
        severity: 'LOW',
        matchedPatterns: ['MEDICAL_ADVICE'],
        confidence: result.confidence || 0.8,
        recommendedResources: [UK_CRISIS_RESOURCES.nhs111],
        clinicalCardRequired: false,
        requiresHumanReview: false,
      };
    }
    
    return {
      isSafe: true,
      shouldKillSession: false,
      triggerType: null,
      severity: 'LOW',
      matchedPatterns: [],
      confidence: result.confidence || 0.9,
      recommendedResources: [],
      clinicalCardRequired: false,
      requiresHumanReview: false,
    };
  } catch (error) {
    console.error('LLM intent check failed:', error);
    
    // On failure, err on the side of caution but don't block
    return {
      isSafe: true,
      shouldKillSession: false,
      triggerType: null,
      severity: 'MEDIUM',
      matchedPatterns: ['LLM_CHECK_FAILED'],
      confidence: 0.5,
      recommendedResources: [UK_CRISIS_RESOURCES.samaritans],
      clinicalCardRequired: false,
      requiresHumanReview: true,
    };
  }
}

// ============================================================================
// DUAL-GATE SAFETY CHECK
// ============================================================================

/**
 * Main safety check function - runs both gates.
 * Gate 1 (keyword) runs first. Gate 2 (LLM) only runs if Gate 1 is uncertain.
 */
export async function performSafetyCheck(text: string): Promise<SafetyCheckResult> {
  // Gate 1: Keyword check (instant)
  const keywordResult = keywordSafetyCheck(text);
  
  // If keyword gate is certain (either definitely safe or definitely unsafe)
  if (keywordResult.confidence >= 0.9) {
    return keywordResult;
  }
  
  // Gate 2: LLM check for uncertain cases
  const llmResult = await llmIntentCheck(text);
  
  // Combine results - take the more severe classification
  if (!llmResult.isSafe && llmResult.confidence > keywordResult.confidence) {
    return llmResult;
  }
  
  // If LLM says safe but keywords were concerning, be cautious
  if (keywordResult.matchedPatterns.length > 0 && llmResult.isSafe) {
    return {
      ...keywordResult,
      recommendedResources: [UK_CRISIS_RESOURCES.samaritans],
      clinicalCardRequired: false,
    };
  }
  
  return llmResult;
}

// ============================================================================
// CLINICAL SAFETY CARD GENERATION
// ============================================================================

/**
 * Generates an appropriate clinical safety card based on severity.
 * The tone is always calm, grounded, and without exclamation marks.
 */
export function generateClinicalSafetyCard(result: SafetyCheckResult): ClinicalSafetyCard {
  if (result.severity === 'CRITICAL') {
    return {
      title: 'We hear you',
      message: `It sounds like you're going through something really difficult right now. You don't have to face this alone. Speaking with someone who understands can help.`,
      tone: 'urgent',
      primaryResource: UK_CRISIS_RESOURCES.samaritans,
      additionalResources: [
        UK_CRISIS_RESOURCES.shout,
        UK_CRISIS_RESOURCES.nhs111,
      ],
      selfCareOptions: [
        'Find a quiet, safe space',
        'Focus on your breathing',
        'Reach out to someone you trust',
      ],
    };
  }
  
  if (result.severity === 'HIGH') {
    return {
      title: 'You matter',
      message: `What you're feeling is valid, and support is available whenever you need it. Consider reaching out to someone who can listen.`,
      tone: 'calm',
      primaryResource: UK_CRISIS_RESOURCES.samaritans,
      additionalResources: [UK_CRISIS_RESOURCES.mind],
      selfCareOptions: [
        'Take a moment to breathe',
        'Ground yourself with the 5-4-3-2-1 technique',
        'Consider calling a trusted friend or family member',
      ],
    };
  }
  
  // Default / MEDIUM severity
  return {
    title: 'Support is here',
    message: `If you need to talk to someone, these resources are available 24/7.`,
    tone: 'calm',
    primaryResource: UK_CRISIS_RESOURCES.samaritans,
    additionalResources: [],
    selfCareOptions: [
      'Take things one moment at a time',
      'It\'s okay to ask for help',
    ],
  };
}

// ============================================================================
// HAZARD LOGGING
// ============================================================================

/**
 * Logs a safety trigger to the ClinicalHazardLog table.
 * Required for UK regulatory compliance and system improvement.
 */
export async function logHazardEvent(
  userId: string,
  result: SafetyCheckResult,
  interventionId?: string
): Promise<void> {
  try {
    await prisma.clinicalHazardLog.create({
      data: {
        userId,
        interventionId,
        triggerType: result.triggerType || 'KEYWORD_MATCH',
        severity: result.severity,
        triggerSource: 'safety-guardrails',
        detectedPattern: result.matchedPatterns.join(', '),
        confidenceScore: result.confidence,
        actionsTaken: [
          result.shouldKillSession ? 'AI_SESSION_KILLED' : 'SESSION_CONTINUED',
          result.clinicalCardRequired ? 'CLINICAL_CARD_SHOWN' : 'NO_CARD',
        ],
        aiSessionKilled: result.shouldKillSession,
        clinicalCardShown: result.clinicalCardRequired,
        resourcesProvided: result.recommendedResources.map(r => r.name),
      },
    });
  } catch (error) {
    // Log error but don't throw - safety logging should not break the app
    console.error('Failed to log hazard event:', error);
  }
}
