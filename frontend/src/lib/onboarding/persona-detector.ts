/**
 * Silent Help - Persona Detection Engine
 * "The AI That Knows You" - Intelligent User Identification
 * 
 * This engine analyzes user responses during onboarding to detect:
 * - Primary persona type (crisis_seeker, anxiety_manager, etc.)
 * - Recommended stress pathway (HIGH, MID, LOW)
 * - Personalized home layout configuration
 * 
 * The algorithm weighs multiple signals:
 * - Explicit emotional state selection
 * - Interaction patterns (hesitation, speed, confidence)
 * - Tool preferences and goals
 * - Contextual responses
 */

import type {
  OnboardingResponse,
  UserPersona,
  PersonaDetectionResult,
  HomeLayoutConfig,
  UserPreferences,
  CopingPreference,
  PERSONA_HOME_LAYOUTS,
} from '@/lib/types/onboarding';
import type { StressPathway } from '@/lib/types';

// ============================================================================
// Detection Weights & Thresholds
// ============================================================================

const DETECTION_CONFIG = {
  // Confidence thresholds
  HIGH_CONFIDENCE: 0.8,
  MEDIUM_CONFIDENCE: 0.6,
  LOW_CONFIDENCE: 0.4,

  // Emotional weight thresholds for pathway detection
  CRISIS_THRESHOLD: 8,       // emotionalWeight >= 8 → HIGH pathway
  ANXIETY_THRESHOLD: 5,      // emotionalWeight >= 5 → MID pathway
  
  // Interaction pattern weights
  HESITATION_PENALTY: 0.05,  // Per hesitation, reduce confidence
  QUICK_DECISION_BONUS: 0.1, // Fast, decisive answers boost confidence
  
  // Time thresholds (milliseconds)
  QUICK_DECISION_TIME: 3000,
  HESITANT_TIME: 15000,
};

// ============================================================================
// Persona Detection Algorithm
// ============================================================================

/**
 * Main persona detection function
 * Analyzes all onboarding responses to determine user persona
 */
export function detectPersona(responses: OnboardingResponse[]): PersonaDetectionResult {
  // Extract key response data
  const emotionalEntryResponse = responses.find(r => r.stepId === 'emotional_entry');
  const contextualResponses = responses.filter(r => 
    r.stepId.includes('crisis') || 
    r.stepId.includes('anxiety') || 
    r.stepId.includes('maintenance') ||
    r.stepId.includes('caregiver')
  );
  
  // Calculate base persona from emotional entry
  const { basePersna, baseConfidence, suggestedPathway } = 
    analyzeEmotionalEntry(emotionalEntryResponse);
  
  // Adjust based on contextual responses
  const { adjustedPersona, adjustedConfidence } = 
    adjustWithContextualData(basePersna, baseConfidence, contextualResponses);
  
  // Factor in interaction patterns
  const finalConfidence = adjustForInteractionPatterns(adjustedConfidence, responses);
  
  // Calculate alternate personas
  const alternates = calculateAlternatePersonas(basePersna, responses);
  
  // Generate reasoning for transparency
  const reasoning = generateReasoning(adjustedPersona, responses, suggestedPathway);
  
  // Get home layout for detected persona
  const homeLayout = getHomeLayoutForPersona(adjustedPersona, responses);
  
  return {
    persona: adjustedPersona,
    confidence: Math.min(finalConfidence, 1),
    alternatePersonas: alternates,
    suggestedPathway,
    reasoning,
    homeLayout,
  };
}

/**
 * Analyze the emotional entry step to get base persona
 */
function analyzeEmotionalEntry(
  response: OnboardingResponse | undefined
): { 
  basePersna: UserPersona; 
  baseConfidence: number; 
  suggestedPathway: StressPathway;
} {
  if (!response) {
    return {
      basePersna: 'curious_explorer',
      baseConfidence: DETECTION_CONFIG.LOW_CONFIDENCE,
      suggestedPathway: 'LOW',
    };
  }
  
  const emotionalState = response.value as string;
  
  switch (emotionalState) {
    case 'overwhelmed':
      return {
        basePersna: 'crisis_seeker',
        baseConfidence: DETECTION_CONFIG.HIGH_CONFIDENCE,
        suggestedPathway: 'HIGH',
      };
    
    case 'anxious':
      return {
        basePersna: 'anxiety_manager',
        baseConfidence: DETECTION_CONFIG.HIGH_CONFIDENCE,
        suggestedPathway: 'MID',
      };
    
    case 'just_okay':
      return {
        basePersna: 'stress_professional',
        baseConfidence: DETECTION_CONFIG.MEDIUM_CONFIDENCE,
        suggestedPathway: 'LOW',
      };
    
    case 'curious':
      return {
        basePersna: 'curious_explorer',
        baseConfidence: DETECTION_CONFIG.HIGH_CONFIDENCE,
        suggestedPathway: 'LOW',
      };
    
    case 'here_for_someone':
      return {
        basePersna: 'caregiver',
        baseConfidence: DETECTION_CONFIG.HIGH_CONFIDENCE,
        suggestedPathway: 'LOW',
      };
    
    default:
      return {
        basePersna: 'curious_explorer',
        baseConfidence: DETECTION_CONFIG.LOW_CONFIDENCE,
        suggestedPathway: 'LOW',
      };
  }
}

/**
 * Adjust persona based on contextual responses
 */
function adjustWithContextualData(
  basePersona: UserPersona,
  baseConfidence: number,
  contextualResponses: OnboardingResponse[]
): { adjustedPersona: UserPersona; adjustedConfidence: number } {
  let persona = basePersona;
  let confidence = baseConfidence;
  
  for (const response of contextualResponses) {
    // Crisis support choices
    if (response.stepId === 'crisis_support') {
      if (response.value === 'immediate_support') {
        persona = 'crisis_seeker';
        confidence = Math.min(confidence + 0.1, 1);
      } else if (response.value === 'calming_breath') {
        // Still crisis but more self-regulated
        confidence = Math.max(confidence - 0.05, 0.5);
      }
    }
    
    // Anxiety tools preference
    if (response.stepId === 'anxiety_tools') {
      const tools = Array.isArray(response.value) ? response.value : [response.value];
      if (tools.includes('not_sure')) {
        confidence = Math.max(confidence - 0.1, 0.4);
      } else if (tools.length >= 2) {
        // Knows what works - experienced anxiety manager
        confidence = Math.min(confidence + 0.1, 1);
      }
    }
    
    // Maintenance goals
    if (response.stepId === 'maintenance_goals') {
      const goals = Array.isArray(response.value) ? response.value : [response.value];
      if (goals.includes('stress_management')) {
        persona = 'stress_professional';
        confidence = Math.min(confidence + 0.05, 1);
      }
    }
    
    // Caregiver context
    if (response.stepId === 'caregiver_context') {
      if (response.value === 'professional') {
        // Healthcare professional - high confidence caregiver
        confidence = Math.min(confidence + 0.15, 1);
      }
    }
  }
  
  return { adjustedPersona: persona, adjustedConfidence: confidence };
}

/**
 * Adjust confidence based on interaction patterns
 */
function adjustForInteractionPatterns(
  baseConfidence: number,
  responses: OnboardingResponse[]
): number {
  let confidence = baseConfidence;
  
  for (const response of responses) {
    // Penalize hesitation
    if (response.hesitationCount > 2) {
      confidence -= DETECTION_CONFIG.HESITATION_PENALTY * response.hesitationCount;
    }
    
    // Bonus for quick, confident decisions
    if (response.interactionTime < DETECTION_CONFIG.QUICK_DECISION_TIME && 
        response.confidence > 0.8) {
      confidence += DETECTION_CONFIG.QUICK_DECISION_BONUS;
    }
    
    // Penalty for very slow responses (uncertainty)
    if (response.interactionTime > DETECTION_CONFIG.HESITANT_TIME) {
      confidence -= 0.05;
    }
  }
  
  return Math.max(confidence, 0.3); // Minimum 30% confidence
}

/**
 * Calculate alternate persona possibilities
 */
function calculateAlternatePersonas(
  primaryPersona: UserPersona,
  responses: OnboardingResponse[]
): { persona: UserPersona; confidence: number }[] {
  const alternates: { persona: UserPersona; confidence: number }[] = [];
  
  // Define persona relationships
  const personaRelationships: Record<UserPersona, UserPersona[]> = {
    crisis_seeker: ['anxiety_manager'],
    anxiety_manager: ['stress_professional', 'crisis_seeker'],
    stress_professional: ['anxiety_manager', 'curious_explorer'],
    curious_explorer: ['stress_professional'],
    caregiver: ['stress_professional'],
    returning_user: ['anxiety_manager', 'stress_professional'],
  };
  
  const relatedPersonas = personaRelationships[primaryPersona] || [];
  
  for (const relatedPersona of relatedPersonas) {
    // Calculate secondary confidence based on response patterns
    const emotionalEntry = responses.find(r => r.stepId === 'emotional_entry');
    let secondaryConfidence = 0.3;
    
    if (emotionalEntry) {
      // If they hesitated a lot, alternate persona is more likely
      if (emotionalEntry.hesitationCount > 1) {
        secondaryConfidence += 0.1;
      }
      
      // If decision was slow, alternate is more likely
      if (emotionalEntry.interactionTime > 10000) {
        secondaryConfidence += 0.1;
      }
    }
    
    alternates.push({
      persona: relatedPersona,
      confidence: Math.min(secondaryConfidence, 0.5),
    });
  }
  
  return alternates.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Generate human-readable reasoning for transparency
 */
function generateReasoning(
  persona: UserPersona,
  responses: OnboardingResponse[],
  pathway: StressPathway
): string {
  const emotionalEntry = responses.find(r => r.stepId === 'emotional_entry');
  const contextual = responses.filter(r => 
    r.stepId.includes('crisis') || 
    r.stepId.includes('anxiety') || 
    r.stepId.includes('maintenance') ||
    r.stepId.includes('caregiver')
  );
  
  const parts: string[] = [];
  
  // Emotional state reasoning
  if (emotionalEntry) {
    const stateMap: Record<string, string> = {
      overwhelmed: "You shared that you're feeling overwhelmed",
      anxious: "You mentioned feeling anxious",
      just_okay: "You indicated you're doing okay",
      curious: "You're here to explore mental wellness",
      here_for_someone: "You're supporting someone you care about",
    };
    parts.push(stateMap[emotionalEntry.value as string] || "Based on your responses");
  }
  
  // Contextual reasoning
  if (contextual.length > 0) {
    if (persona === 'crisis_seeker') {
      parts.push("so I've prioritized immediate support options");
    } else if (persona === 'anxiety_manager') {
      parts.push("so I've prepared your favorite calming tools");
    } else if (persona === 'stress_professional') {
      parts.push("so I've set up tracking and insights for you");
    } else if (persona === 'curious_explorer') {
      parts.push("so I've opened up all exploration options");
    } else if (persona === 'caregiver') {
      parts.push("so I've included resources for supporters");
    }
  }
  
  // Pathway reasoning
  const pathwayReason = pathway === 'HIGH' 
    ? "Your sanctuary is set for maximum support."
    : pathway === 'MID'
    ? "Your space is ready with calming tools."
    : "Your sanctuary is open for exploration.";
  
  parts.push(pathwayReason);
  
  return parts.join(", ");
}

/**
 * Get customized home layout for detected persona
 */
function getHomeLayoutForPersona(
  persona: UserPersona,
  responses: OnboardingResponse[]
): HomeLayoutConfig {
  // Import base layouts
  const baseLayouts: Record<UserPersona, HomeLayoutConfig> = {
    crisis_seeker: {
      layoutType: 'crisis',
      widgets: [
        { type: 'sos_prominent', position: 0, size: 'full', visible: true },
        { type: 'greeting', position: 1, size: 'medium', visible: true },
        { type: 'breathing_widget', position: 2, size: 'large', visible: true },
        { type: 'quick_tools', position: 3, size: 'medium', visible: true },
      ],
      accentColor: '#E53935',
      backgroundTheme: 'midnight',
      showBiometrics: false,
      quickAccessTools: ['breathing', 'grounding', 'crisis_contact'],
    },
    anxiety_manager: {
      layoutType: 'tools_first',
      widgets: [
        { type: 'greeting', position: 0, size: 'medium', visible: true },
        { type: 'quick_tools', position: 1, size: 'large', visible: true },
        { type: 'sanctuary_status', position: 2, size: 'small', visible: true },
        { type: 'daily_checkin', position: 3, size: 'medium', visible: true },
        { type: 'insight_card', position: 4, size: 'medium', visible: true },
      ],
      accentColor: '#F59E0B',
      backgroundTheme: 'dusk',
      showBiometrics: true,
      quickAccessTools: ['breathing', 'grounding', 'journaling', 'body_scan'],
    },
    stress_professional: {
      layoutType: 'balanced',
      widgets: [
        { type: 'greeting', position: 0, size: 'medium', visible: true },
        { type: 'sanctuary_status', position: 1, size: 'medium', visible: true },
        { type: 'quick_tools', position: 2, size: 'medium', visible: true },
        { type: 'mood_timeline', position: 3, size: 'large', visible: true },
        { type: 'pattern_insight', position: 4, size: 'medium', visible: true },
      ],
      accentColor: '#8B5CF6',
      backgroundTheme: 'neutral',
      showBiometrics: true,
      quickAccessTools: ['breathing', 'journaling', 'body_scan'],
    },
    curious_explorer: {
      layoutType: 'explorer',
      widgets: [
        { type: 'greeting', position: 0, size: 'medium', visible: true },
        { type: 'pathway_selector', position: 1, size: 'large', visible: true },
        { type: 'quick_tools', position: 2, size: 'large', visible: true },
        { type: 'journal_prompt', position: 3, size: 'medium', visible: true },
        { type: 'insight_card', position: 4, size: 'medium', visible: true },
      ],
      accentColor: '#B4A7D6',
      backgroundTheme: 'dawn',
      showBiometrics: false,
      quickAccessTools: ['journaling', 'breathing', 'grounding', 'body_scan'],
    },
    caregiver: {
      layoutType: 'caregiver',
      widgets: [
        { type: 'greeting', position: 0, size: 'medium', visible: true },
        { type: 'caregiver_resources', position: 1, size: 'large', visible: true },
        { type: 'quick_tools', position: 2, size: 'medium', visible: true },
        { type: 'journal_prompt', position: 3, size: 'medium', visible: true },
      ],
      accentColor: '#10B981',
      backgroundTheme: 'neutral',
      showBiometrics: false,
      quickAccessTools: ['journaling', 'breathing'],
    },
    returning_user: {
      layoutType: 'balanced',
      widgets: [
        { type: 'greeting', position: 0, size: 'medium', visible: true },
        { type: 'sanctuary_status', position: 1, size: 'medium', visible: true },
        { type: 'quick_tools', position: 2, size: 'medium', visible: true },
        { type: 'mood_timeline', position: 3, size: 'large', visible: true },
        { type: 'insight_card', position: 4, size: 'medium', visible: true },
      ],
      accentColor: '#7FDBCA',
      backgroundTheme: 'midnight',
      showBiometrics: true,
      quickAccessTools: ['breathing', 'journaling', 'grounding'],
    },
  };
  
  const layout = { ...baseLayouts[persona] };
  
  // Customize based on tool preferences from responses
  const toolsResponse = responses.find(r => r.stepId === 'anxiety_tools');
  if (toolsResponse) {
    const preferredTools = Array.isArray(toolsResponse.value) 
      ? toolsResponse.value 
      : [toolsResponse.value];
    
    // Map tool responses to tool IDs
    const toolMapping: Record<string, string> = {
      breathing: 'breathing',
      grounding: 'grounding',
      journaling: 'journaling',
      movement: 'movement',
      body_scan: 'body_scan',
    };
    
    layout.quickAccessTools = preferredTools
      .filter(t => t !== 'not_sure')
      .map(t => toolMapping[t] || t)
      .slice(0, 4);
  }
  
  return layout;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract preferred tools from onboarding responses
 */
export function extractToolPreferences(
  responses: OnboardingResponse[]
): CopingPreference[] {
  const toolsResponse = responses.find(r => 
    r.stepId === 'anxiety_tools' || r.stepId === 'maintenance_goals'
  );
  
  if (!toolsResponse) {
    return ['breathing', 'grounding']; // Defaults
  }
  
  const values = Array.isArray(toolsResponse.value) 
    ? toolsResponse.value 
    : [toolsResponse.value];
  
  const preferenceMap: Record<string, CopingPreference> = {
    breathing: 'breathing',
    grounding: 'grounding',
    journaling: 'journaling',
    movement: 'movement',
    body_scan: 'body_scan',
    build_resilience: 'grounding',
    stress_management: 'breathing',
    better_sleep: 'breathing',
    emotional_awareness: 'journaling',
  };
  
  return values
    .map(v => preferenceMap[v])
    .filter((p): p is CopingPreference => p !== undefined);
}

/**
 * Calculate optimal greeting style based on responses
 */
export function determineGreetingStyle(
  responses: OnboardingResponse[]
): 'formal' | 'casual' | 'nurturing' {
  const emotionalEntry = responses.find(r => r.stepId === 'emotional_entry');
  
  if (!emotionalEntry) return 'nurturing';
  
  switch (emotionalEntry.value) {
    case 'overwhelmed':
    case 'anxious':
      return 'nurturing'; // Gentle, supportive language
    case 'curious':
      return 'casual'; // Friendly, approachable
    case 'here_for_someone':
      return 'formal'; // Professional, informative
    default:
      return 'nurturing';
  }
}

/**
 * Build initial user preferences from onboarding
 */
export function buildUserPreferences(
  responses: OnboardingResponse[]
): Partial<UserPreferences> {
  const nameResponse = responses.find(r => r.stepId === 'personalization_name');
  const timeResponse = responses.find(r => r.stepId === 'personalization_time');
  
  return {
    displayName: (nameResponse?.value as string) || 'friend',
    greetingStyle: determineGreetingStyle(responses),
    preferredTools: extractToolPreferences(responses),
    windDownTime: timeResponse?.value as string,
    animationIntensity: 'moderate',
    contentDensity: 'balanced',
    enableBiometrics: false,
    enableNotifications: false,
    checkInFrequency: 'as_needed',
  };
}
