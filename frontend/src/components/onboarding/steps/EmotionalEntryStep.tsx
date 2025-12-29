'use client';

/**
 * Silent Help - Emotional Entry Step
 * "How are you feeling?" - The core persona detection step
 * 
 * Features:
 * - Floating emotion orbs with parallax
 * - Glow effects on hover
 * - Haptic feedback patterns
 * - Tracks hesitation for persona detection
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding, useCurrentOnboardingStep } from '../OnboardingProvider';
import { EmotionOrb } from '../ui/EmotionOrb';
import type { OnboardingOption } from '@/lib/types/onboarding';

// ============================================================================
// Colors
// ============================================================================

const COLORS = {
  lavender: {
    soft: '#D8D0E8',
  },
  mint: {
    soft: '#B8F0E4',
  },
};

// ============================================================================
// Component
// ============================================================================

export function EmotionalEntryStep() {
  const { nextStep, submitResponse } = useOnboarding();
  const currentStep = useCurrentOnboardingStep();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [hesitationCount, setHesitationCount] = useState(0);
  const [interactionStart] = useState(Date.now());

  // Handle option hover (tracks hesitation)
  const handleHover = useCallback((optionId: string) => {
    if (hoveredOption && hoveredOption !== optionId) {
      setHesitationCount(prev => prev + 1);
    }
    setHoveredOption(optionId);
  }, [hoveredOption]);

  // Handle option selection
  const handleSelect = useCallback((option: OnboardingOption) => {
    setSelectedOption(option.id);
    
    // Submit response
    submitResponse({
      stepId: 'emotional_entry',
      value: option.id,
      interactionTime: Date.now() - interactionStart,
      hesitationCount,
      confidence: hesitationCount < 2 ? 0.9 : hesitationCount < 4 ? 0.7 : 0.5,
    });

    // Delay for animation
    setTimeout(() => {
      nextStep();
    }, 600);
  }, [submitResponse, nextStep, interactionStart, hesitationCount]);

  if (!currentStep?.options) return null;

  return (
    <div className="space-y-10">
      {/* Title */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 
          className="text-3xl font-light tracking-wide"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.lavender.soft} 0%, ${COLORS.mint.soft} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {currentStep.title}
        </h2>
        {currentStep.subtitle && (
          <p className="text-slate-400 text-sm">{currentStep.subtitle}</p>
        )}
      </motion.div>

      {/* Emotion Grid */}
      <motion.div
        className="grid grid-cols-2 gap-4 max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {currentStep.options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={option.id === 'here_for_someone' ? 'col-span-2' : ''}
          >
            <EmotionOrb
              option={option}
              isSelected={selectedOption === option.id}
              isHovered={hoveredOption === option.id}
              isOtherSelected={selectedOption !== null && selectedOption !== option.id}
              onSelect={() => handleSelect(option)}
              onHover={() => handleHover(option.id)}
              onHoverEnd={() => setHoveredOption(null)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Supportive footer */}
      <motion.p
        className="text-center text-slate-500 text-xs max-w-xs mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        There's no wrong answer. This helps me understand how to support you.
      </motion.p>
    </div>
  );
}

export default EmotionalEntryStep;
