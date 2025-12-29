/**
 * Silent Help - Onboarding Type Definitions
 * "The First Touch" - Intelligent User Identification System
 * 
 * This module defines all types for the intelligent onboarding flow
 * that identifies user personas and customizes their sanctuary.
 */

// ============================================================================
// USER PERSONA TYPES
// ============================================================================

/**
 * Primary user personas detected through onboarding.
 * Each persona gets a customized home layout and tool prioritization.
 */
export type UserPersona = 
  | 'crisis_seeker'       // Actively in distress, needs immediate help
  | 'anxiety_manager'     // Regular anxiety, wants coping tools
  | 'stress_professional' // Work/life stress, needs balance
  | 'curious_explorer'    // Just exploring, mental wellness curious
  | 'caregiver'           // Supporting someone else
  | 'returning_user';     // Has history with the app

/**
 * Emotional state detected during onboarding
 */
export type EmotionalState = 
  | 'overwhelmed'         // HIGH pathway - crisis potential
  | 'anxious'             // MID pathway - needs calming
  | 'just_okay'           // LOW pathway - maintenance
  | 'curious'             // Explorer mode
  | 'here_for_someone';   // Caregiver mode

/**
 * Preferred coping mechanisms
 */
export type CopingPreference = 
  | 'breathing'           // Breathing exercises
  | 'grounding'           // Grounding techniques (5-4-3-2-1)
  | 'journaling'          // Writing/reflection
  | 'body_scan'           // Body awareness
  | 'movement'            // Physical activity
  | 'connection';         // Social support

// ============================================================================
// ONBOARDING FLOW TYPES
// ============================================================================

/**
 * Individual onboarding step definition
 */
export interface OnboardingStep {
  id: string;
  type: 'welcome' | 'emotional_entry' | 'contextual' | 'personalization' | 'transition';
  title: string;
  subtitle?: string;
  options?: OnboardingOption[];
  inputType?: 'select' | 'text' | 'voice' | 'time' | 'multi_select';
  required: boolean;
  conditionalOn?: {
    stepId: string;
    values: string[];
  };
}

/**
 * Option within an onboarding step
 */
export interface OnboardingOption {
  id: string;
  label: string;
  icon: string;
  description?: string;
  emotionalWeight: number;    // 0-10, higher = more distress
  leadsTo?: string;           // Next step ID for branching
  color: string;              // Accent color for this option
  hapticPattern?: 'soft' | 'medium' | 'strong';
}

/**
 * User's response to an onboarding step
 */
export interface OnboardingResponse {
  stepId: string;
  value: string | string[];
  timestamp: Date;
  interactionTime: number;    // Milliseconds spent on this step
  hesitationCount: number;    // How many times they hovered/changed
  confidence: number;         // 0-1, how decisively they chose
}

/**
 * Complete onboarding session data
 */
export interface OnboardingSession {
  sessionId: string;
  startedAt: Date;
  completedAt?: Date;
  responses: OnboardingResponse[];
  detectedPersona: UserPersona | null;
  suggestedPathway: 'HIGH' | 'MID' | 'LOW' | null;
  userName?: string;
  userPreferences: UserPreferences;
}

// ============================================================================
// USER PREFERENCES & PROFILE
// ============================================================================

/**
 * User preferences collected during onboarding
 */
export interface UserPreferences {
  displayName: string;
  greetingStyle: 'formal' | 'casual' | 'nurturing';
  preferredTools: CopingPreference[];
  windDownTime?: string;      // HH:MM format
  wakeUpTime?: string;        // HH:MM format
  colorTemperature: 'warm' | 'cool' | 'neutral';
  animationIntensity: 'minimal' | 'moderate' | 'rich';
  contentDensity: 'sparse' | 'balanced' | 'dense';
  enableBiometrics: boolean;
  enableNotifications: boolean;
  checkInFrequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
}

/**
 * Complete user profile after onboarding
 */
export interface UserProfile {
  id: string;
  persona: UserPersona;
  preferences: UserPreferences;
  homeLayout: HomeLayoutConfig;
  createdAt: Date;
  lastUpdatedAt: Date;
  onboardingComplete: boolean;
}

// ============================================================================
// HOME LAYOUT CONFIGURATION
// ============================================================================

/**
 * Widget types available for the adaptive home
 */
export type HomeWidgetType = 
  | 'greeting'            // Personalized greeting
  | 'sanctuary_status'    // Biometric/mood summary
  | 'quick_tools'         // Personalized tool grid
  | 'daily_checkin'       // Morning/evening ritual
  | 'mood_timeline'       // Visual mood history
  | 'insight_card'        // AI observations
  | 'pathway_selector'    // Manual pathway choice
  | 'sos_prominent'       // Large SOS for crisis
  | 'caregiver_resources' // Resources for supporters
  | 'breathing_widget'    // Quick breathing exercise
  | 'journal_prompt'      // Writing prompt
  | 'pattern_insight';    // Detected patterns

/**
 * Individual widget configuration
 */
export interface HomeWidget {
  type: HomeWidgetType;
  position: number;           // Order in layout
  size: 'small' | 'medium' | 'large' | 'full';
  visible: boolean;
  config?: Record<string, unknown>;
}

/**
 * Complete home layout configuration
 */
export interface HomeLayoutConfig {
  layoutType: 'crisis' | 'tools_first' | 'balanced' | 'explorer' | 'caregiver';
  widgets: HomeWidget[];
  accentColor: string;
  backgroundTheme: 'midnight' | 'dusk' | 'dawn' | 'neutral';
  showBiometrics: boolean;
  quickAccessTools: string[];
}

// ============================================================================
// PERSONA DETECTION
// ============================================================================

/**
 * Weights for persona detection algorithm
 */
export interface PersonaDetectionWeights {
  emotionalStateWeight: number;
  interactionSpeedWeight: number;
  toolPreferenceWeight: number;
  hesitationWeight: number;
}

/**
 * Result of persona detection
 */
export interface PersonaDetectionResult {
  persona: UserPersona;
  confidence: number;         // 0-1
  alternatePersonas: {
    persona: UserPersona;
    confidence: number;
  }[];
  suggestedPathway: 'HIGH' | 'MID' | 'LOW';
  reasoning: string;          // For transparency
  homeLayout: HomeLayoutConfig;
}

// ============================================================================
// ONBOARDING CONTEXT STATE
// ============================================================================

/**
 * Main onboarding context state
 */
export interface OnboardingState {
  // Flow state
  currentStepIndex: number;
  totalSteps: number;
  isComplete: boolean;
  isLoading: boolean;
  
  // Session data
  session: OnboardingSession;
  
  // Detected profile (built progressively)
  detectedProfile: Partial<UserProfile> | null;
  
  // UI state
  animationDirection: 'forward' | 'backward';
  showSkipOption: boolean;
}

/**
 * Onboarding context actions
 */
export interface OnboardingActions {
  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  restartOnboarding: () => void;
  
  // Response handling
  submitResponse: (response: Omit<OnboardingResponse, 'timestamp'>) => void;
  
  // Profile building
  updateUserName: (name: string) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Completion
  completeOnboarding: () => Promise<UserProfile>;
}

/**
 * Combined onboarding context
 */
export type OnboardingContextValue = OnboardingState & OnboardingActions;

// ============================================================================
// ONBOARDING STEP DEFINITIONS
// ============================================================================

/**
 * Pre-defined onboarding flow steps
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'A sanctuary awaits',
    subtitle: 'that knows you',
    required: true,
  },
  {
    id: 'emotional_entry',
    type: 'emotional_entry',
    title: 'Right now, I\'m feeling...',
    inputType: 'select',
    required: true,
    options: [
      {
        id: 'overwhelmed',
        label: 'Overwhelmed',
        icon: '😢',
        description: 'Everything feels like too much',
        emotionalWeight: 9,
        color: '#E53935',
        hapticPattern: 'soft',
      },
      {
        id: 'anxious',
        label: 'Anxious',
        icon: '😰',
        description: 'Worry won\'t quiet down',
        emotionalWeight: 7,
        color: '#F59E0B',
        hapticPattern: 'soft',
      },
      {
        id: 'just_okay',
        label: 'Just okay',
        icon: '😐',
        description: 'Taking each moment as it comes',
        emotionalWeight: 4,
        color: '#7FDBCA',
        hapticPattern: 'soft',
      },
      {
        id: 'curious',
        label: 'Curious',
        icon: '🤔',
        description: 'Exploring mental wellness',
        emotionalWeight: 2,
        color: '#B4A7D6',
        hapticPattern: 'soft',
      },
      {
        id: 'here_for_someone',
        label: 'Here for someone',
        icon: '💚',
        description: 'Supporting a loved one',
        emotionalWeight: 3,
        color: '#10B981',
        hapticPattern: 'soft',
      },
    ],
  },
  {
    id: 'crisis_support',
    type: 'contextual',
    title: 'Would you like to...',
    inputType: 'select',
    required: true,
    conditionalOn: {
      stepId: 'emotional_entry',
      values: ['overwhelmed'],
    },
    options: [
      {
        id: 'immediate_support',
        label: 'Get immediate support',
        icon: '🆘',
        description: 'Connect with crisis resources',
        emotionalWeight: 10,
        color: '#E53935',
        hapticPattern: 'medium',
      },
      {
        id: 'calming_breath',
        label: 'Take a calming breath first',
        icon: '🌊',
        description: 'A moment to ground yourself',
        emotionalWeight: 8,
        color: '#14B8A6',
        hapticPattern: 'soft',
      },
      {
        id: 'quiet_space',
        label: 'Just have a quiet space',
        icon: '💭',
        description: 'Be here without expectations',
        emotionalWeight: 7,
        color: '#B4A7D6',
        hapticPattern: 'soft',
      },
    ],
  },
  {
    id: 'anxiety_tools',
    type: 'contextual',
    title: 'What usually helps you...',
    inputType: 'multi_select',
    required: true,
    conditionalOn: {
      stepId: 'emotional_entry',
      values: ['anxious'],
    },
    options: [
      {
        id: 'breathing',
        label: 'Breathing exercises',
        icon: '🫁',
        emotionalWeight: 5,
        color: '#14B8A6',
        hapticPattern: 'soft',
      },
      {
        id: 'grounding',
        label: 'Grounding techniques',
        icon: '✋',
        emotionalWeight: 5,
        color: '#8B5CF6',
        hapticPattern: 'soft',
      },
      {
        id: 'journaling',
        label: 'Writing it out',
        icon: '📝',
        emotionalWeight: 5,
        color: '#F59E0B',
        hapticPattern: 'soft',
      },
      {
        id: 'movement',
        label: 'Movement or walking',
        icon: '🚶',
        emotionalWeight: 4,
        color: '#10B981',
        hapticPattern: 'soft',
      },
      {
        id: 'not_sure',
        label: 'I\'m not sure yet',
        icon: '🤷',
        emotionalWeight: 6,
        color: '#6B7280',
        hapticPattern: 'soft',
      },
    ],
  },
  {
    id: 'maintenance_goals',
    type: 'contextual',
    title: 'What brings you here today?',
    inputType: 'multi_select',
    required: true,
    conditionalOn: {
      stepId: 'emotional_entry',
      values: ['just_okay', 'curious'],
    },
    options: [
      {
        id: 'build_resilience',
        label: 'Build resilience',
        icon: '💪',
        emotionalWeight: 2,
        color: '#10B981',
        hapticPattern: 'soft',
      },
      {
        id: 'stress_management',
        label: 'Manage daily stress',
        icon: '🧘',
        emotionalWeight: 3,
        color: '#8B5CF6',
        hapticPattern: 'soft',
      },
      {
        id: 'better_sleep',
        label: 'Sleep better',
        icon: '🌙',
        emotionalWeight: 3,
        color: '#B4A7D6',
        hapticPattern: 'soft',
      },
      {
        id: 'emotional_awareness',
        label: 'Understand my emotions',
        icon: '🎯',
        emotionalWeight: 2,
        color: '#F59E0B',
        hapticPattern: 'soft',
      },
    ],
  },
  {
    id: 'caregiver_context',
    type: 'contextual',
    title: 'Who are you supporting?',
    inputType: 'select',
    required: true,
    conditionalOn: {
      stepId: 'emotional_entry',
      values: ['here_for_someone'],
    },
    options: [
      {
        id: 'partner_family',
        label: 'Partner or family member',
        icon: '👨‍👩‍👧',
        emotionalWeight: 4,
        color: '#10B981',
        hapticPattern: 'soft',
      },
      {
        id: 'friend',
        label: 'Friend',
        icon: '🤝',
        emotionalWeight: 3,
        color: '#14B8A6',
        hapticPattern: 'soft',
      },
      {
        id: 'colleague',
        label: 'Colleague',
        icon: '💼',
        emotionalWeight: 3,
        color: '#6B7280',
        hapticPattern: 'soft',
      },
      {
        id: 'professional',
        label: 'I\'m a professional',
        icon: '🩺',
        emotionalWeight: 2,
        color: '#0EA5E9',
        hapticPattern: 'soft',
      },
    ],
  },
  {
    id: 'personalization_name',
    type: 'personalization',
    title: 'How should I greet you?',
    subtitle: 'A name, nickname, or nothing at all',
    inputType: 'text',
    required: false,
  },
  {
    id: 'personalization_time',
    type: 'personalization',
    title: 'When do you usually wind down?',
    subtitle: 'I\'ll be gentler during these hours',
    inputType: 'time',
    required: false,
  },
  {
    id: 'transition',
    type: 'transition',
    title: 'Building your sanctuary...',
    subtitle: 'A space that understands you',
    required: true,
  },
];

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  displayName: 'friend',
  greetingStyle: 'nurturing',
  preferredTools: ['breathing', 'grounding'],
  colorTemperature: 'cool',
  animationIntensity: 'moderate',
  contentDensity: 'balanced',
  enableBiometrics: false,
  enableNotifications: false,
  checkInFrequency: 'as_needed',
};

export const PERSONA_HOME_LAYOUTS: Record<UserPersona, HomeLayoutConfig> = {
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
