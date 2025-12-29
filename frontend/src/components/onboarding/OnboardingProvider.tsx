'use client';

/**
 * Silent Help - Onboarding Provider
 * "The First Touch" - Intelligent Onboarding State Management
 * 
 * This provider manages the entire onboarding flow:
 * - Step navigation and progress tracking
 * - Response collection and validation
 * - Progressive profile building
 * - Persona detection integration
 * - Local storage persistence
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect,
  useMemo,
  useRef,
  ReactNode 
} from 'react';
import {
  OnboardingState,
  OnboardingActions,
  OnboardingContextValue,
  OnboardingSession,
  OnboardingResponse,
  OnboardingStep,
  UserProfile,
  UserPreferences,
  ONBOARDING_STEPS,
  DEFAULT_USER_PREFERENCES,
} from '@/lib/types/onboarding';
import { 
  detectPersona, 
  buildUserPreferences 
} from '@/lib/onboarding/persona-detector';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  ONBOARDING_SESSION: 'silent_help_onboarding_session',
  USER_PROFILE: 'silent_help_user_profile',
  ONBOARDING_COMPLETE: 'silent_help_onboarding_complete',
};

// ============================================================================
// Context
// ============================================================================

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get applicable steps based on responses (handles conditional steps)
 */
function getApplicableSteps(
  allSteps: OnboardingStep[],
  responses: OnboardingResponse[]
): OnboardingStep[] {
  return allSteps.filter(step => {
    // Always include non-conditional steps
    if (!step.conditionalOn) return true;
    
    // Check if condition is met
    const conditionResponse = responses.find(
      r => r.stepId === step.conditionalOn!.stepId
    );
    
    if (!conditionResponse) return false;
    
    const responseValue = Array.isArray(conditionResponse.value)
      ? conditionResponse.value
      : [conditionResponse.value];
    
    return step.conditionalOn.values.some(v => responseValue.includes(v));
  });
}

/**
 * Create initial session
 */
function createInitialSession(): OnboardingSession {
  return {
    sessionId: generateSessionId(),
    startedAt: new Date(),
    responses: [],
    detectedPersona: null,
    suggestedPathway: null,
    userPreferences: DEFAULT_USER_PREFERENCES,
  };
}

/**
 * Load session from storage
 */
function loadStoredSession(): OnboardingSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ONBOARDING_SESSION);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        startedAt: new Date(parsed.startedAt),
        completedAt: parsed.completedAt ? new Date(parsed.completedAt) : undefined,
        responses: parsed.responses.map((r: OnboardingResponse) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        })),
      };
    }
  } catch (error) {
    console.error('Failed to load onboarding session:', error);
  }
  return null;
}

/**
 * Save session to storage
 */
function saveSession(session: OnboardingSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save onboarding session:', error);
  }
}

/**
 * Check if onboarding is already complete
 */
function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
  } catch {
    return false;
  }
}

/**
 * Load stored user profile
 */
function loadUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        lastUpdatedAt: new Date(parsed.lastUpdatedAt),
      };
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
  return null;
}

/**
 * Save user profile to storage
 */
function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
  } catch (error) {
    console.error('Failed to save user profile:', error);
  }
}

// ============================================================================
// Provider Component
// ============================================================================

interface OnboardingProviderProps {
  children: ReactNode;
  onComplete?: (profile: UserProfile) => void;
}

export function OnboardingProvider({ 
  children, 
  onComplete 
}: OnboardingProviderProps) {
  // State
  const [session, setSession] = useState<OnboardingSession>(createInitialSession);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');
  const [detectedProfile, setDetectedProfile] = useState<Partial<UserProfile> | null>(null);
  
  // Ref to track initialization (prevents infinite loop)
  const isInitialized = useRef(false);

  // Memoize applicable steps to prevent recalculation on every render
  const applicableSteps = useMemo(
    () => getApplicableSteps(ONBOARDING_STEPS, session.responses),
    [session.responses]
  );
  const totalSteps = applicableSteps.length;
  const currentStep = applicableSteps[currentStepIndex];

  // ============================================================================
  // Initialization
  // ============================================================================

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    // Check if onboarding is already complete
    if (isOnboardingComplete()) {
      const profile = loadUserProfile();
      if (profile) {
        setDetectedProfile(profile);
        setIsComplete(true);
      }
    } else {
      // Load any existing session
      const storedSession = loadStoredSession();
      if (storedSession) {
        setSession(storedSession);
        // Resume from last completed step
        const lastResponseIndex = storedSession.responses.length;
        const steps = getApplicableSteps(ONBOARDING_STEPS, storedSession.responses);
        setCurrentStepIndex(Math.min(lastResponseIndex, steps.length - 1));
      }
    }
    setIsLoading(false);
  }, []);

  // ============================================================================
  // Persist session on changes
  // ============================================================================

  useEffect(() => {
    if (!isLoading && !isComplete) {
      saveSession(session);
    }
  }, [session, isLoading, isComplete]);

  // ============================================================================
  // Actions
  // ============================================================================

  const nextStep = useCallback(() => {
    setAnimationDirection('forward');
    
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, totalSteps]);

  const previousStep = useCallback(() => {
    setAnimationDirection('backward');
    
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const skipOnboarding = useCallback(() => {
    // Create minimal profile with defaults
    const defaultProfile: UserProfile = {
      id: generateSessionId(),
      persona: 'curious_explorer',
      preferences: DEFAULT_USER_PREFERENCES,
      homeLayout: {
        layoutType: 'explorer',
        widgets: [
          { type: 'greeting', position: 0, size: 'medium', visible: true },
          { type: 'pathway_selector', position: 1, size: 'large', visible: true },
          { type: 'quick_tools', position: 2, size: 'large', visible: true },
        ],
        accentColor: '#B4A7D6',
        backgroundTheme: 'midnight',
        showBiometrics: false,
        quickAccessTools: ['breathing', 'journaling', 'grounding'],
      },
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      onboardingComplete: true,
    };
    
    saveUserProfile(defaultProfile);
    setDetectedProfile(defaultProfile);
    setIsComplete(true);
    onComplete?.(defaultProfile);
  }, [onComplete]);

  const restartOnboarding = useCallback(() => {
    // Clear stored data
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_SESSION);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    }
    
    // Reset state
    setSession(createInitialSession());
    setCurrentStepIndex(0);
    setIsComplete(false);
    setDetectedProfile(null);
    setAnimationDirection('forward');
  }, []);

  const submitResponse = useCallback((
    partialResponse: Omit<OnboardingResponse, 'timestamp'>
  ) => {
    const response: OnboardingResponse = {
      ...partialResponse,
      timestamp: new Date(),
    };
    
    setSession(prev => {
      // Remove any existing response for this step
      const filteredResponses = prev.responses.filter(
        r => r.stepId !== response.stepId
      );
      
      return {
        ...prev,
        responses: [...filteredResponses, response],
      };
    });
  }, []);

  const updateUserName = useCallback((name: string) => {
    setSession(prev => ({
      ...prev,
      userName: name,
      userPreferences: {
        ...prev.userPreferences,
        displayName: name || 'friend',
      },
    }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setSession(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        ...prefs,
      },
    }));
  }, []);

  const completeOnboarding = useCallback(async (): Promise<UserProfile> => {
    setIsLoading(true);
    
    try {
      // Detect persona from responses
      const detectionResult = detectPersona(session.responses);
      const preferences = buildUserPreferences(session.responses);
      
      // Build final profile
      const profile: UserProfile = {
        id: session.sessionId,
        persona: detectionResult.persona,
        preferences: {
          ...DEFAULT_USER_PREFERENCES,
          ...session.userPreferences,
          ...preferences,
        },
        homeLayout: detectionResult.homeLayout,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        onboardingComplete: true,
      };
      
      // Update session
      setSession(prev => ({
        ...prev,
        completedAt: new Date(),
        detectedPersona: detectionResult.persona,
        suggestedPathway: detectionResult.suggestedPathway,
      }));
      
      // Save profile
      saveUserProfile(profile);
      
      // Update state
      setDetectedProfile(profile);
      setIsComplete(true);
      
      // Callback
      onComplete?.(profile);
      
      return profile;
    } finally {
      setIsLoading(false);
    }
  }, [session, onComplete]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: OnboardingContextValue = {
    // State
    currentStepIndex,
    totalSteps,
    isComplete,
    isLoading,
    session,
    detectedProfile,
    animationDirection,
    showSkipOption: currentStepIndex > 0, // Show skip after first step
    
    // Actions
    nextStep,
    previousStep,
    skipOnboarding,
    restartOnboarding,
    submitResponse,
    updateUserName,
    updatePreferences,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
}

// ============================================================================
// Utility Hook: Current Step
// ============================================================================

export function useCurrentOnboardingStep(): OnboardingStep | null {
  const { currentStepIndex, session } = useOnboarding();
  
  const applicableSteps = getApplicableSteps(ONBOARDING_STEPS, session.responses);
  return applicableSteps[currentStepIndex] || null;
}

// ============================================================================
// Utility Hook: Step Response
// ============================================================================

export function useStepResponse(stepId: string): OnboardingResponse | null {
  const { session } = useOnboarding();
  return session.responses.find(r => r.stepId === stepId) || null;
}
