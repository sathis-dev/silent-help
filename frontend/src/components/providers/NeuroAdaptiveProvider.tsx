'use client';

/**
 * Silent Help - Neuro-Adaptive Layout Provider
 * "The Sentient UI" - Interface that physically changes based on cognitive load
 * 
 * This provider wraps the app and automatically adjusts:
 * - Icon sizes (up to 40% larger in high stress)
 * - Contrast levels (boosted for crisis)
 * - Animation speeds (slower for calm states)
 * - Layout complexity (simplified in stress)
 * - Color atmosphere (teal → amber → red based on state)
 * 
 * Usage:
 * <NeuroAdaptiveProvider>
 *   <App />
 * </NeuroAdaptiveProvider>
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  NeuroAdaptiveState, 
  UIOverrides, 
  CognitiveState,
  useNeuroAdaptive,
  initNeuroAdaptiveEngine,
  STATE_UI_OVERRIDES,
} from '@/lib/neuro-adaptive-engine';
import { useWearables, InterventionTrigger } from '@/lib/wearable-integration';

// ============================================================================
// Context Types
// ============================================================================

interface NeuroAdaptiveContextValue {
  // Current state
  cognitiveState: CognitiveState;
  confidence: number;
  uiOverrides: UIOverrides;
  
  // Intervention
  pendingIntervention: InterventionTrigger | null;
  dismissIntervention: () => void;
  
  // Manual controls
  forceState: (state: CognitiveState, reason?: string) => void;
  resetToAuto: () => void;
  
  // Feature flags
  isSimplifiedLayout: boolean;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  
  // Biometrics
  isWearableConnected: boolean;
  lastBiometricSync: Date | null;
  
  // Transparency
  stateReason: string;
}

const defaultOverrides = STATE_UI_OVERRIDES.calm;

const NeuroAdaptiveContext = createContext<NeuroAdaptiveContextValue>({
  cognitiveState: 'calm',
  confidence: 0.5,
  uiOverrides: defaultOverrides,
  pendingIntervention: null,
  dismissIntervention: () => {},
  forceState: () => {},
  resetToAuto: () => {},
  isSimplifiedLayout: false,
  isHighContrast: false,
  isReducedMotion: false,
  isWearableConnected: false,
  lastBiometricSync: null,
  stateReason: 'initializing',
});

// ============================================================================
// CSS Variable Injector
// ============================================================================

function injectCSSVariables(overrides: UIOverrides) {
  const root = document.documentElement;
  
  // Icon & font scaling
  root.style.setProperty('--neuro-icon-scale', overrides.iconScale.toString());
  root.style.setProperty('--neuro-font-scale', overrides.fontScale.toString());
  
  // Contrast boost (0-1)
  root.style.setProperty('--neuro-contrast-boost', overrides.contrastBoost.toString());
  
  // Animation timing
  root.style.setProperty('--neuro-animation-speed', overrides.animationSpeed.toString());
  
  // Atmosphere colors
  root.style.setProperty('--neuro-atmosphere-primary', overrides.atmosphereColor.primary);
  root.style.setProperty('--neuro-atmosphere-secondary', overrides.atmosphereColor.secondary);
  root.style.setProperty('--neuro-atmosphere-accent', overrides.atmosphereColor.accent);
  root.style.setProperty('--neuro-atmosphere-glow', overrides.atmosphereColor.glow);
  
  // Boolean flags as data attributes
  root.setAttribute('data-simplified', overrides.simplifiedLayout.toString());
  root.setAttribute('data-reduced-motion', overrides.reducedMotion.toString());
  root.setAttribute('data-high-contrast', (overrides.contrastBoost > 0.5).toString());
}

// ============================================================================
// Provider Component
// ============================================================================

interface NeuroAdaptiveProviderProps {
  children: ReactNode;
  enableBiometrics?: boolean;
  enableAutoState?: boolean;
  defaultState?: CognitiveState;
}

export function NeuroAdaptiveProvider({
  children,
  enableBiometrics = true,
  enableAutoState = true,
  defaultState = 'calm',
}: NeuroAdaptiveProviderProps) {
  // Core neuro-adaptive state
  const neuroAdaptive = useNeuroAdaptive();
  
  // Wearable integration
  const wearables = useWearables();
  
  // Manual override state
  const [manualState, setManualState] = useState<CognitiveState | null>(null);
  const [stateReason, setStateReason] = useState<string>('initializing');
  
  // Pending intervention (from biometrics)
  const [pendingIntervention, setPendingIntervention] = useState<InterventionTrigger | null>(null);

  // Initialize engine on mount
  useEffect(() => {
    if (enableAutoState) {
      initNeuroAdaptiveEngine();
    }
  }, [enableAutoState]);

  // Extract stable function references
  const { updateBiometrics, forceState } = neuroAdaptive;

  // Sync biometric data to neuro-adaptive engine
  useEffect(() => {
    if (enableBiometrics && wearables.biometrics && updateBiometrics) {
      updateBiometrics(wearables.biometrics);
    }
  }, [enableBiometrics, wearables.biometrics, updateBiometrics]);

  // Handle intervention triggers from wearables
  useEffect(() => {
    if (wearables.latestTrigger) {
      setPendingIntervention(wearables.latestTrigger);
      
      // Auto-transition to high stress if critical trigger
      if (wearables.latestTrigger.severity === 'critical' && forceState) {
        forceState('high_stress', wearables.latestTrigger.reason);
      }
    }
  }, [wearables.latestTrigger, forceState]);

  // Determine effective state and overrides
  const effectiveState = manualState ?? neuroAdaptive.state?.currentState ?? defaultState;
  const effectiveOverrides = neuroAdaptive.state?.uiOverrides ?? STATE_UI_OVERRIDES[effectiveState];
  const effectiveConfidence = neuroAdaptive.state?.confidence ?? 0.5;

  // Update state reason for transparency
  useEffect(() => {
    if (manualState) {
      setStateReason('Manual override');
    } else if (neuroAdaptive.state?.stateHistory?.length) {
      const lastTransition = neuroAdaptive.state.stateHistory[neuroAdaptive.state.stateHistory.length - 1];
      setStateReason(lastTransition.trigger);
    } else {
      setStateReason('Baseline state');
    }
  }, [manualState, neuroAdaptive.state?.stateHistory]);

  // Inject CSS variables whenever overrides change
  useEffect(() => {
    injectCSSVariables(effectiveOverrides);
  }, [effectiveOverrides]);

  // Context value
  const contextValue: NeuroAdaptiveContextValue = {
    cognitiveState: effectiveState,
    confidence: effectiveConfidence,
    uiOverrides: effectiveOverrides,
    
    pendingIntervention,
    dismissIntervention: () => {
      setPendingIntervention(null);
      wearables.clearTrigger();
    },
    
    forceState: (state: CognitiveState, reason?: string) => {
      setManualState(state);
      if (reason) setStateReason(reason);
    },
    resetToAuto: () => {
      setManualState(null);
    },
    
    isSimplifiedLayout: effectiveOverrides.simplifiedLayout,
    isHighContrast: effectiveOverrides.contrastBoost > 0.5,
    isReducedMotion: effectiveOverrides.reducedMotion,
    
    isWearableConnected: wearables.isConnected,
    lastBiometricSync: wearables.biometrics.lastSync ?? null,
    
    stateReason,
  };

  return (
    <NeuroAdaptiveContext.Provider value={contextValue}>
      {children}
    </NeuroAdaptiveContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useNeuroAdaptiveContext() {
  const context = useContext(NeuroAdaptiveContext);
  if (!context) {
    throw new Error('useNeuroAdaptiveContext must be used within NeuroAdaptiveProvider');
  }
  return context;
}

// ============================================================================
// Utility Components
// ============================================================================

/**
 * Wrapper that scales its children based on cognitive state
 */
export function AdaptiveScale({ children }: { children: ReactNode }) {
  const { uiOverrides } = useNeuroAdaptiveContext();
  
  return (
    <div 
      style={{ 
        transform: `scale(${uiOverrides.iconScale})`,
        transformOrigin: 'center',
        transition: `transform ${0.3 / uiOverrides.animationSpeed}s ease-out`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Conditionally renders children only in non-simplified mode
 */
export function NonEssential({ children }: { children: ReactNode }) {
  const { isSimplifiedLayout } = useNeuroAdaptiveContext();
  
  if (isSimplifiedLayout) {
    return null;
  }
  
  return <>{children}</>;
}

/**
 * Wrapper for animations that respects reduced motion
 */
export function SafeMotion({ 
  children, 
  fallback 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isReducedMotion } = useNeuroAdaptiveContext();
  
  if (isReducedMotion && fallback) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
