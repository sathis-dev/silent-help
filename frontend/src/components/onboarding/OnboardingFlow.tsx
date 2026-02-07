'use client';

/**
 * Silent Help - Onboarding Flow Orchestrator
 * "The First Touch" - Main Onboarding Experience
 * 
 * This component orchestrates the entire onboarding experience:
 * - Step-by-step flow with elegant transitions
 * - Particle background effects
 * - Progress indication
 * - Responsive and accessible design
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding, useCurrentOnboardingStep } from './OnboardingProvider';
import { WelcomeStep } from './steps/WelcomeStep';
import { EmotionalEntryStep } from './steps/EmotionalEntryStep';
import { ContextualStep } from './steps/ContextualStep';
import { PersonalizationStep } from './steps/PersonalizationStep';
import { AccountStep } from './steps/AccountStep';
import { TransitionStep } from './steps/TransitionStep';
import { ParticleField } from './ui/ParticleField';
import { ProgressRing } from './ui/ProgressRing';

// ============================================================================
// Color Palette
// ============================================================================

const COLORS = {
  sanctuary: {
    deep: '#020617',
    surface: '#0F172A',
  },
  lavender: {
    primary: '#B4A7D6',
    soft: '#D8D0E8',
    glow: 'rgba(180, 167, 214, 0.25)',
  },
  mint: {
    primary: '#7FDBCA',
    soft: '#B8F0E4',
    glow: 'rgba(127, 219, 202, 0.25)',
  },
};

// ============================================================================
// Animation Variants
// ============================================================================

const pageVariants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -100 : 100,
    opacity: 0,
    scale: 0.95,
  }),
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// ============================================================================
// Main Component
// ============================================================================

export function OnboardingFlow() {
  const {
    currentStepIndex,
    totalSteps,
    isComplete,
    isLoading,
    animationDirection,
    showSkipOption,
    skipOnboarding,
    previousStep,
  } = useOnboarding();
  
  const currentStep = useCurrentOnboardingStep();

  // Don't render if complete
  if (isComplete) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-t-transparent"
          style={{ borderColor: `${COLORS.lavender.primary} transparent transparent transparent` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!currentStep) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950">
      {/* Atmospheric Background */}
      <div className="absolute inset-0">
        <ParticleField intensity={0.5} color={COLORS.lavender.primary} />
        
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 50%, 
              ${COLORS.lavender.glow} 0%, 
              ${COLORS.mint.glow} 30%,
              transparent 70%)`,
          }}
        />
        
        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(2, 6, 23, 0.8) 100%)',
          }}
        />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        {/* Back Button */}
        <motion.button
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          onClick={previousStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentStepIndex > 0 ? 1 : 0 }}
          whileHover={{ x: -2 }}
          disabled={currentStepIndex === 0}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="text-sm">Back</span>
        </motion.button>

        {/* Progress Ring */}
        <ProgressRing 
          current={currentStepIndex + 1} 
          total={totalSteps} 
          size={40}
          strokeWidth={2}
          color={COLORS.lavender.primary}
        />

        {/* Skip Button */}
        <motion.button
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          onClick={skipOnboarding}
          initial={{ opacity: 0 }}
          animate={{ opacity: showSkipOption ? 0.7 : 0 }}
          whileHover={{ opacity: 1 }}
          disabled={!showSkipOption}
        >
          Skip
        </motion.button>
      </header>

      {/* Step Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 overflow-y-auto">
        <AnimatePresence mode="wait" custom={animationDirection}>
          <motion.div
            key={currentStep.id}
            custom={animationDirection}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="w-full max-w-md"
          >
            {renderStep(currentStep.type)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Step Dots */}
      <footer className="relative z-10 flex justify-center gap-2 pb-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full"
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              backgroundColor: index === currentStepIndex 
                ? COLORS.lavender.primary 
                : index < currentStepIndex 
                  ? COLORS.mint.primary 
                  : 'rgba(148, 163, 184, 0.3)',
            }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </footer>

      {/* Trust Badge */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center text-xs text-slate-600">
        <span>🔒 Your responses stay on your device</span>
      </div>
    </div>
  );
}

// ============================================================================
// Step Renderer
// ============================================================================

function renderStep(stepType: string) {
  switch (stepType) {
    case 'welcome':
      return <WelcomeStep />;
    case 'emotional_entry':
      return <EmotionalEntryStep />;
    case 'contextual':
      return <ContextualStep />;
    case 'personalization':
      return <PersonalizationStep />;
    case 'account':
      return <AccountStep />;
    case 'transition':
      return <TransitionStep />;
    default:
      return <WelcomeStep />;
  }
}

// ============================================================================
// Export
// ============================================================================

export default OnboardingFlow;
