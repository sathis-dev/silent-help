/**
 * Shared Types for Silent Help
 * 
 * Type definitions that align with the Three-Tier Engine architecture.
 */

// ============================================================================
// PATHWAY TYPES
// ============================================================================

export type StressPathway = 'HIGH' | 'MID' | 'LOW';

export type HazardSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PathwayAction {
  id: string;
  label: string;
  description: string;
  type: 'crisis_contact' | 'breathing' | 'grounding' | 'journal' | 'body_scan' | 'action';
  priority: number;
  icon: string;
  color: string;
  tactileWeight: 'heavy' | 'medium' | 'light';
  phoneNumber?: string;
  textNumber?: string;
}

export interface BreathingExercise {
  name: string;
  description: string;
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
  cycles: number;
  totalDuration: number;
}

export interface GroundingTechnique {
  name: string;
  description: string;
  steps: string[];
  targetDuration: number;
}

export interface PathwayConfig {
  pathway: StressPathway;
  name: string;
  description: string;
  allowsAI: boolean;
  uiScale: 'large' | 'medium' | 'normal';
  hapticFeedback: boolean;
  animationLevel: 'minimal' | 'standard' | 'rich';
  primaryActions: PathwayAction[];
  breathingExercise: BreathingExercise | null;
  groundingTechnique: GroundingTechnique | null;
}

// ============================================================================
// CRISIS RESOURCES
// ============================================================================

export interface CrisisResource {
  number: string;
  name: string;
  description: string;
  email?: string;
  type?: 'call' | 'text';
}

export const UK_CRISIS_RESOURCES: Record<string, CrisisResource> = {
  emergency: {
    number: '999',
    name: 'Emergency Services',
    description: 'For immediate danger to life',
    type: 'call',
  },
  nhs111: {
    number: '111',
    name: 'NHS 111',
    description: 'Urgent medical help when not life-threatening',
    type: 'call',
  },
  samaritans: {
    number: '116 123',
    name: 'Samaritans',
    description: 'Free 24/7 emotional support',
    email: 'jo@samaritans.org',
    type: 'call',
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
    type: 'call',
  },
  calm: {
    number: '0800 58 58 58',
    name: 'CALM',
    description: 'Support for men, 5pm-midnight',
    type: 'call',
  },
  mind: {
    number: '0300 123 3393',
    name: 'Mind Infoline',
    description: 'Mental health information and support',
    type: 'call',
  },
};

// ============================================================================
// SAFETY TYPES
// ============================================================================

export interface SafetyCheckResult {
  safe: boolean;
  severity: HazardSeverity;
  action: 'continue' | 'show_resources' | 'show_safety_card' | 'kill_session';
  safetyCard?: ClinicalSafetyCard;
  resources?: CrisisResource[];
}

export interface ClinicalSafetyCard {
  title: string;
  message: string;
  tone: 'calm' | 'urgent' | 'emergency';
  primaryResource: CrisisResource;
  additionalResources: CrisisResource[];
  selfCareOptions: string[];
}

// ============================================================================
// JOURNAL TYPES
// ============================================================================

export interface JournalEntry {
  id: string;
  content: string;
  entryType: 'freeform' | 'guided' | 'voice';
  moodSnapshot?: string;
  pathway: StressPathway;
  createdAt: Date;
}

export interface PatternInsight {
  type: 'trigger_pattern' | 'tool_effectiveness' | 'time_pattern' | 'emotional_cycle';
  title: string;
  description: string;
  confidence: number;
  actionSuggestion?: string;
  historicalData?: {
    previousOccurrence: Date;
    toolUsed?: string;
    recoveryTime?: number;
  };
}

// ============================================================================
// MOOD TYPES
// ============================================================================

export interface MoodLog {
  id: string;
  pathway: StressPathway;
  intensityStart: number;
  intensityEnd?: number;
  primaryEmotion: string;
  secondaryEmotions: string[];
  physicalSymptoms: string[];
  triggerCategory?: string;
  toolUsed?: string;
  toolDurationSeconds?: number;
  timeToCalm?: number;
  resolutionSuccess?: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

// ============================================================================
// BODY SCAN TYPES
// ============================================================================

export interface BodyArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BodyScanResult {
  areas: Record<string, number>; // body area id -> tension level 0-10
  overallTension: number;
  dominantEmotion?: string;
  timestamp: Date;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface AppState {
  currentPathway: StressPathway;
  isLoading: boolean;
  safetyCard: ClinicalSafetyCard | null;
  currentBreathingExercise: BreathingExercise | null;
  currentGroundingStep: number;
  connectionMessage: string | null;
}
