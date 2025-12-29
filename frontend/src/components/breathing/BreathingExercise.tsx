"use client";

/**
 * BreathingExercise Component
 * 
 * Pre-rendered SVG with lightweight CSS animations.
 * Zero API calls - works offline.
 * Haptic feedback for each phase.
 * 
 * Target: Under 60 seconds to calm (HIGH pathway)
 */

import { useState, useEffect, useCallback } from 'react';
import { triggerBreathingHaptic, triggerSuccessHaptic } from '@/lib/haptics';
import type { BreathingExercise as BreathingExerciseType } from '@/lib/types';

interface BreathingExerciseProps {
  exercise: BreathingExerciseType;
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

type BreathingPhase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'complete';

const phaseInstructions: Record<BreathingPhase, string> = {
  ready: 'Tap to begin',
  inhale: 'Breathe in',
  hold: 'Hold',
  exhale: 'Breathe out',
  complete: 'Well done',
};

const phaseColors: Record<BreathingPhase, string> = {
  ready: '#6B7280',
  inhale: '#14B8A6',
  hold: '#8B5CF6',
  exhale: '#3B82F6',
  complete: '#10B981',
};

export function BreathingExercise({
  exercise,
  onComplete,
  onCancel,
  className = '',
}: BreathingExerciseProps) {
  const [phase, setPhase] = useState<BreathingPhase>('ready');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Calculate animation duration for each phase
  const getAnimationDuration = useCallback((p: BreathingPhase): number => {
    switch (p) {
      case 'inhale': return exercise.inhaleSeconds;
      case 'hold': return exercise.holdSeconds;
      case 'exhale': return exercise.exhaleSeconds;
      default: return 0;
    }
  }, [exercise]);

  // Start the exercise
  const start = useCallback(() => {
    setIsActive(true);
    setPhase('inhale');
    setCurrentCycle(1);
    setSecondsRemaining(exercise.inhaleSeconds);
    triggerBreathingHaptic('inhale');
  }, [exercise.inhaleSeconds]);

  // Handle phase transitions
  useEffect(() => {
    if (!isActive || phase === 'ready' || phase === 'complete') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Move to next phase
          let nextPhase: BreathingPhase;
          let nextDuration: number;

          if (phase === 'inhale') {
            nextPhase = 'hold';
            nextDuration = exercise.holdSeconds;
            triggerBreathingHaptic('hold');
          } else if (phase === 'hold') {
            nextPhase = 'exhale';
            nextDuration = exercise.exhaleSeconds;
            triggerBreathingHaptic('exhale');
          } else {
            // End of exhale - check if more cycles
            if (currentCycle < exercise.cycles) {
              setCurrentCycle((c) => c + 1);
              nextPhase = 'inhale';
              nextDuration = exercise.inhaleSeconds;
              triggerBreathingHaptic('inhale');
            } else {
              // Exercise complete
              nextPhase = 'complete';
              nextDuration = 0;
              setIsActive(false);
              triggerSuccessHaptic();
              onComplete?.();
            }
          }

          setPhase(nextPhase);
          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, currentCycle, exercise, onComplete]);

  // Calculate circle scale for animation
  const getCircleScale = (): number => {
    if (phase === 'inhale') {
      const progress = 1 - (secondsRemaining / exercise.inhaleSeconds);
      return 0.5 + (progress * 0.5); // Scale from 0.5 to 1.0
    }
    if (phase === 'hold') {
      return 1.0;
    }
    if (phase === 'exhale') {
      const progress = 1 - (secondsRemaining / exercise.exhaleSeconds);
      return 1.0 - (progress * 0.5); // Scale from 1.0 to 0.5
    }
    if (phase === 'complete') {
      return 0.8;
    }
    return 0.5;
  };

  const handleTap = () => {
    if (phase === 'ready') {
      start();
    } else if (phase === 'complete') {
      onComplete?.();
    }
  };

  const handleCancel = () => {
    setIsActive(false);
    setPhase('ready');
    setCurrentCycle(0);
    onCancel?.();
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Exercise Name */}
      <h2 className="text-xl font-medium text-[--text-muted] mb-2">
        {exercise.name}
      </h2>

      {/* SVG Breathing Circle */}
      <button
        onClick={handleTap}
        className="relative w-64 h-64 focus:outline-none focus:ring-4 focus:ring-[--focus] rounded-full"
        aria-label={phaseInstructions[phase]}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          role="img"
          aria-label="Breathing animation"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />

          {/* Animated breathing circle */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill={phaseColors[phase]}
            fillOpacity="0.2"
            stroke={phaseColors[phase]}
            strokeWidth="4"
            style={{
              transform: `scale(${getCircleScale()})`,
              transformOrigin: 'center',
              transition: `transform ${getAnimationDuration(phase)}s ease-in-out`,
            }}
          />

          {/* Center content */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fill={phaseColors[phase]}
            fontSize="18"
            fontWeight="500"
            className="select-none"
          >
            {phaseInstructions[phase]}
          </text>

          {phase !== 'ready' && phase !== 'complete' && (
            <text
              x="100"
              y="120"
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="24"
              fontWeight="600"
              className="select-none"
            >
              {secondsRemaining}
            </text>
          )}
        </svg>
      </button>

      {/* Cycle Progress */}
      {isActive && (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: exercise.cycles }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < currentCycle ? 'bg-[--primary]' : 'bg-[--border]'
              }`}
            />
          ))}
        </div>
      )}

      {/* Cancel Button */}
      {isActive && (
        <button
          onClick={handleCancel}
          className="mt-6 text-sm text-[--text-muted] hover:text-[--text] transition-colors"
        >
          Stop
        </button>
      )}

      {/* Description */}
      {phase === 'ready' && (
        <p className="mt-4 text-center text-[--text-muted] max-w-xs">
          {exercise.description}
        </p>
      )}

      {/* Completion Message */}
      {phase === 'complete' && (
        <div className="mt-4 text-center">
          <p className="text-[--text] mb-4">
            You completed {exercise.cycles} breathing cycles
          </p>
          <button
            onClick={() => onComplete?.()}
            className="px-6 py-3 bg-[--primary] text-[--on-primary] rounded-xl font-medium"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Pre-defined breathing exercises
 */
export const BREATHING_EXERCISES: Record<string, BreathingExerciseType> = {
  calmBreath: {
    name: 'Calm Breath',
    description: 'A simple pattern to slow your breathing',
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 6,
    cycles: 3,
    totalDuration: 42,
  },
  boxBreathing: {
    name: 'Box Breathing',
    description: 'Square breathing to restore calm',
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 4,
    cycles: 4,
    totalDuration: 48,
  },
  relaxation478: {
    name: '4-7-8 Relaxation',
    description: 'A deeper practice for relaxation',
    inhaleSeconds: 4,
    holdSeconds: 7,
    exhaleSeconds: 8,
    cycles: 4,
    totalDuration: 76,
  },
  quickCalm: {
    name: 'Quick Calm',
    description: 'Fast relief when you need it now',
    inhaleSeconds: 3,
    holdSeconds: 2,
    exhaleSeconds: 4,
    cycles: 3,
    totalDuration: 27,
  },
};
