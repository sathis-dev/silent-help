'use client';

/**
 * Silent Help - Ghost Intervention
 * "Zero-Tap" Proactive Support - Help finds the user
 * 
 * When biometric triggers or interaction patterns indicate distress,
 * this component manifests a pre-loaded intervention without
 * requiring user action.
 * 
 * Features:
 * - Slides in from bottom with calming animation
 * - Pre-loaded breathing/grounding exercises
 * - Haptic guidance for eyes-free use
 * - Dismissible but persistent during crisis
 * - Model transparency for why it appeared
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNeuroAdaptiveContext } from '@/components/providers/NeuroAdaptiveProvider';
import { InterventionTrigger, SuggestedIntervention, INTERVENTIONS } from '@/lib/wearable-integration';
import { triggerPathwayHaptic, triggerBreathingHaptic } from '@/lib/haptics';
import { TransparencyIndicator, TransparencyDrawer } from '@/components/transparency/TransparencyDrawer';

// ============================================================================
// Types
// ============================================================================

interface GhostInterventionProps {
  // Optional: force show for testing
  forceShow?: boolean;
  intervention?: SuggestedIntervention;
}

type BreathingPhase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'rest' | 'complete';

// ============================================================================
// Breathing Exercise Component
// ============================================================================

function BreathingExercise({ 
  intervention, 
  onComplete 
}: { 
  intervention: SuggestedIntervention; 
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<BreathingPhase>('ready');
  const [cycleCount, setCycleCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const maxCycles = 4;

  const phaseConfig: Record<BreathingPhase, { duration: number; instruction: string }> = {
    ready: { duration: 0, instruction: 'When ready, tap to begin' },
    inhale: { duration: 4000, instruction: 'Breathe in...' },
    hold: { duration: 4000, instruction: 'Hold gently...' },
    exhale: { duration: 6000, instruction: 'Release slowly...' },
    rest: { duration: 2000, instruction: 'Rest...' },
    complete: { duration: 0, instruction: 'Well done. Take your time.' },
  };

  // Start the breathing cycle
  const startBreathing = () => {
    setIsActive(true);
    setPhase('inhale');
    triggerPathwayHaptic('reflect');
  };

  // Progress through phases
  useEffect(() => {
    if (!isActive || phase === 'ready' || phase === 'complete') return;

    const config = phaseConfig[phase];
    
    // Trigger haptic for current phase
    if (phase === 'inhale' || phase === 'exhale') {
      triggerBreathingHaptic(phase);
    }

    const timer = setTimeout(() => {
      switch (phase) {
        case 'inhale':
          setPhase('hold');
          break;
        case 'hold':
          setPhase('exhale');
          break;
        case 'exhale':
          setPhase('rest');
          break;
        case 'rest':
          if (cycleCount + 1 >= maxCycles) {
            setPhase('complete');
            setIsActive(false);
          } else {
            setCycleCount(c => c + 1);
            setPhase('inhale');
          }
          break;
      }
    }, config.duration);

    return () => clearTimeout(timer);
  }, [phase, isActive, cycleCount]);

  // Visual scale for breathing circle
  const getScale = () => {
    switch (phase) {
      case 'inhale': return 1.3;
      case 'hold': return 1.3;
      case 'exhale': return 1;
      case 'rest': return 1;
      default: return 1;
    }
  };

  return (
    <div className="flex flex-col items-center py-8">
      {/* Breathing Circle */}
      <motion.div
        className="relative w-40 h-40 rounded-full flex items-center justify-center"
        animate={{
          scale: getScale(),
          boxShadow: phase === 'hold' 
            ? '0 0 60px rgba(127, 219, 202, 0.4)' 
            : '0 0 30px rgba(127, 219, 202, 0.2)',
        }}
        transition={{
          duration: phaseConfig[phase].duration / 1000,
          ease: "easeInOut",
        }}
        style={{
          background: 'radial-gradient(circle at center, rgba(127, 219, 202, 0.2) 0%, rgba(127, 219, 202, 0.05) 70%)',
          border: '2px solid rgba(127, 219, 202, 0.4)',
        }}
        onClick={phase === 'ready' ? startBreathing : undefined}
      >
        {/* Inner pulse ring */}
        <motion.div
          className="absolute inset-4 rounded-full border border-[#7FDBCA]/30"
          animate={{
            scale: phase === 'inhale' || phase === 'exhale' ? [1, 1.1, 1] : 1,
            opacity: isActive ? 1 : 0.5,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Phase indicator */}
        <div className="text-center">
          {phase === 'ready' ? (
            <span className="text-[#7FDBCA] text-sm">Tap to Start</span>
          ) : phase === 'complete' ? (
            <span className="text-[#7FDBCA]">✓</span>
          ) : (
            <span className="text-3xl text-[#7FDBCA]/80">
              {cycleCount + 1}/{maxCycles}
            </span>
          )}
        </div>
      </motion.div>

      {/* Instruction */}
      <motion.p
        key={phase}
        className="mt-6 text-lg text-slate-200 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {phaseConfig[phase].instruction}
      </motion.p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: maxCycles }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < cycleCount ? 'bg-[#7FDBCA]' : 
              i === cycleCount && isActive ? 'bg-[#7FDBCA]/50' : 
              'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Complete button */}
      {phase === 'complete' && (
        <motion.button
          className="mt-8 px-8 py-3 bg-[#7FDBCA]/20 border border-[#7FDBCA]/40 rounded-full text-[#7FDBCA] font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onComplete}
          whileTap={{ scale: 0.95 }}
        >
          I'm feeling better
        </motion.button>
      )}
    </div>
  );
}

// ============================================================================
// Grounding Exercise Component
// ============================================================================

function GroundingExercise({ 
  intervention, 
  onComplete 
}: { 
  intervention: SuggestedIntervention; 
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = intervention.content.steps || [];

  const stepIcons = ['👁️', '✋', '👂', '👃', '👅'];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
      triggerPathwayHaptic('reflect');
    } else {
      onComplete();
    }
  };

  return (
    <div className="py-6 px-2">
      {/* Progress bar */}
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-[#B4A7D6]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Current step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="text-center"
        >
          <span className="text-4xl mb-4 block">{stepIcons[currentStep]}</span>
          <p className="text-xl text-slate-200 mb-8">{steps[currentStep]}</p>
        </motion.div>
      </AnimatePresence>

      {/* Action button */}
      <motion.button
        onClick={nextStep}
        className="w-full py-4 bg-[#B4A7D6]/20 border border-[#B4A7D6]/40 rounded-2xl text-[#B4A7D6] font-medium"
        whileTap={{ scale: 0.98 }}
      >
        {currentStep < steps.length - 1 ? 'Next' : 'Complete'}
      </motion.button>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= currentStep ? 'bg-[#B4A7D6]' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Ghost Intervention Component
// ============================================================================

export function GhostIntervention({ forceShow, intervention: forcedIntervention }: GhostInterventionProps) {
  const { pendingIntervention, dismissIntervention } = useNeuroAdaptiveContext();
  const [showTransparency, setShowTransparency] = useState(false);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  
  // Use forced intervention or pending from context
  const trigger = forceShow 
    ? { 
        type: 'hrv_drop' as const, 
        severity: 'high' as const, 
        reason: 'Demo trigger', 
        suggestedIntervention: forcedIntervention || INTERVENTIONS.box_breathing_2min,
        timestamp: new Date(),
      }
    : pendingIntervention;

  const intervention = trigger?.suggestedIntervention;
  const isVisible = forceShow || !!pendingIntervention;

  // Trigger haptic when intervention appears
  useEffect(() => {
    if (isVisible && intervention) {
      triggerPathwayHaptic('overwhelmed');
    }
  }, [isVisible, intervention]);

  const handleDismiss = () => {
    setIsExerciseActive(false);
    dismissIntervention();
  };

  const handleComplete = () => {
    triggerPathwayHaptic('reflect');
    handleDismiss();
  };

  const startExercise = () => {
    setIsExerciseActive(true);
  };

  if (!isVisible || !intervention || !trigger) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with breathing pulse */}
          <motion.div
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
            animate={{
              backgroundColor: isExerciseActive 
                ? ['rgba(2, 6, 23, 0.95)', 'rgba(2, 6, 23, 0.9)', 'rgba(2, 6, 23, 0.95)']
                : 'rgba(2, 6, 23, 0.95)',
            }}
            transition={{ duration: 4, repeat: Infinity }}
            onClick={!isExerciseActive ? handleDismiss : undefined}
          />

          {/* Content */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-t-3xl border-t border-slate-700/50 p-6">
              {/* Handle */}
              <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">
                    {intervention.content.title}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {intervention.content.description}
                  </p>
                </div>
                
                {/* Transparency indicator */}
                <TransparencyIndicator onClick={() => setShowTransparency(true)} />
              </div>

              {/* Reason badge */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-slate-800/50 rounded-xl">
                <span className="text-amber-400">⚡</span>
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Suggested because: </span>
                  {trigger.reason}
                </p>
              </div>

              {/* Exercise content */}
              {isExerciseActive ? (
                intervention.type === 'breathing' || intervention.type === 'panic_reset' ? (
                  <BreathingExercise 
                    intervention={intervention} 
                    onComplete={handleComplete} 
                  />
                ) : intervention.type === 'grounding' ? (
                  <GroundingExercise 
                    intervention={intervention} 
                    onComplete={handleComplete} 
                  />
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-slate-300">{intervention.content.description}</p>
                  </div>
                )
              ) : (
                /* Start prompt */
                <div className="py-6 space-y-4">
                  <motion.button
                    onClick={startExercise}
                    className="w-full py-4 bg-[#7FDBCA]/20 border border-[#7FDBCA]/40 rounded-2xl text-[#7FDBCA] font-medium text-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start {intervention.duration}s Reset
                  </motion.button>
                  
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 text-slate-500 text-sm"
                  >
                    Not right now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Transparency drawer */}
      <TransparencyDrawer
        isOpen={showTransparency}
        onClose={() => setShowTransparency(false)}
      />
    </>
  );
}
