"use client";

/**
 * MidPathway Component
 * 
 * The Bridge - Overwhelmed, "stuck," brain fog.
 * 
 * Key Features:
 * - Guided labels
 * - Body Scan interface
 * - Help user name the feeling
 * - 3 specific actions: 5-4-3-2-1 Grounding, Write one sentence, Cold water splash
 */

import { useState, useCallback } from 'react';
import { BreathingExercise, BREATHING_EXERCISES } from '@/components/breathing';
import { GroundingExercise, GROUNDING_TECHNIQUES, BodyScan } from '@/components/grounding';
import { CrisisContactButton } from '@/components/crisis';
import { triggerHaptic } from '@/lib/haptics';
import { UK_CRISIS_RESOURCES } from '@/lib/types';

interface MidPathwayProps {
  onPathwayChange?: (pathway: 'HIGH' | 'MID' | 'LOW') => void;
  className?: string;
}

type MidView = 'main' | 'grounding' | 'breathing' | 'body-scan' | 'action';
type ActionType = 'cold-water' | 'write-sentence' | 'contact';

interface ActionInfo {
  id: ActionType;
  icon: string;
  label: string;
  description: string;
  color: string;
}

const ACTIONS: ActionInfo[] = [
  {
    id: 'cold-water',
    icon: '💧',
    label: 'Cold Water',
    description: 'Splash cold water on your face to reset your nervous system',
    color: '#0EA5E9',
  },
];

export function MidPathway({
  onPathwayChange,
  className = '',
}: MidPathwayProps) {
  const [view, setView] = useState<MidView>('main');
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);

  const handleToolSelect = useCallback((tool: MidView) => {
    triggerHaptic('medium');
    setView(tool);
  }, []);

  const handleActionSelect = useCallback((action: ActionType) => {
    triggerHaptic('medium');
    setCurrentAction(action);
    setView('action');
  }, []);

  const handleComplete = useCallback(() => {
    setView('main');
    setCurrentAction(null);
  }, []);

  // Main Tool Selection View
  if (view === 'main') {
    return (
      <div className={`flex flex-col min-h-screen p-4 ${className}`}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-medium text-[--text]">
            Let's find what helps
          </h1>
          <p className="text-[--text-muted] mt-1">
            Small steps can make a difference
          </p>
        </div>

        {/* Primary Tools Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 5-4-3-2-1 Grounding */}
          <button
            onClick={() => handleToolSelect('grounding')}
            className="
              flex flex-col items-center justify-center
              p-6 rounded-2xl bg-[--surface-2]
              border-2 border-transparent
              hover:border-[#8B5CF6] transition-colors
              min-h-[140px]
            "
          >
            <span className="text-4xl mb-2">🖐️</span>
            <span className="font-medium text-[--text]">5-4-3-2-1</span>
            <span className="text-xs text-[--text-muted] mt-1">Grounding</span>
          </button>

          {/* Body Scan */}
          <button
            onClick={() => handleToolSelect('body-scan')}
            className="
              flex flex-col items-center justify-center
              p-6 rounded-2xl bg-[--surface-2]
              border-2 border-transparent
              hover:border-[#F59E0B] transition-colors
              min-h-[140px]
            "
          >
            <span className="text-4xl mb-2">🧘</span>
            <span className="font-medium text-[--text]">Body Scan</span>
            <span className="text-xs text-[--text-muted] mt-1">Notice tension</span>
          </button>

          {/* Box Breathing */}
          <button
            onClick={() => handleToolSelect('breathing')}
            className="
              flex flex-col items-center justify-center
              p-6 rounded-2xl bg-[--surface-2]
              border-2 border-transparent
              hover:border-[#14B8A6] transition-colors
              min-h-[140px]
            "
          >
            <span className="text-4xl mb-2">🔲</span>
            <span className="font-medium text-[--text]">Box Breathing</span>
            <span className="text-xs text-[--text-muted] mt-1">Calm breath</span>
          </button>

          {/* Cold Water */}
          <button
            onClick={() => handleActionSelect('cold-water')}
            className="
              flex flex-col items-center justify-center
              p-6 rounded-2xl bg-[--surface-2]
              border-2 border-transparent
              hover:border-[#0EA5E9] transition-colors
              min-h-[140px]
            "
          >
            <span className="text-4xl mb-2">💧</span>
            <span className="font-medium text-[--text]">Cold Water</span>
            <span className="text-xs text-[--text-muted] mt-1">Reset</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          {/* Write One Sentence - Links to Journal */}
          <button
            onClick={() => onPathwayChange?.('LOW')}
            className="
              w-full flex items-center gap-4 p-4 rounded-xl
              bg-[--surface-2] hover:bg-[--border] transition-colors
            "
          >
            <span className="text-2xl">✏️</span>
            <div className="text-left">
              <span className="font-medium text-[--text]">Write one sentence</span>
              <p className="text-xs text-[--text-muted]">Just one thought, no pressure</p>
            </div>
          </button>

          {/* Talk to Someone */}
          <button
            onClick={() => handleActionSelect('contact')}
            className="
              w-full flex items-center gap-4 p-4 rounded-xl
              bg-[--surface-2] hover:bg-[--border] transition-colors
            "
          >
            <span className="text-2xl">📞</span>
            <div className="text-left">
              <span className="font-medium text-[--text]">Talk to someone</span>
              <p className="text-xs text-[--text-muted]">Samaritans or Shout</p>
            </div>
          </button>
        </div>

        {/* Pathway Navigation */}
        <div className="mt-auto pt-6 flex justify-between">
          <button
            onClick={() => onPathwayChange?.('HIGH')}
            className="text-sm text-[--text-muted] hover:text-[--danger] transition-colors"
          >
            I need more support
          </button>
          <button
            onClick={() => onPathwayChange?.('LOW')}
            className="text-sm text-[--text-muted] hover:text-[--primary] transition-colors"
          >
            I feel okay to reflect
          </button>
        </div>
      </div>
    );
  }

  // Grounding View
  if (view === 'grounding') {
    return (
      <div className={`flex flex-col min-h-screen p-4 justify-center ${className}`}>
        <GroundingExercise
          technique={GROUNDING_TECHNIQUES.fiveSenses}
          onComplete={handleComplete}
          onCancel={handleComplete}
        />
      </div>
    );
  }

  // Breathing View
  if (view === 'breathing') {
    return (
      <div className={`flex flex-col min-h-screen p-4 justify-center ${className}`}>
        <BreathingExercise
          exercise={BREATHING_EXERCISES.boxBreathing}
          onComplete={handleComplete}
          onCancel={handleComplete}
        />
      </div>
    );
  }

  // Body Scan View
  if (view === 'body-scan') {
    return (
      <div className={`flex flex-col min-h-screen p-4 justify-center ${className}`}>
        <BodyScan
          onComplete={handleComplete}
          onCancel={handleComplete}
        />
      </div>
    );
  }

  // Action View
  if (view === 'action') {
    if (currentAction === 'cold-water') {
      return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${className}`}>
          <div className="text-6xl mb-6">💧</div>
          <h2 className="text-2xl font-medium text-[--text] mb-4 text-center">
            Cold Water Reset
          </h2>
          <div className="space-y-4 text-center text-[--text-muted] max-w-sm">
            <p>1. Go to your sink or bathroom</p>
            <p>2. Run cold water</p>
            <p>3. Splash cold water on your face and wrists</p>
            <p>4. Take 3 slow breaths</p>
          </div>
          <p className="mt-6 text-sm text-[--text-muted]">
            This activates your dive reflex and helps calm your nervous system
          </p>
          <button
            onClick={handleComplete}
            className="mt-8 px-6 py-3 bg-[--primary] text-[--on-primary] rounded-xl font-medium"
          >
            Done
          </button>
        </div>
      );
    }

    if (currentAction === 'contact') {
      return (
        <div className={`flex flex-col min-h-screen p-4 ${className}`}>
          <h2 className="text-xl font-medium text-[--text] mb-4 text-center">
            Talk to someone
          </h2>
          <p className="text-[--text-muted] mb-6 text-center">
            These services are free, confidential, and available 24/7
          </p>

          <div className="space-y-4">
            <CrisisContactButton
              resource={UK_CRISIS_RESOURCES.samaritans}
              variant="primary"
              size="large"
            />
            <CrisisContactButton
              resource={UK_CRISIS_RESOURCES.shout}
              variant="secondary"
              size="large"
            />
          </div>

          <button
            onClick={handleComplete}
            className="mt-8 text-[--text-muted] hover:text-[--text]"
          >
            Go back
          </button>
        </div>
      );
    }
  }

  return null;
}
