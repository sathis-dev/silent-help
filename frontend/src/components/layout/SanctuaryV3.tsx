'use client';

/**
 * SanctuaryV3 - Responsive Sanctuary Layout
 * SANCTUARY V3 SPEC - Main Entry Component
 * 
 * Automatically switches between:
 * - Observatory Layout (desktop: ≥1024px)
 * - Pocket Sanctuary Layout (mobile: <1024px)
 * 
 * Integrates with:
 * - Neuro-Adaptive Engine for cognitive state
 * - Wearable integration for biometrics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ObservatoryLayout } from './ObservatoryLayout';
import { PocketSanctuaryLayout } from './PocketSanctuaryLayout';
import type { ToolType } from '@/components/tools/BentoToolCard';

// ============================================================================
// TYPES
// ============================================================================

type CognitiveState = 'calm' | 'maintenance' | 'high_stress' | 'crisis';

interface SanctuaryV3Props {
  // User data
  userName?: string;
  
  // Biometric data (from wearable or simulated)
  bpm?: number;
  hrvTrend?: 'improving' | 'stable' | 'declining';
  cognitiveState?: CognitiveState;
  
  // Callbacks
  onNavigate?: (section: string) => void;
  onToolSelect?: (tool: ToolType) => void;
  onSOSActivate?: () => void;
}

// ============================================================================
// HOOK: useMediaQuery
// ============================================================================

const useMediaQuery = (query: string): boolean => {
  // Initialize with the actual value if window is available
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // Check if window is defined (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Sync initial state if different (deferred to avoid synchronous setState in effect)
    if (mediaQuery.matches !== matches) {
      const timeout = setTimeout(() => setMatches(mediaQuery.matches), 0);
      return () => clearTimeout(timeout);
    }

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query, matches]);

  return matches;
};

// ============================================================================
// HOOK: useSimulatedBiometrics
// ============================================================================

const useSimulatedBiometrics = () => {
  const [bpm, setBpm] = useState(72);
  const [hrvTrend, setHrvTrend] = useState<'improving' | 'stable' | 'declining'>('stable');
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>('calm');

  useEffect(() => {
    // Simulate subtle BPM variations
    const interval = setInterval(() => {
      setBpm((prev) => {
        const variation = Math.random() * 4 - 2; // -2 to +2
        return Math.round(Math.max(60, Math.min(100, prev + variation)));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { bpm, hrvTrend, cognitiveState };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SanctuaryV3: React.FC<SanctuaryV3Props> = ({
  userName,
  bpm: propBpm,
  hrvTrend: propHrvTrend,
  cognitiveState: propCognitiveState,
  onNavigate,
  onToolSelect,
  onSOSActivate,
}) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const simulated = useSimulatedBiometrics();

  // Use props if provided, otherwise use simulated values
  const bpm = propBpm ?? simulated.bpm;
  const hrvTrend = propHrvTrend ?? simulated.hrvTrend;
  const cognitiveState = propCognitiveState ?? simulated.cognitiveState;

  const handleNavigate = useCallback(
    (section: string) => {
      console.log('[SanctuaryV3] Navigate to:', section);
      onNavigate?.(section);
    },
    [onNavigate]
  );

  const handleToolSelect = useCallback(
    (tool: ToolType) => {
      console.log('[SanctuaryV3] Tool selected:', tool);
      onToolSelect?.(tool);
    },
    [onToolSelect]
  );

  const handleSOSActivate = useCallback(() => {
    console.log('[SanctuaryV3] SOS Activated!');
    onSOSActivate?.();
    
    // Default SOS behavior if no handler provided
    if (!onSOSActivate) {
      // Open UK crisis resources
      window.open('https://www.samaritans.org/', '_blank');
    }
  }, [onSOSActivate]);

  // Common props for both layouts
  const layoutProps = {
    userName,
    bpm,
    hrvTrend,
    cognitiveState,
    onNavigate: handleNavigate,
    onToolSelect: handleToolSelect,
    onSOSActivate: handleSOSActivate,
  };

  return isDesktop ? (
    <ObservatoryLayout {...layoutProps} />
  ) : (
    <PocketSanctuaryLayout {...layoutProps} />
  );
};

export default SanctuaryV3;
