"use client";

/**
 * HighPathway Component
 * 
 * Priority Zero - Panic, acute anxiety, crisis.
 * 
 * Key Requirements:
 * - Zero Generative AI - all content is deterministic
 * - Large-scale UI (Fitts's Law)
 * - Interactive haptics
 * - One-tap access to UK crisis lines
 * - Pre-rendered SVGs and CSS animations
 * - No API calls that can fail
 * 
 * Target: Accessible in <1.5 seconds from app launch
 */

import { useState, useCallback } from 'react';
import { CrisisContactGrid, CrisisContactButton } from '@/components/crisis';
import { BreathingExercise, BREATHING_EXERCISES } from '@/components/breathing';
import { triggerHaptic, triggerSOSHaptic } from '@/lib/haptics';
import { UK_CRISIS_RESOURCES } from '@/lib/types';

interface HighPathwayProps {
  onPathwayChange?: (pathway: 'HIGH' | 'MID' | 'LOW') => void;
  className?: string;
}

type HighView = 'main' | 'breathing' | 'contacts';

export function HighPathway({
  onPathwayChange,
  className = '',
}: HighPathwayProps) {
  const [view, setView] = useState<HighView>('main');

  const handleViewChange = useCallback((newView: HighView) => {
    triggerHaptic('heavy');
    setView(newView);
  }, []);

  const handleBreathingComplete = useCallback(() => {
    setView('main');
    // User may be calmer - suggest transition to MID
  }, []);

  // Main SOS View - Large buttons, minimal cognitive load
  if (view === 'main') {
    return (
      <div className={`flex flex-col min-h-screen p-4 ${className}`}>
        {/* Simple Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[--text]">
            You are not alone
          </h1>
          <p className="text-[--text-muted] mt-2">
            Support is here whenever you need it
          </p>
        </div>

        {/* Primary Crisis Contacts - Large Touch Targets */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          {/* Emergency */}
          <CrisisContactButton
            resource={UK_CRISIS_RESOURCES.emergency}
            variant="emergency"
            size="large"
          />

          {/* Samaritans - Primary support */}
          <CrisisContactButton
            resource={UK_CRISIS_RESOURCES.samaritans}
            variant="primary"
            size="large"
          />

          {/* Shout - Text option */}
          <CrisisContactButton
            resource={UK_CRISIS_RESOURCES.shout}
            variant="secondary"
            size="large"
          />

          {/* NHS 111 */}
          <CrisisContactButton
            resource={UK_CRISIS_RESOURCES.nhs111}
            variant="secondary"
            size="medium"
          />
        </div>

        {/* Breathing Option - Always Available */}
        <div className="mt-8">
          <button
            onClick={() => handleViewChange('breathing')}
            className="
              w-full py-6 rounded-2xl
              bg-[#14B8A6] text-white
              text-xl font-medium
              hover:opacity-90 transition-opacity
              focus:outline-none focus:ring-4 focus:ring-[--focus]
            "
          >
            <span className="mr-2">🌬️</span>
            Breathe with me
          </button>
        </div>

        {/* Feeling Better? - Subtle transition option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onPathwayChange?.('MID')}
            className="text-sm text-[--text-muted] hover:text-[--text] transition-colors"
          >
            Feeling a bit calmer? Try some coping tools
          </button>
        </div>
      </div>
    );
  }

  // Breathing View
  if (view === 'breathing') {
    return (
      <div className={`flex flex-col min-h-screen p-4 justify-center ${className}`}>
        <BreathingExercise
          exercise={BREATHING_EXERCISES.calmBreath}
          onComplete={handleBreathingComplete}
          onCancel={() => setView('main')}
        />
      </div>
    );
  }

  return null;
}
