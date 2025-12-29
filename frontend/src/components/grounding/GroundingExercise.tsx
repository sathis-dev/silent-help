"use client";

/**
 * GroundingExercise Component
 * 
 * Interactive 5-4-3-2-1 grounding technique.
 * Helps users engage their senses to anchor to the present.
 * Part of the MID pathway toolkit.
 */

import { useState, useCallback } from 'react';
import { triggerHaptic, triggerSuccessHaptic } from '@/lib/haptics';
import type { GroundingTechnique } from '@/lib/types';

interface GroundingExerciseProps {
  technique: GroundingTechnique;
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

const senseIcons = ['👁️', '✋', '👂', '👃', '👅'];
const senseColors = ['#14B8A6', '#8B5CF6', '#3B82F6', '#F59E0B', '#EC4899'];

export function GroundingExercise({
  technique,
  onComplete,
  onCancel,
  className = '',
}: GroundingExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [responses, setResponses] = useState<string[]>([]);

  const steps = technique.steps;
  const totalSteps = steps.length;

  const handleNext = useCallback(() => {
    triggerHaptic('medium');
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsComplete(true);
      triggerSuccessHaptic();
      onComplete?.();
    }
  }, [currentStep, totalSteps, onComplete]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleCancel = () => {
    triggerHaptic('light');
    onCancel?.();
  };

  if (isComplete) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="text-2xl font-medium text-[--text] mb-2">
          You did it
        </h2>
        <p className="text-[--text-muted] mb-6">
          You engaged all five senses. Take a moment to notice how you feel now.
        </p>
        <button
          onClick={() => onComplete?.()}
          className="px-6 py-3 bg-[--primary] text-[--on-primary] rounded-xl font-medium"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium text-[--text]">
          {technique.name}
        </h2>
        <p className="text-sm text-[--text-muted] mt-1">
          {technique.description}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-3 mb-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`
              w-4 h-4 rounded-full transition-all
              ${index === currentStep 
                ? 'scale-125' 
                : 'scale-100'}
            `}
            style={{
              backgroundColor: index <= currentStep 
                ? senseColors[index] 
                : 'var(--border)',
            }}
          />
        ))}
      </div>

      {/* Current Step Card */}
      <div
        className="
          flex-1 flex flex-col items-center justify-center
          bg-[--surface-2] rounded-3xl p-8
          min-h-[300px]
        "
      >
        {/* Sense Icon */}
        <div 
          className="text-6xl mb-6"
          style={{ filter: `drop-shadow(0 0 20px ${senseColors[currentStep]}40)` }}
        >
          {senseIcons[currentStep]}
        </div>

        {/* Step Number */}
        <div 
          className="text-5xl font-bold mb-4"
          style={{ color: senseColors[currentStep] }}
        >
          {5 - currentStep}
        </div>

        {/* Instruction */}
        <p className="text-xl text-center text-[--text] leading-relaxed max-w-sm">
          {steps[currentStep]}
        </p>

        {/* Prompt */}
        <p className="text-sm text-[--text-muted] mt-4">
          Take your time. There is no rush.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6 gap-4">
        <button
          onClick={currentStep === 0 ? handleCancel : handleBack}
          className="
            px-6 py-3 rounded-xl
            text-[--text-muted] bg-[--surface-2]
            hover:bg-[--border] transition-colors
          "
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>

        <button
          onClick={handleNext}
          className="
            flex-1 px-6 py-3 rounded-xl font-medium
            text-[--on-primary] bg-[--primary]
            hover:opacity-90 transition-opacity
          "
          style={{ 
            backgroundColor: senseColors[currentStep],
          }}
        >
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}

/**
 * Pre-defined grounding techniques
 */
export const GROUNDING_TECHNIQUES: Record<string, GroundingTechnique> = {
  fiveSenses: {
    name: '5-4-3-2-1 Grounding',
    description: 'Engage your senses to anchor yourself',
    steps: [
      'Notice 5 things you can SEE around you',
      'Notice 4 things you can TOUCH or feel',
      'Notice 3 things you can HEAR',
      'Notice 2 things you can SMELL',
      'Notice 1 thing you can TASTE',
    ],
    targetDuration: 180,
  },
  mindfulCheckin: {
    name: 'Mindful Check-in',
    description: 'A gentle body and mind awareness practice',
    steps: [
      'Close your eyes if comfortable',
      'Take three slow, deep breaths',
      'Notice any tension in your body',
      'Acknowledge your thoughts without judgment',
      'Set an intention for this moment',
    ],
    targetDuration: 300,
  },
  quickGround: {
    name: 'Quick Ground',
    description: 'Fast grounding when time is short',
    steps: [
      'Press your feet firmly into the floor',
      'Notice three things you can see right now',
      'Take one slow, deep breath',
    ],
    targetDuration: 60,
  },
};
